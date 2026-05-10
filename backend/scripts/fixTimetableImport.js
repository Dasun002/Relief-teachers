import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseAndValidateXML } from '../services/xmlParser.js';
import { transformTimetableData } from '../services/timetableTransformer.js';
import TimetableService from '../services/TimetableService.js';
import Teacher from '../models/Teacher.js';
import Timetable from '../models/Timetable.js';
import logger from '../utils/logger.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function fixTimetableImport() {
  try {
    console.log('🚀 Starting Timetable Import Fix\n');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Check current state
    console.log('📊 CURRENT STATE\n');
    const teacherCount = await Teacher.countDocuments();
    const timetableCount = await Timetable.countDocuments();
    const teachersWithSchedule = (await Timetable.distinct('teacher')).length;
    
    console.log(`  Teachers in database: ${teacherCount}`);
    console.log(`  Timetable entries: ${timetableCount}`);
    console.log(`  Teachers with schedules: ${teachersWithSchedule}`);
    console.log(`  Teachers without schedules: ${teacherCount - teachersWithSchedule}\n`);

    // Step 2: Read XML file
    console.log('📄 Reading XML file...');
    const xmlPath = path.join(__dirname, '../../for the data base.xml');
    
    if (!fs.existsSync(xmlPath)) {
      throw new Error(`XML file not found at: ${xmlPath}`);
    }
    
    const xmlString = fs.readFileSync(xmlPath, 'utf-8');
    console.log('✅ XML file loaded\n');

    // Step 3: Parse and validate XML
    console.log('🔍 Parsing XML...');
    const parsedXML = await parseAndValidateXML(xmlString);
    console.log('✅ XML parsed successfully\n');

    // Step 4: Transform data
    console.log('🔄 Transforming data...');
    const transformedData = transformTimetableData(parsedXML);
    console.log('✅ Data transformed\n');
    console.log(`  Teachers in XML: ${transformedData.teachers.length}`);
    console.log(`  Timetable entries to import: ${transformedData.timetableEntries.length}\n`);

    // Step 5: Clear existing timetable
    console.log('🗑️  Clearing existing timetable...');
    const deleteResult = await Timetable.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing entries\n`);

    // Step 6: Process teachers
    console.log('👥 Processing teachers...');
    const teacherMap = {};
    let teachersCreated = 0;
    let teachersUpdated = 0;
    
    for (const teacherData of transformedData.teachers) {
      try {
        let teacher = await Teacher.findOne({ name: teacherData.name });
        
        if (!teacher) {
          teacher = new Teacher({
            name: teacherData.name,
            subjects: ['General'],
          });
          await teacher.save();
          teachersCreated++;
          console.log(`  ✅ Created: ${teacherData.name}`);
        } else {
          teachersUpdated++;
        }
        
        teacherMap[teacherData.ascId] = teacher._id;
      } catch (error) {
        console.log(`  ❌ Failed: ${teacherData.name} - ${error.message}`);
      }
    }
    
    console.log(`\n  Created: ${teachersCreated} teachers`);
    console.log(`  Updated: ${teachersUpdated} teachers\n`);

    // Step 7: Create period lookup map
    const periodMap = {};
    transformedData.periods.forEach((p) => {
      periodMap[p.period] = p;
    });

    // Step 8: Import timetable entries
    console.log('📅 Importing timetable entries...');
    const timetableEntries = [];
    let skipped = 0;
    
    for (const entry of transformedData.timetableEntries) {
      const teacherId = teacherMap[entry.teacherAscId];
      
      if (!teacherId) {
        console.log(`  ⚠️  Teacher not found: ${entry.teacherName} (${entry.teacherAscId})`);
        skipped++;
        continue;
      }

      const periodInfo = periodMap[entry.period];
      
      if (!periodInfo) {
        console.log(`  ⚠️  Period not found: ${entry.period}`);
        skipped++;
        continue;
      }

      const formatTime = (time) => {
        if (!time) return null;
        const parts = time.split(':');
        if (parts.length !== 2) return time;
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
      };
      
      timetableEntries.push({
        class: entry.class,
        period: entry.period,
        day: entry.day,
        teacher: teacherId,
        subject: entry.subject,
        startTime: formatTime(periodInfo.startTime),
        endTime: formatTime(periodInfo.endTime),
        alternateTeachers: entry.alternateTeacherIds
          .map((id) => teacherMap[id])
          .filter((id) => id),
      });
    }

    console.log(`  Prepared ${timetableEntries.length} entries`);
    console.log(`  Skipped ${skipped} entries\n`);

    // Step 9: Bulk import
    console.log('💾 Saving to database...');
    const importResult = await TimetableService.bulkImport(timetableEntries);
    
    console.log(`\n✅ Import completed!`);
    console.log(`  Imported: ${importResult.imported}`);
    console.log(`  Updated: ${importResult.updated}`);
    console.log(`  Errors: ${importResult.errors.length}\n`);

    if (importResult.errors.length > 0) {
      console.log('⚠️  ERRORS (first 10):\n');
      importResult.errors.slice(0, 10).forEach((err, index) => {
        console.log(`  ${index + 1}. ${err.error}`);
        console.log(`     Class: ${err.entry.class}, Period: ${err.entry.period}, Day: ${err.entry.day}\n`);
      });
    }

    // Step 10: Verify results
    console.log('🔍 Verifying results...\n');
    const newTimetableCount = await Timetable.countDocuments();
    const newTeachersWithSchedule = (await Timetable.distinct('teacher')).length;
    const newTeacherCount = await Teacher.countDocuments();
    
    console.log('📊 FINAL STATE\n');
    console.log(`  Teachers in database: ${newTeacherCount}`);
    console.log(`  Timetable entries: ${newTimetableCount}`);
    console.log(`  Teachers with schedules: ${newTeachersWithSchedule}`);
    console.log(`  Teachers without schedules: ${newTeacherCount - newTeachersWithSchedule}\n`);

    // Check specific teachers
    console.log('🎯 Checking previously missing teachers:\n');
    const problematicTeachers = [
      'Miss Jayathissa Jeewani',
      'Miss Ranaweera Ishani',
      'Mr Aruna'
    ];
    
    for (const teacherName of problematicTeachers) {
      const teacher = await Teacher.findOne({ name: teacherName });
      if (teacher) {
        const count = await Timetable.countDocuments({ teacher: teacher._id });
        if (count > 0) {
          console.log(`  ✅ ${teacherName.padEnd(30)} - ${count} periods`);
        } else {
          console.log(`  ❌ ${teacherName.padEnd(30)} - NO SCHEDULE`);
        }
      } else {
        console.log(`  ⚠️  ${teacherName.padEnd(30)} - NOT FOUND IN DATABASE`);
      }
    }

    console.log('\n✅ Timetable import fix completed!');
    console.log('\n💡 Next steps:');
    console.log('   1. Refresh the Timetable page in your browser');
    console.log('   2. Go to Attendance → Period-Based Attendance');
    console.log('   3. Select any teacher and date');
    console.log('   4. You should now see their scheduled periods!\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixTimetableImport();

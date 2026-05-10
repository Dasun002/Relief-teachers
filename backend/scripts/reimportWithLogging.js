import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { parseAndValidateXML } from '../services/xmlParser.js';
import { transformTimetableData } from '../services/timetableTransformer.js';
import Teacher from '../models/Teacher.js';
import Timetable from '../models/Timetable.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const problematicTeacherIds = [
  '6981D88225D052F9', // Miss Jayathissa Jeewani
  '959DC2B239815572', // Miss Ranaweera Ishani
  'D22BDBC8CF81F40D', // Mr Aruna
];

async function reimportWithLogging() {
  try {
    console.log('=== RE-IMPORTING TIMETABLE WITH DETAILED LOGGING ===\n');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Read XML file
    const xmlPath = path.join(__dirname, '../../for the data base.xml');
    const xmlString = fs.readFileSync(xmlPath, 'utf-8');

    // Parse and transform
    const parsedXML = await parseAndValidateXML(xmlString);
    const transformedData = transformTimetableData(parsedXML);

    console.log(`📊 Transformed ${transformedData.timetableEntries.length} entries\n`);

    // Get all teachers
    const allTeachers = await Teacher.find({});

    // Create teacher map
    const teacherMap = {};
    for (const teacherData of transformedData.teachers) {
      const teacher = allTeachers.find((t) => t.name === teacherData.name);
      if (teacher) {
        teacherMap[teacherData.ascId] = teacher._id;
      }
    }

    // Create period map
    const periodMap = {};
    transformedData.periods.forEach((p) => {
      periodMap[p.period] = p;
    });

    // Transform entries to database format
    const timetableEntries = [];
    for (const entry of transformedData.timetableEntries) {
      const teacherId = teacherMap[entry.teacherAscId];
      if (!teacherId) continue;

      const periodInfo = periodMap[entry.period];
      if (!periodInfo) continue;

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
        teacherAscId: entry.teacherAscId, // Keep for tracking
      });
    }

    console.log(`📊 Prepared ${timetableEntries.length} entries for import\n`);

    // Filter entries for problematic teachers
    const problematicEntries = {};
    problematicTeacherIds.forEach((ascId) => {
      problematicEntries[ascId] = timetableEntries.filter(
        (e) => e.teacherAscId === ascId
      );
    });

    console.log(`${'='.repeat(80)}`);
    console.log('ENTRIES FOR PROBLEMATIC TEACHERS');
    console.log('='.repeat(80));

    for (const ascId of problematicTeacherIds) {
      const entries = problematicEntries[ascId];
      console.log(`\n📌 Teacher ${ascId}: ${entries.length} entries`);
    }

    // Now try to import them one by one with detailed error logging
    console.log(`\n\n${'='.repeat(80)}`);
    console.log('IMPORTING ENTRIES FOR PROBLEMATIC TEACHERS');
    console.log('='.repeat(80));

    for (const ascId of problematicTeacherIds) {
      const entries = problematicEntries[ascId];
      console.log(`\n📌 Teacher ${ascId}:`);
      console.log(`   Attempting to import ${entries.length} entries...\n`);

      let imported = 0;
      let updated = 0;
      let failed = 0;

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        try {
          // Remove the tracking field before saving
          const { teacherAscId, ...entryToSave } = entry;

          const result = await Timetable.findOneAndUpdate(
            {
              class: entry.class,
              day: entry.day,
              period: entry.period,
            },
            entryToSave,
            {
              upsert: true,
              new: true,
              runValidators: true,
            }
          );

          if (result.isNew) {
            imported++;
          } else {
            updated++;
          }

          if (i < 3) {
            console.log(`   ✅ Entry ${i + 1}: ${entry.class} - ${entry.day} - Period ${entry.period}`);
          }
        } catch (error) {
          failed++;
          if (i < 3) {
            console.log(`   ❌ Entry ${i + 1} FAILED: ${error.message}`);
            console.log(`      ${entry.class} - ${entry.day} - Period ${entry.period}`);
          }
        }
      }

      console.log(`\n   Results:`);
      console.log(`      ✅ Imported: ${imported}`);
      console.log(`      🔄 Updated: ${updated}`);
      console.log(`      ❌ Failed: ${failed}`);

      // Verify in database
      const mongoId = teacherMap[ascId];
      const dbEntries = await Timetable.find({ teacher: mongoId });
      console.log(`\n   📊 Entries in database after import: ${dbEntries.length}`);
    }

    console.log('\n✅ Re-import complete!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

reimportWithLogging();

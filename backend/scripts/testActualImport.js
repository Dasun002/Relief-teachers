import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { parseAndValidateXML } from '../services/xmlParser.js';
import { transformTimetableData } from '../services/timetableTransformer.js';
import Teacher from '../models/Teacher.js';

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

async function testActualImport() {
  try {
    console.log('=== TESTING ACTUAL IMPORT PROCESS ===\n');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Read XML file
    const xmlPath = path.join(__dirname, '../../for the data base.xml');
    const xmlString = fs.readFileSync(xmlPath, 'utf-8');

    // Parse XML
    console.log('📄 Parsing XML...');
    const parsedXML = await parseAndValidateXML(xmlString);
    console.log('✅ XML parsed\n');

    // Transform data
    console.log('🔄 Transforming data...');
    const transformedData = transformTimetableData(parsedXML);
    console.log('✅ Data transformed\n');

    console.log(`📊 Transformation results:`);
    console.log(`   Teachers: ${transformedData.teachers.length}`);
    console.log(`   Classes: ${transformedData.classes.length}`);
    console.log(`   Subjects: ${transformedData.subjects.length}`);
    console.log(`   Periods: ${transformedData.periods.length}`);
    console.log(`   Cards: ${transformedData.cards.length}`);
    console.log(`   Timetable Entries: ${transformedData.timetableEntries.length}\n`);

    // Get all teachers from database
    const allTeachers = await Teacher.find({});
    console.log(`📊 Teachers in database: ${allTeachers.length}\n`);

    // Create teacher map (ASC ID -> MongoDB ID)
    const teacherMap = {};
    for (const teacherData of transformedData.teachers) {
      const teacher = allTeachers.find((t) => t.name === teacherData.name);
      if (teacher) {
        teacherMap[teacherData.ascId] = teacher._id;
      }
    }

    console.log(`📊 Teacher map created: ${Object.keys(teacherMap).length} mappings\n`);

    // Check if problematic teachers are in the map
    console.log(`${'='.repeat(80)}`);
    console.log('CHECKING PROBLEMATIC TEACHERS');
    console.log('='.repeat(80));

    for (const ascId of problematicTeacherIds) {
      console.log(`\n📌 Teacher ${ascId}:`);

      // Find in transformed data
      const teacherData = transformedData.teachers.find((t) => t.ascId === ascId);
      if (!teacherData) {
        console.log(`   ❌ NOT found in transformed data`);
        continue;
      }

      console.log(`   ✅ Found in transformed data:`);
      console.log(`      Name: ${teacherData.name}`);

      // Check if mapped to MongoDB ID
      const mongoId = teacherMap[ascId];
      if (!mongoId) {
        console.log(`   ❌ NOT mapped to MongoDB ID`);
        continue;
      }

      console.log(`   ✅ Mapped to MongoDB ID: ${mongoId}`);

      // Count timetable entries for this teacher
      const entries = transformedData.timetableEntries.filter(
        (e) => e.teacherAscId === ascId
      );
      console.log(`   📚 Timetable entries in transformed data: ${entries.length}`);

      if (entries.length > 0) {
        console.log(`\n   First 3 entries:`);
        entries.slice(0, 3).forEach((entry, idx) => {
          console.log(`\n      ${idx + 1}. ${entry.class} - ${entry.day} - Period ${entry.period}`);
          console.log(`         Subject: ${entry.subject}`);
          console.log(`         Teacher ASC ID: ${entry.teacherAscId}`);
          console.log(`         Teacher Name: ${entry.teacherName}`);
        });
      }
    }

    console.log(`\n\n${'='.repeat(80)}`);
    console.log('CHECKING WHAT WOULD BE IMPORTED');
    console.log('='.repeat(80));

    // Simulate the import process (what the controller does)
    const periodMap = {};
    transformedData.periods.forEach((p) => {
      periodMap[p.period] = p;
    });

    for (const ascId of problematicTeacherIds) {
      console.log(`\n📌 Teacher ${ascId}:`);

      const mongoId = teacherMap[ascId];
      if (!mongoId) {
        console.log(`   ❌ No MongoDB ID mapping`);
        continue;
      }

      // Count entries that would be created
      let validEntries = 0;
      let invalidEntries = 0;
      const errors = [];

      for (const entry of transformedData.timetableEntries) {
        if (entry.teacherAscId !== ascId) continue;

        const teacherId = teacherMap[entry.teacherAscId];
        if (!teacherId) {
          invalidEntries++;
          errors.push(`No teacher ID for ${entry.teacherAscId}`);
          continue;
        }

        const periodInfo = periodMap[entry.period];
        if (!periodInfo) {
          invalidEntries++;
          errors.push(`No period info for period ${entry.period}`);
          continue;
        }

        validEntries++;
      }

      console.log(`   ✅ Valid entries (would be imported): ${validEntries}`);
      console.log(`   ❌ Invalid entries (would be skipped): ${invalidEntries}`);

      if (errors.length > 0) {
        console.log(`\n   Errors:`);
        errors.slice(0, 5).forEach((err, idx) => {
          console.log(`      ${idx + 1}. ${err}`);
        });
      }
    }

    console.log('\n✅ Test complete!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testActualImport();

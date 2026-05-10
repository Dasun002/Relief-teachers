import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xml2js from 'xml2js';
import dotenv from 'dotenv';
import Teacher from '../models/Teacher.js';
import Timetable from '../models/Timetable.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teacher-attendance';

const problematicTeacherIds = [
  '6981D88225D052F9', // Miss Jayathissa Jeewani
  '959DC2B239815572', // Miss Ranaweera Ishani
  'D22BDBC8CF81F40D', // Mr Aruna
];

async function diagnoseTeacherImport() {
  try {
    console.log('=== DIAGNOSING TEACHER IMPORT ISSUE ===\n');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Read and parse XML file
    const xmlPath = path.join(__dirname, '../../for the data base.xml');
    const xmlString = fs.readFileSync(xmlPath, 'utf-8');
    const parser = new xml2js.Parser({ explicitArray: false });
    const parsedXML = await parser.parseStringPromise(xmlString);

    console.log('✅ XML file parsed');
    console.log(`   Teachers section type: ${typeof parsedXML.timetable.teachers.teacher}`);
    console.log(`   Is array: ${Array.isArray(parsedXML.timetable.teachers.teacher)}\n`);

    // Get all teachers from database
    const allTeachers = await Teacher.find({});
    console.log(`📊 Total teachers in database: ${allTeachers.length}\n`);

    // Create teacher name to ID map
    const teacherNameToId = {};
    allTeachers.forEach((t) => {
      teacherNameToId[t.name] = t._id.toString();
    });

    // Get teachers from XML - handle both array and single object
    let xmlTeachers = parsedXML.timetable.teachers.teacher;
    if (!Array.isArray(xmlTeachers)) {
      xmlTeachers = [xmlTeachers];
    }
    console.log(`📊 Total teachers in XML: ${xmlTeachers.length}\n`);

    // Check each problematic teacher
    for (const ascId of problematicTeacherIds) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`ANALYZING TEACHER: ${ascId}`);
      console.log('='.repeat(80));

      // Find teacher in XML
      const xmlTeacher = xmlTeachers.find((t) => t.$ && t.$.id === ascId);
      if (!xmlTeacher) {
        console.log('❌ Teacher NOT found in XML');
        console.log(`   Searched ${xmlTeachers.length} teachers`);
        console.log(`   Sample teacher structure:`, JSON.stringify(xmlTeachers[0], null, 2).substring(0, 200));
        continue;
      }

      console.log(`\n✅ Found in XML:`);
      console.log(`   Name: ${xmlTeacher.$.name}`);
      console.log(`   First: ${xmlTeacher.$.firstname}`);
      console.log(`   Last: ${xmlTeacher.$.lastname}`);
      console.log(`   Short: ${xmlTeacher.$.short}`);

      // Check if teacher exists in database
      const dbTeacher = allTeachers.find((t) => t.name === xmlTeacher.$.name);
      if (!dbTeacher) {
        console.log(`\n❌ Teacher NOT found in database`);
        console.log(`   Expected name: "${xmlTeacher.$.name}"`);
        continue;
      }

      console.log(`\n✅ Found in database:`);
      console.log(`   ID: ${dbTeacher._id}`);
      console.log(`   Name: ${dbTeacher.name}`);
      console.log(`   Subjects: ${dbTeacher.subjects.join(', ')}`);

      // Find lessons where this teacher is assigned
      let xmlLessons = parsedXML.timetable.lessons.lesson;
      if (!Array.isArray(xmlLessons)) {
        xmlLessons = [xmlLessons];
      }

      const teacherLessons = xmlLessons.filter((lesson) => {
        if (!lesson.$ || !lesson.$.teacherids) return false;
        const teacherIds = lesson.$.teacherids.split(',');
        return teacherIds.includes(ascId);
      });

      console.log(`\n📚 Lessons in XML: ${teacherLessons.length}`);

      if (teacherLessons.length > 0) {
        console.log(`\nFirst 3 lessons:`);
        teacherLessons.slice(0, 3).forEach((lesson, idx) => {
          const teacherIds = lesson.$.teacherids.split(',');
          const position = teacherIds.indexOf(ascId) + 1;
          console.log(`\n   Lesson ${idx + 1}:`);
          console.log(`      ID: ${lesson.$.id}`);
          console.log(`      Subject: ${lesson.$.subjectid}`);
          console.log(`      Classes: ${lesson.$.classids}`);
          console.log(`      Teachers: ${lesson.$.teacherids}`);
          console.log(`      Position: ${position} of ${teacherIds.length}`);
          console.log(`      Is Primary: ${position === 1 ? 'YES' : 'NO'}`);
        });
      }

      // Check timetable entries in database
      const timetableEntries = await Timetable.find({ teacher: dbTeacher._id });
      console.log(`\n📅 Timetable entries in database: ${timetableEntries.length}`);

      if (timetableEntries.length === 0) {
        console.log(`\n❌ NO TIMETABLE ENTRIES FOUND!`);
        console.log(`\n🔍 Possible reasons:`);
        console.log(`   1. Teacher is always listed as co-teacher (not primary)`);
        console.log(`   2. Lessons failed validation during import`);
        console.log(`   3. Class/period/day combination already exists`);
        console.log(`   4. Period information missing or invalid`);
      } else {
        console.log(`\n✅ Sample entries:`);
        timetableEntries.slice(0, 3).forEach((entry, idx) => {
          console.log(`\n   Entry ${idx + 1}:`);
          console.log(`      Class: ${entry.class}`);
          console.log(`      Day: ${entry.day}`);
          console.log(`      Period: ${entry.period}`);
          console.log(`      Subject: ${entry.subject}`);
          console.log(`      Time: ${entry.startTime} - ${entry.endTime}`);
        });
      }

      // Check if teacher is listed as alternate teacher
      const alternateEntries = await Timetable.find({
        alternateTeachers: dbTeacher._id,
      });
      console.log(`\n👥 Listed as alternate teacher: ${alternateEntries.length} times`);
    }

    console.log(`\n\n${'='.repeat(80)}`);
    console.log('SUMMARY');
    console.log('='.repeat(80));

    // Check all timetable entries
    const allEntries = await Timetable.find({});
    console.log(`\nTotal timetable entries: ${allEntries.length}`);

    // Count entries per teacher
    const entriesPerTeacher = {};
    allEntries.forEach((entry) => {
      const teacherId = entry.teacher.toString();
      entriesPerTeacher[teacherId] = (entriesPerTeacher[teacherId] || 0) + 1;
    });

    console.log(`\nTeachers with entries: ${Object.keys(entriesPerTeacher).length}`);
    console.log(`Teachers without entries: ${allTeachers.length - Object.keys(entriesPerTeacher).length}`);

    // List teachers without entries
    const teachersWithoutEntries = allTeachers.filter(
      (t) => !entriesPerTeacher[t._id.toString()]
    );

    if (teachersWithoutEntries.length > 0) {
      console.log(`\n❌ Teachers without timetable entries:`);
      teachersWithoutEntries.forEach((t, idx) => {
        console.log(`   ${idx + 1}. ${t.name}`);
      });
    }

    console.log('\n✅ Diagnosis complete!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

diagnoseTeacherImport();

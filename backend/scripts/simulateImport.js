import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xml2js from 'xml2js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function simulateImport() {
  try {
    console.log('=== SIMULATING IMPORT PROCESS ===\n');

    // Read and parse XML file
    const xmlPath = path.join(__dirname, '../../for the data base.xml');
    const xmlString = fs.readFileSync(xmlPath, 'utf-8');
    const parser = new xml2js.Parser({ explicitArray: false });
    const parsedXML = await parser.parseStringPromise(xmlString);

    console.log('✅ XML file parsed\n');

    // Get all data
    let xmlClasses = parsedXML.timetable.classes.class;
    if (!Array.isArray(xmlClasses)) {
      xmlClasses = [xmlClasses];
    }

    let xmlLessons = parsedXML.timetable.lessons.lesson;
    if (!Array.isArray(xmlLessons)) {
      xmlLessons = [xmlLessons];
    }

    let xmlCards = parsedXML.timetable.cards.card;
    if (!Array.isArray(xmlCards)) {
      xmlCards = [xmlCards];
    }

    // Create class lookup
    const classMap = {};
    xmlClasses.forEach((cls) => {
      classMap[cls.$.id] = cls.$.name;
    });

    console.log(`📊 Classes: ${xmlClasses.length}`);
    console.log(`📊 Lessons: ${xmlLessons.length}`);
    console.log(`📊 Cards: ${xmlCards.length}\n`);

    // Simulate the import process
    const timetableEntries = [];
    const uniqueKeys = new Set(); // Track unique (class, day, period) combinations
    const duplicates = [];

    xmlCards.forEach((card) => {
      const lessonId = card.$.lessonid;
      const period = parseInt(card.$.period);
      const dayPattern = card.$.days;

      // Convert day pattern to day name
      const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      let dayName = null;
      for (let i = 0; i < dayPattern.length && i < 5; i++) {
        if (dayPattern[i] === '1') {
          dayName = dayNames[i];
          break;
        }
      }

      if (!dayName) return;

      // Find the lesson
      const lesson = xmlLessons.find((l) => l.$.id === lessonId);
      if (!lesson) return;

      // Get class IDs and teacher IDs
      const classIds = lesson.$.classids ? lesson.$.classids.split(',') : [];
      const teacherIds = lesson.$.teacherids ? lesson.$.teacherids.split(',') : [];

      // Create entries for each class and teacher combination
      classIds.forEach((classId) => {
        const className = classMap[classId];
        if (!className) return;

        teacherIds.forEach((teacherId, teacherIndex) => {
          const uniqueKey = `${className}-${dayName}-${period}`;

          if (uniqueKeys.has(uniqueKey)) {
            // This is a duplicate!
            duplicates.push({
              class: className,
              day: dayName,
              period: period,
              teacherId: teacherId,
              teacherPosition: teacherIndex + 1,
              totalTeachers: teacherIds.length,
              lessonId: lessonId,
            });
          } else {
            uniqueKeys.add(uniqueKey);
            timetableEntries.push({
              class: className,
              day: dayName,
              period: period,
              teacherId: teacherId,
              teacherPosition: teacherIndex + 1,
              totalTeachers: teacherIds.length,
              lessonId: lessonId,
            });
          }
        });
      });
    });

    console.log(`✅ Simulation complete\n`);
    console.log(`📊 Total entries that would be created: ${timetableEntries.length + duplicates.length}`);
    console.log(`✅ Unique entries (would be saved): ${timetableEntries.length}`);
    console.log(`❌ Duplicate entries (would be rejected): ${duplicates.length}\n`);

    if (duplicates.length > 0) {
      console.log(`\n${'='.repeat(80)}`);
      console.log('DUPLICATE ENTRIES (REJECTED BY UNIQUE CONSTRAINT)');
      console.log('='.repeat(80));

      // Group duplicates by teacher
      const duplicatesByTeacher = {};
      duplicates.forEach((dup) => {
        if (!duplicatesByTeacher[dup.teacherId]) {
          duplicatesByTeacher[dup.teacherId] = [];
        }
        duplicatesByTeacher[dup.teacherId].push(dup);
      });

      // Show problematic teachers
      const problematicTeacherIds = [
        '6981D88225D052F9', // Miss Jayathissa Jeewani
        '959DC2B239815572', // Miss Ranaweera Ishani
        'D22BDBC8CF81F40D', // Mr Aruna
      ];

      problematicTeacherIds.forEach((teacherId) => {
        const teacherDuplicates = duplicatesByTeacher[teacherId] || [];
        console.log(`\n📌 Teacher ${teacherId}:`);
        console.log(`   Total duplicate entries: ${teacherDuplicates.length}`);

        if (teacherDuplicates.length > 0) {
          console.log(`\n   First 5 duplicates:`);
          teacherDuplicates.slice(0, 5).forEach((dup, idx) => {
            console.log(`\n      ${idx + 1}. ${dup.class} - ${dup.day} - Period ${dup.period}`);
            console.log(`         Position: ${dup.teacherPosition} of ${dup.totalTeachers}`);
            console.log(`         Lesson: ${dup.lessonId}`);
            console.log(`         ❌ REJECTED: Another teacher already assigned to this slot`);
          });
        }
      });

      // Check if ALL entries for these teachers are duplicates
      console.log(`\n\n${'='.repeat(80)}`);
      console.log('ANALYSIS: WHY THESE TEACHERS HAVE NO ENTRIES');
      console.log('='.repeat(80));

      problematicTeacherIds.forEach((teacherId) => {
        const teacherEntries = timetableEntries.filter((e) => e.teacherId === teacherId);
        const teacherDuplicates = duplicatesByTeacher[teacherId] || [];

        console.log(`\n📌 Teacher ${teacherId}:`);
        console.log(`   ✅ Unique entries (saved): ${teacherEntries.length}`);
        console.log(`   ❌ Duplicate entries (rejected): ${teacherDuplicates.length}`);

        if (teacherEntries.length === 0 && teacherDuplicates.length > 0) {
          console.log(`\n   🔍 ROOT CAUSE: ALL entries for this teacher are duplicates!`);
          console.log(`      This means another teacher is ALWAYS listed first for the same class/day/period`);
          console.log(`      The unique constraint prevents this teacher from being saved`);
        }
      });
    }

    console.log('\n✅ Simulation complete!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

simulateImport();

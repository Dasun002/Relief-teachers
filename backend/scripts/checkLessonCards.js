import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xml2js from 'xml2js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const problematicLessonIds = [
  'C6BE58480A594B27', // Miss Jayathissa Jeewani - Lesson 1
  '49B0117067BFC44C', // Miss Jayathissa Jeewani - Lesson 2
  '616FA31C34DEF8F6', // Miss Ranaweera Ishani - Lesson 1
  '762BCF9A89952F2C', // Mr Aruna - Lesson 1
];

async function checkLessonCards() {
  try {
    console.log('=== CHECKING LESSON CARDS ===\n');

    // Read and parse XML file
    const xmlPath = path.join(__dirname, '../../for the data base.xml');
    const xmlString = fs.readFileSync(xmlPath, 'utf-8');
    const parser = new xml2js.Parser({ explicitArray: false });
    const parsedXML = await parser.parseStringPromise(xmlString);

    console.log('✅ XML file parsed\n');

    // Get cards
    let xmlCards = parsedXML.timetable.cards.card;
    if (!Array.isArray(xmlCards)) {
      xmlCards = [xmlCards];
    }
    console.log(`📊 Total cards in XML: ${xmlCards.length}\n`);

    // Check each problematic lesson
    for (const lessonId of problematicLessonIds) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`CHECKING LESSON: ${lessonId}`);
      console.log('='.repeat(80));

      // Find cards for this lesson
      const lessonCards = xmlCards.filter((card) => card.$.lessonid === lessonId);

      console.log(`\n📅 Cards found: ${lessonCards.length}`);

      if (lessonCards.length === 0) {
        console.log(`\n❌ NO CARDS FOUND FOR THIS LESSON!`);
        console.log(`   This means the lesson is NOT scheduled in any period/day`);
        console.log(`   The lesson exists but has no time slot assigned`);
      } else {
        console.log(`\n✅ Cards for this lesson:`);
        lessonCards.forEach((card, idx) => {
          const dayPattern = card.$.days;
          const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
          let dayName = 'Unknown';
          
          for (let i = 0; i < dayPattern.length && i < 5; i++) {
            if (dayPattern[i] === '1') {
              dayName = dayNames[i];
              break;
            }
          }

          console.log(`\n   Card ${idx + 1}:`);
          console.log(`      Period: ${card.$.period}`);
          console.log(`      Day Pattern: ${dayPattern}`);
          console.log(`      Day: ${dayName}`);
          console.log(`      Weeks: ${card.$.weeks || 'all'}`);
          console.log(`      Terms: ${card.$.terms || 'all'}`);
          console.log(`      Classrooms: ${card.$.classroomids || 'none'}`);
        });
      }
    }

    console.log(`\n\n${'='.repeat(80)}`);
    console.log('SUMMARY');
    console.log('='.repeat(80));

    // Count cards per lesson for all lessons
    let xmlLessons = parsedXML.timetable.lessons.lesson;
    if (!Array.isArray(xmlLessons)) {
      xmlLessons = [xmlLessons];
    }

    const lessonsWithoutCards = [];
    xmlLessons.forEach((lesson) => {
      const lessonCards = xmlCards.filter((card) => card.$.lessonid === lesson.$.id);
      if (lessonCards.length === 0) {
        lessonsWithoutCards.push({
          id: lesson.$.id,
          teachers: lesson.$.teacherids,
          classes: lesson.$.classids,
          subject: lesson.$.subjectid,
        });
      }
    });

    console.log(`\nTotal lessons: ${xmlLessons.length}`);
    console.log(`Lessons with cards: ${xmlLessons.length - lessonsWithoutCards.length}`);
    console.log(`Lessons WITHOUT cards: ${lessonsWithoutCards.length}`);

    if (lessonsWithoutCards.length > 0) {
      console.log(`\n❌ Lessons without cards (not scheduled):`);
      lessonsWithoutCards.slice(0, 10).forEach((lesson, idx) => {
        console.log(`\n   ${idx + 1}. Lesson ${lesson.id}`);
        console.log(`      Teachers: ${lesson.teachers}`);
        console.log(`      Classes: ${lesson.classes}`);
        console.log(`      Subject: ${lesson.subject}`);
      });
      
      if (lessonsWithoutCards.length > 10) {
        console.log(`\n   ... and ${lessonsWithoutCards.length - 10} more`);
      }
    }

    console.log('\n✅ Check complete!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

checkLessonCards();

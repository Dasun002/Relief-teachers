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

async function checkClassNames() {
  try {
    console.log('=== CHECKING CLASS NAMES ===\n');

    // Read and parse XML file
    const xmlPath = path.join(__dirname, '../../for the data base.xml');
    const xmlString = fs.readFileSync(xmlPath, 'utf-8');
    const parser = new xml2js.Parser({ explicitArray: false });
    const parsedXML = await parser.parseStringPromise(xmlString);

    console.log('✅ XML file parsed\n');

    // Get classes
    let xmlClasses = parsedXML.timetable.classes.class;
    if (!Array.isArray(xmlClasses)) {
      xmlClasses = [xmlClasses];
    }

    // Create class lookup map
    const classMap = {};
    xmlClasses.forEach((cls) => {
      classMap[cls.$.id] = {
        name: cls.$.name,
        short: cls.$.short,
        grade: cls.$.grade,
      };
    });

    console.log(`📊 Total classes in XML: ${xmlClasses.length}\n`);

    // Get lessons
    let xmlLessons = parsedXML.timetable.lessons.lesson;
    if (!Array.isArray(xmlLessons)) {
      xmlLessons = [xmlLessons];
    }

    // Check each problematic lesson
    for (const lessonId of problematicLessonIds) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`CHECKING LESSON: ${lessonId}`);
      console.log('='.repeat(80));

      const lesson = xmlLessons.find((l) => l.$.id === lessonId);
      if (!lesson) {
        console.log('❌ Lesson not found');
        continue;
      }

      console.log(`\n✅ Lesson found:`);
      console.log(`   Teachers: ${lesson.$.teacherids}`);
      console.log(`   Classes: ${lesson.$.classids}`);
      console.log(`   Subject: ${lesson.$.subjectid}`);

      // Get class names
      const classIds = lesson.$.classids.split(',');
      console.log(`\n📚 Classes for this lesson:`);
      classIds.forEach((classId, idx) => {
        const classInfo = classMap[classId];
        if (!classInfo) {
          console.log(`   ${idx + 1}. ❌ Class ID ${classId} NOT FOUND`);
        } else {
          console.log(`   ${idx + 1}. ${classInfo.name} (Grade ${classInfo.grade})`);
          
          // Check if class name matches the required format
          const classNameRegex = /^(6|7|8|9|10|11|12|13)[A-C]$/;
          if (!classNameRegex.test(classInfo.name)) {
            console.log(`      ❌ INVALID FORMAT! Must be 6A-13C`);
            console.log(`      Current: "${classInfo.name}"`);
          } else {
            console.log(`      ✅ Valid format`);
          }
        }
      });
    }

    console.log(`\n\n${'='.repeat(80)}`);
    console.log('ALL CLASSES VALIDATION');
    console.log('='.repeat(80));

    const classNameRegex = /^(6|7|8|9|10|11|12|13)[A-C]$/;
    const invalidClasses = [];

    xmlClasses.forEach((cls) => {
      if (!classNameRegex.test(cls.$.name)) {
        invalidClasses.push({
          id: cls.$.id,
          name: cls.$.name,
          grade: cls.$.grade,
        });
      }
    });

    console.log(`\nTotal classes: ${xmlClasses.length}`);
    console.log(`Valid classes: ${xmlClasses.length - invalidClasses.length}`);
    console.log(`Invalid classes: ${invalidClasses.length}`);

    if (invalidClasses.length > 0) {
      console.log(`\n❌ Classes with invalid names:`);
      invalidClasses.forEach((cls, idx) => {
        console.log(`   ${idx + 1}. "${cls.name}" (Grade ${cls.grade}) - ID: ${cls.id}`);
      });
    }

    console.log('\n✅ Check complete!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

checkClassNames();

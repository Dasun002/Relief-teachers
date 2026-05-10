import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xml2js from 'xml2js';
import Timetable from '../models/Timetable.js';
import Teacher from '../models/Teacher.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

/**
 * Script to clean timetable and re-import from XML
 */
async function cleanAndReimportTimetable() {
  try {
    console.log('🚀 Starting timetable cleanup and re-import process...\n');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Count existing timetable entries
    const existingCount = await Timetable.countDocuments();
    console.log(`📊 Current timetable entries: ${existingCount}`);

    // Step 2: Delete all existing timetable entries
    console.log('\n🗑️  Deleting all existing timetable entries...');
    const deleteResult = await Timetable.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} timetable entries\n`);

    // Step 3: Read XML file
    const xmlFilePath = path.join(__dirname, '../../for the data base.xml');
    console.log(`📄 Reading XML file: ${xmlFilePath}`);
    
    if (!fs.existsSync(xmlFilePath)) {
      throw new Error(`XML file not found at: ${xmlFilePath}`);
    }

    const xmlData = fs.readFileSync(xmlFilePath, 'utf-8');
    console.log('✅ XML file read successfully\n');

    // Step 4: Parse XML
    console.log('🔍 Parsing XML data...');
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlData);
    
    if (!result.timetable || !result.timetable.lesson) {
      throw new Error('Invalid XML format: missing timetable or lesson elements');
    }

    const lessons = result.timetable.lesson;
    console.log(`✅ Found ${lessons.length} lessons in XML\n`);

    // Step 5: Get all teachers from database
    console.log('👥 Fetching teachers from database...');
    const teachers = await Teacher.find({});
    console.log(`✅ Found ${teachers.length} teachers\n`);

    // Create teacher name to ID mapping
    const teacherMap = {};
    teachers.forEach(teacher => {
      teacherMap[teacher.name] = teacher._id;
    });

    // Step 6: Process and import lessons
    console.log('📥 Importing timetable entries...');
    let importedCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      
      try {
        // Extract lesson data
        const teacherName = lesson.teacher?.[0];
        const className = lesson.class?.[0];
        const subject = lesson.subject?.[0];
        const day = lesson.day?.[0];
        const period = parseInt(lesson.period?.[0]);
        const startTime = lesson.starttime?.[0];
        const endTime = lesson.endtime?.[0];

        // Validate required fields
        if (!teacherName || !className || !subject || !day || !period || !startTime || !endTime) {
          skippedCount++;
          errors.push(`Lesson ${i + 1}: Missing required fields`);
          continue;
        }

        // Find teacher ID
        const teacherId = teacherMap[teacherName];
        if (!teacherId) {
          skippedCount++;
          errors.push(`Lesson ${i + 1}: Teacher "${teacherName}" not found in database`);
          continue;
        }

        // Create timetable entry
        const timetableEntry = new Timetable({
          teacher: teacherId,
          class: className,
          subject: subject,
          day: day,
          period: period,
          startTime: startTime,
          endTime: endTime
        });

        await timetableEntry.save();
        importedCount++;

        // Progress indicator
        if (importedCount % 100 === 0) {
          console.log(`   Imported ${importedCount} entries...`);
        }

      } catch (error) {
        skippedCount++;
        errors.push(`Lesson ${i + 1}: ${error.message}`);
      }
    }

    console.log(`\n✅ Import complete!`);
    console.log(`   Successfully imported: ${importedCount} entries`);
    console.log(`   Skipped: ${skippedCount} entries`);

    // Step 7: Check for duplicates in new data
    console.log('\n🔍 Checking for duplicates in imported data...');
    
    const allEntries = await Timetable.find({}).populate('teacher', 'name');
    const groupedEntries = {};
    
    for (const entry of allEntries) {
      const key = `${entry.teacher._id}_${entry.day}_${entry.period}`;
      if (!groupedEntries[key]) {
        groupedEntries[key] = [];
      }
      groupedEntries[key].push(entry);
    }

    const duplicateGroups = Object.entries(groupedEntries).filter(([key, entries]) => entries.length > 1);
    
    if (duplicateGroups.length > 0) {
      console.log(`⚠️  Warning: Found ${duplicateGroups.length} duplicate groups after import`);
      console.log('   This suggests the XML file itself contains duplicates');
    } else {
      console.log('✅ No duplicates found - timetable is clean!');
    }

    // Step 8: Display summary
    console.log('\n📊 Final Summary:');
    console.log(`   Previous entries: ${existingCount}`);
    console.log(`   Deleted: ${deleteResult.deletedCount}`);
    console.log(`   Imported: ${importedCount}`);
    console.log(`   Current entries: ${await Timetable.countDocuments()}`);
    console.log(`   Duplicate groups: ${duplicateGroups.length}`);

    // Display errors if any
    if (errors.length > 0) {
      console.log(`\n⚠️  Errors encountered (${errors.length}):`);
      errors.slice(0, 10).forEach(error => console.log(`   - ${error}`));
      if (errors.length > 10) {
        console.log(`   ... and ${errors.length - 10} more errors`);
      }
    }

    // Step 9: Create unique index to prevent future duplicates
    console.log('\n🔒 Creating unique index to prevent future duplicates...');
    try {
      await Timetable.collection.createIndex(
        { teacher: 1, day: 1, period: 1 },
        { unique: true }
      );
      console.log('✅ Unique index created successfully');
    } catch (error) {
      if (error.code === 11000) {
        console.log('⚠️  Unique index already exists');
      } else {
        console.error('❌ Error creating unique index:', error.message);
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    console.log('\n🎉 Timetable cleanup and re-import completed successfully!\n');
    
  } catch (error) {
    console.error('\n❌ Error during cleanup and re-import:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
cleanAndReimportTimetable();

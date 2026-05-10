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

/**
 * Fix Co-Teacher Issue
 * 
 * This script:
 * 1. Drops the unique index on {class, day, period}
 * 2. Clears all existing timetable entries
 * 3. Re-imports timetable data with full co-teacher support
 * 4. Verifies the results
 */
async function fixCoTeacherIssue() {
  try {
    console.log('='.repeat(80));
    console.log('CO-TEACHER ISSUE FIX');
    console.log('='.repeat(80));
    console.log();

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Drop the unique index
    console.log('Step 1: Dropping unique index on {class, day, period}...');
    try {
      await Timetable.collection.dropIndex('class_1_day_1_period_1');
      console.log('✅ Dropped unique index\n');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Index does not exist (already dropped)\n');
      } else {
        console.log(`⚠️  Error dropping index: ${error.message}\n`);
      }
    }

    // Step 2: Clear existing timetable data
    console.log('Step 2: Clearing existing timetable entries...');
    const deleteResult = await Timetable.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing entries\n`);

    // Step 3: Re-import timetable data
    console.log('Step 3: Re-importing timetable data with co-teacher support...');
    
    // Read XML file
    const xmlPath = path.join(__dirname, '../../for the data base.xml');
    console.log(`📄 Reading XML from: ${xmlPath}`);
    const xmlString = fs.readFileSync(xmlPath, 'utf-8');

    // Parse and transform
    console.log('🔄 Parsing and transforming XML...');
    const parsedXML = await parseAndValidateXML(xmlString);
    const transformedData = transformTimetableData(parsedXML);

    console.log(`📊 Transformed data:`);
    console.log(`   - Teachers: ${transformedData.teachers.length}`);
    console.log(`   - Classes: ${transformedData.classes.length}`);
    console.log(`   - Subjects: ${transformedData.subjects.length}`);
    console.log(`   - Periods: ${transformedData.periods.length}`);
    console.log(`   - Timetable entries: ${transformedData.timetableEntries.length}\n`);

    // Get all teachers from database
    const allTeachers = await Teacher.find({});
    console.log(`👥 Found ${allTeachers.length} teachers in database\n`);

    // Create teacher map (ASC ID -> MongoDB ID)
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
    console.log('🔄 Preparing timetable entries for import...');
    const timetableEntries = [];
    
    for (const entry of transformedData.timetableEntries) {
      const teacherId = teacherMap[entry.teacherAscId];
      if (!teacherId) {
        console.log(`⚠️  Teacher not found: ${entry.teacherAscId} (${entry.teacherName})`);
        continue;
      }

      const periodInfo = periodMap[entry.period];
      if (!periodInfo) {
        console.log(`⚠️  Period not found: ${entry.period}`);
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
        isCombinedClass: entry.isCombinedClass,
        alternateTeachers: entry.alternateTeacherIds
          .map((id) => teacherMap[id])
          .filter((id) => id),
      });
    }

    console.log(`📊 Prepared ${timetableEntries.length} entries for import\n`);

    // Import all entries
    console.log('💾 Importing timetable entries...');
    let imported = 0;
    let failed = 0;
    const errors = [];

    for (const entry of timetableEntries) {
      try {
        await Timetable.create(entry);
        imported++;
        
        // Show progress every 100 entries
        if (imported % 100 === 0) {
          console.log(`   Imported ${imported}/${timetableEntries.length}...`);
        }
      } catch (error) {
        failed++;
        errors.push({
          entry: `${entry.class} - ${entry.day} - Period ${entry.period}`,
          error: error.message,
        });
        
        // Only show first 5 errors
        if (failed <= 5) {
          console.log(`   ❌ Failed: ${entry.class} - ${entry.day} - Period ${entry.period}`);
          console.log(`      Error: ${error.message}`);
        }
      }
    }

    console.log();
    console.log('📊 Import Results:');
    console.log(`   ✅ Successfully imported: ${imported}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log();

    // Step 4: Verify results
    console.log('Step 4: Verifying results...\n');

    // Test Case 1: Miss Udakanda Sasini - Monday
    console.log('Test Case 1: Miss Udakanda Sasini - Monday');
    const sasiniTeacher = await Teacher.findOne({ name: 'Miss Udakanda Sasini' });
    
    if (sasiniTeacher) {
      const sasiniMonday = await Timetable.find({
        teacher: sasiniTeacher._id,
        day: 'Monday',
      }).sort({ period: 1 });

      console.log(`   Found ${sasiniMonday.length} periods`);
      console.log(`   Periods: ${sasiniMonday.map((p) => p.period).join(', ')}`);
      console.log(`   Expected: 6 periods (1, 2, 3, 5, 6, 8)`);
      
      if (sasiniMonday.length === 6) {
        console.log('   ✅ PASS: All 6 periods found!\n');
      } else {
        console.log('   ❌ FAIL: Missing periods\n');
      }

      // Show details of each period
      console.log('   Period Details:');
      for (const period of sasiniMonday) {
        console.log(`      Period ${period.period}: ${period.class} - ${period.subject} (${period.startTime}-${period.endTime})`);
      }
      console.log();
    } else {
      console.log('   ❌ Teacher not found in database\n');
    }

    // Test Case 2: Check for co-taught periods
    console.log('Test Case 2: Co-taught periods (6A/6B - Monday - Period 1)');
    const period1Teachers = await Timetable.find({
      class: { $in: ['6A', '6B'] },
      day: 'Monday',
      period: 1,
    }).populate('teacher');

    console.log(`   Found ${period1Teachers.length} teachers for this period`);
    for (const entry of period1Teachers) {
      console.log(`      - ${entry.teacher.name} (${entry.class} - ${entry.subject})`);
    }
    
    if (period1Teachers.length >= 2) {
      console.log('   ✅ PASS: Multiple teachers found for co-taught period!\n');
    } else {
      console.log('   ⚠️  WARNING: Expected multiple teachers for co-taught period\n');
    }

    // Test Case 3: Overall statistics
    console.log('Test Case 3: Overall Statistics');
    const totalEntries = await Timetable.countDocuments();
    const uniqueTeachers = await Timetable.distinct('teacher');
    const uniqueClasses = await Timetable.distinct('class');
    
    console.log(`   Total timetable entries: ${totalEntries}`);
    console.log(`   Unique teachers with schedules: ${uniqueTeachers.length}`);
    console.log(`   Unique classes: ${uniqueClasses.length}`);
    console.log();

    // Check each teacher's schedule
    console.log('Test Case 4: Teacher Schedule Completeness');
    const teacherStats = [];
    
    for (const teacher of allTeachers) {
      const entryCount = await Timetable.countDocuments({ teacher: teacher._id });
      teacherStats.push({
        name: teacher.name,
        entries: entryCount,
      });
    }

    // Sort by entry count
    teacherStats.sort((a, b) => b.entries - a.entries);

    console.log('   Top 10 teachers by period count:');
    for (let i = 0; i < Math.min(10, teacherStats.length); i++) {
      const stat = teacherStats[i];
      console.log(`      ${i + 1}. ${stat.name}: ${stat.entries} periods`);
    }
    console.log();

    console.log('   Teachers with 0 periods:');
    const emptyTeachers = teacherStats.filter((s) => s.entries === 0);
    if (emptyTeachers.length === 0) {
      console.log('      ✅ None - all teachers have schedules!');
    } else {
      for (const stat of emptyTeachers) {
        console.log(`      - ${stat.name}`);
      }
    }
    console.log();

    // Summary
    console.log('='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Unique index dropped`);
    console.log(`✅ ${deleteResult.deletedCount} old entries cleared`);
    console.log(`✅ ${imported} new entries imported`);
    console.log(`❌ ${failed} entries failed`);
    console.log(`📊 ${totalEntries} total entries in database`);
    console.log(`👥 ${uniqueTeachers.length}/${allTeachers.length} teachers have schedules`);
    console.log();
    
    if (failed === 0 && uniqueTeachers.length === allTeachers.length) {
      console.log('🎉 SUCCESS! Co-teacher issue is FIXED!');
    } else if (failed > 0) {
      console.log('⚠️  WARNING: Some entries failed to import');
    } else if (uniqueTeachers.length < allTeachers.length) {
      console.log('⚠️  WARNING: Some teachers have no schedule entries');
    }
    console.log();

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the fix
fixCoTeacherIssue();

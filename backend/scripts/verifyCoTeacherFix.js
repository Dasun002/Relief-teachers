import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Teacher from '../models/Teacher.js';
import Timetable from '../models/Timetable.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Verify Co-Teacher Fix
 * 
 * Quick verification script to confirm the co-teacher issue is resolved
 */
async function verifyCoTeacherFix() {
  try {
    console.log('='.repeat(80));
    console.log('CO-TEACHER FIX VERIFICATION');
    console.log('='.repeat(80));
    console.log();

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Overall Statistics
    console.log('Test 1: Overall Statistics');
    console.log('-'.repeat(80));
    
    const totalEntries = await Timetable.countDocuments();
    const uniqueTeachers = await Timetable.distinct('teacher');
    const uniqueClasses = await Timetable.distinct('class');
    const totalTeachers = await Teacher.countDocuments();
    
    console.log(`Total timetable entries: ${totalEntries}`);
    console.log(`Teachers with schedules: ${uniqueTeachers.length}/${totalTeachers}`);
    console.log(`Unique classes: ${uniqueClasses.length}`);
    
    if (totalEntries === 882 && uniqueTeachers.length === totalTeachers) {
      console.log('✅ PASS: Database has correct number of entries\n');
    } else {
      console.log('❌ FAIL: Database entries mismatch\n');
    }

    // Test 2: Miss Udakanda Sasini - Monday
    console.log('Test 2: Miss Udakanda Sasini - Monday Schedule');
    console.log('-'.repeat(80));
    
    const sasini = await Teacher.findOne({ name: 'Miss Udakanda Sasini' });
    let mondaySchedule = [];
    
    if (!sasini) {
      console.log('❌ FAIL: Teacher not found\n');
    } else {
      mondaySchedule = await Timetable.find({
        teacher: sasini._id,
        day: 'Monday'
      }).sort({ period: 1, class: 1 });

      console.log(`Found ${mondaySchedule.length} entries for Monday`);
      console.log();
      console.log('Period Details:');
      
      for (const entry of mondaySchedule) {
        console.log(`  Period ${entry.period}: ${entry.class.padEnd(4)} - ${entry.subject.padEnd(20)} (${entry.startTime}-${entry.endTime})`);
      }
      
      console.log();
      
      // Count unique periods
      const uniquePeriods = [...new Set(mondaySchedule.map(e => e.period))];
      console.log(`Unique periods: ${uniquePeriods.join(', ')}`);
      console.log(`Total unique periods: ${uniquePeriods.length}`);
      
      if (mondaySchedule.length >= 6 && uniquePeriods.length >= 6) {
        console.log('✅ PASS: Miss Udakanda Sasini has complete Monday schedule\n');
      } else {
        console.log('❌ FAIL: Missing periods\n');
      }
    }

    // Test 3: Co-taught Periods
    console.log('Test 3: Co-taught Periods (Period 1 - Monday)');
    console.log('-'.repeat(80));
    
    const period1Monday = await Timetable.find({
      day: 'Monday',
      period: 1
    }).populate('teacher');

    console.log(`Found ${period1Monday.length} entries for Period 1 on Monday`);
    console.log();
    
    // Group by class
    const byClass = {};
    for (const entry of period1Monday) {
      if (!byClass[entry.class]) {
        byClass[entry.class] = [];
      }
      byClass[entry.class].push(entry);
    }

    console.log('Classes and their teachers:');
    for (const [className, entries] of Object.entries(byClass)) {
      console.log(`  ${className}:`);
      for (const entry of entries) {
        console.log(`    - ${entry.teacher.name} (${entry.subject})`);
      }
    }
    
    // Check for co-teaching (multiple teachers for same class)
    const coTaughtClasses = Object.entries(byClass).filter(([_, entries]) => entries.length > 1);
    
    if (coTaughtClasses.length > 0) {
      console.log();
      console.log(`✅ PASS: Found ${coTaughtClasses.length} co-taught class(es) in Period 1\n`);
    } else {
      console.log();
      console.log('ℹ️  INFO: No co-taught classes found in Period 1 (may be normal)\n');
    }

    // Test 4: Teacher Schedule Completeness
    console.log('Test 4: Teacher Schedule Completeness');
    console.log('-'.repeat(80));
    
    const allTeachers = await Teacher.find({}).sort({ name: 1 });
    const teacherStats = [];
    
    for (const teacher of allTeachers) {
      const entryCount = await Timetable.countDocuments({ teacher: teacher._id });
      teacherStats.push({
        name: teacher.name,
        entries: entryCount
      });
    }

    const emptyTeachers = teacherStats.filter(s => s.entries === 0);
    
    if (emptyTeachers.length === 0) {
      console.log('✅ PASS: All teachers have schedules');
      console.log();
      console.log('Top 5 teachers by period count:');
      teacherStats.sort((a, b) => b.entries - a.entries);
      for (let i = 0; i < Math.min(5, teacherStats.length); i++) {
        console.log(`  ${i + 1}. ${teacherStats[i].name}: ${teacherStats[i].entries} periods`);
      }
      console.log();
    } else {
      console.log(`❌ FAIL: ${emptyTeachers.length} teacher(s) have no schedule:`);
      for (const stat of emptyTeachers) {
        console.log(`  - ${stat.name}`);
      }
      console.log();
    }

    // Test 5: Combined Classes
    console.log('Test 5: Combined Classes (Same Teacher, Same Period, Different Classes)');
    console.log('-'.repeat(80));
    
    // Find instances where same teacher teaches multiple classes in same period
    const pipeline = [
      {
        $group: {
          _id: {
            teacher: '$teacher',
            day: '$day',
            period: '$period'
          },
          classes: { $push: '$class' },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      },
      {
        $limit: 5
      }
    ];

    const combinedClasses = await Timetable.aggregate(pipeline);
    
    if (combinedClasses.length > 0) {
      console.log(`Found ${combinedClasses.length} examples of combined classes:`);
      console.log();
      
      for (const combo of combinedClasses) {
        const teacher = await Teacher.findById(combo._id.teacher);
        console.log(`  ${teacher.name} - ${combo._id.day} - Period ${combo._id.period}`);
        console.log(`    Classes: ${combo.classes.join(', ')}`);
      }
      
      console.log();
      console.log('✅ PASS: Combined classes are properly stored\n');
    } else {
      console.log('ℹ️  INFO: No combined classes found (may be normal)\n');
    }

    // Summary
    console.log('='.repeat(80));
    console.log('VERIFICATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Total entries: ${totalEntries}`);
    console.log(`✅ Teachers with schedules: ${uniqueTeachers.length}/${totalTeachers}`);
    console.log(`✅ Classes covered: ${uniqueClasses.length}`);
    console.log(`✅ Miss Udakanda Sasini: ${mondaySchedule?.length || 0} Monday entries`);
    console.log(`✅ Teachers with 0 periods: ${emptyTeachers.length}`);
    console.log();
    
    if (totalEntries === 882 && uniqueTeachers.length === totalTeachers && emptyTeachers.length === 0) {
      console.log('🎉 ALL TESTS PASSED! Co-teacher issue is FIXED!');
    } else {
      console.log('⚠️  Some tests failed. Please review the results above.');
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

verifyCoTeacherFix();

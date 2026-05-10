import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Teacher from '../models/Teacher.js';
import Timetable from '../models/Timetable.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function verifyAllTeachers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all teachers
    const allTeachers = await Teacher.find().sort({ name: 1 });
    console.log(`📊 Total teachers in database: ${allTeachers.length}\n`);

    // Get all timetable entries
    const totalTimetableEntries = await Timetable.countDocuments();
    console.log(`📅 Total timetable entries: ${totalTimetableEntries}\n`);

    // Check each teacher
    const teachersWithSchedule = [];
    const teachersWithoutSchedule = [];

    console.log('🔍 Checking each teacher...\n');
    console.log('='.repeat(80));

    for (const teacher of allTeachers) {
      const timetableCount = await Timetable.countDocuments({ teacher: teacher._id });
      
      if (timetableCount > 0) {
        teachersWithSchedule.push({
          id: teacher._id,
          name: teacher.name,
          subjects: teacher.subjects,
          periodCount: timetableCount
        });
        console.log(`✅ ${teacher.name.padEnd(35)} - ${timetableCount} periods`);
      } else {
        teachersWithoutSchedule.push({
          id: teacher._id,
          name: teacher.name,
          subjects: teacher.subjects
        });
        console.log(`❌ ${teacher.name.padEnd(35)} - NO SCHEDULE`);
      }
    }

    console.log('='.repeat(80));
    console.log('\n📈 SUMMARY\n');
    console.log(`✅ Teachers WITH schedule: ${teachersWithSchedule.length}`);
    console.log(`❌ Teachers WITHOUT schedule: ${teachersWithoutSchedule.length}`);
    console.log(`📊 Coverage: ${((teachersWithSchedule.length / allTeachers.length) * 100).toFixed(1)}%\n`);

    if (teachersWithoutSchedule.length > 0) {
      console.log('⚠️  TEACHERS WITHOUT SCHEDULE:\n');
      teachersWithoutSchedule.forEach((t, index) => {
        console.log(`${index + 1}. ${t.name} (${t.subjects.join(', ')})`);
      });
      console.log('\n');
    }

    // Check for orphaned timetable entries (teacher not found)
    const allTimetableTeacherIds = await Timetable.distinct('teacher');
    const teacherIds = allTeachers.map(t => t._id.toString());
    const orphanedIds = allTimetableTeacherIds.filter(
      id => !teacherIds.includes(id.toString())
    );

    if (orphanedIds.length > 0) {
      console.log(`⚠️  ORPHANED TIMETABLE ENTRIES: ${orphanedIds.length}`);
      console.log('These timetable entries reference teachers that don\'t exist:\n');
      for (const id of orphanedIds) {
        const count = await Timetable.countDocuments({ teacher: id });
        console.log(`  - Teacher ID: ${id} (${count} entries)`);
      }
      console.log('\n');
    }

    // Show schedule distribution by day
    console.log('📅 SCHEDULE DISTRIBUTION BY DAY\n');
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    for (const day of days) {
      const count = await Timetable.countDocuments({ day });
      const teacherCount = (await Timetable.distinct('teacher', { day })).length;
      console.log(`  ${day.padEnd(12)} - ${count} periods, ${teacherCount} teachers`);
    }
    console.log('\n');

    // Show schedule distribution by period
    console.log('⏰ SCHEDULE DISTRIBUTION BY PERIOD\n');
    for (let period = 1; period <= 8; period++) {
      const count = await Timetable.countDocuments({ period });
      const teacherCount = (await Timetable.distinct('teacher', { period })).length;
      console.log(`  Period ${period}     - ${count} entries, ${teacherCount} teachers`);
    }
    console.log('\n');

    // Recommendations
    console.log('💡 RECOMMENDATIONS\n');
    
    if (teachersWithoutSchedule.length > 0) {
      console.log('⚠️  ACTION REQUIRED: Re-import timetable to fix missing schedules');
      console.log('   Steps:');
      console.log('   1. Go to Timetable page');
      console.log('   2. Click "Clear All Timetable" button');
      console.log('   3. Click "Import Timetable" button');
      console.log('   4. Upload: for the data base.xml');
      console.log('   5. Wait for import to complete');
      console.log('   6. Run this script again to verify\n');
    } else {
      console.log('✅ All teachers have schedules - system is ready to use!\n');
    }

    if (orphanedIds.length > 0) {
      console.log('⚠️  Clean up orphaned entries:');
      console.log('   Run: node scripts/cleanOrphanedEntries.js\n');
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

    // Exit with error code if there are issues
    if (teachersWithoutSchedule.length > 0 || orphanedIds.length > 0) {
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

verifyAllTeachers();

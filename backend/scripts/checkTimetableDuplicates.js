import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Timetable from '../models/Timetable.js';
import Teacher from '../models/Teacher.js';

// Load environment variables
dotenv.config();

/**
 * Script to check for duplicate timetable entries
 * Finds entries with same (teacher, day, period) combination
 */
async function checkTimetableDuplicates() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('\nChecking for duplicate timetable entries...');
    
    // Find all timetable entries
    const allEntries = await Timetable.find({})
      .populate('teacher', 'name')
      .sort({ day: 1, period: 1 });

    console.log(`Total timetable entries found: ${allEntries.length}`);

    // Group by (teacher, day, period)
    const groupedEntries = {};
    
    for (const entry of allEntries) {
      if (!entry.teacher) {
        console.log(`⚠️  Entry without teacher: ${entry._id}`);
        continue;
      }
      
      const key = `${entry.teacher._id}_${entry.day}_${entry.period}`;
      
      if (!groupedEntries[key]) {
        groupedEntries[key] = [];
      }
      
      groupedEntries[key].push(entry);
    }

    // Find duplicates
    const duplicateGroups = Object.entries(groupedEntries).filter(([key, entries]) => entries.length > 1);
    
    console.log(`\nFound ${duplicateGroups.length} groups with duplicates`);

    if (duplicateGroups.length === 0) {
      console.log('✅ No duplicates found. Timetable is clean!');
      await mongoose.connection.close();
      return;
    }

    // Display duplicates
    console.log('\n=== DUPLICATE TIMETABLE ENTRIES ===\n');
    
    for (const [key, entries] of duplicateGroups) {
      const [teacherId, day, period] = key.split('_');
      
      console.log(`--- Duplicate Group ---`);
      console.log(`Teacher: ${entries[0].teacher.name}`);
      console.log(`Day: ${day}`);
      console.log(`Period: ${period}`);
      console.log(`Count: ${entries.length} entries`);
      console.log('Details:');
      
      for (const entry of entries) {
        console.log(`  - ID: ${entry._id}`);
        console.log(`    Class: ${entry.class}`);
        console.log(`    Subject: ${entry.subject}`);
        console.log(`    Time: ${entry.startTime} - ${entry.endTime}`);
        console.log(`    Created: ${entry.createdAt}`);
        console.log('');
      }
    }

    console.log(`\n⚠️  Total duplicate groups: ${duplicateGroups.length}`);
    console.log(`⚠️  Total duplicate entries: ${duplicateGroups.reduce((sum, [, entries]) => sum + entries.length - 1, 0)}`);
    
    console.log('\n💡 To clean up duplicates, you can:');
    console.log('   1. Manually delete duplicate entries from the database');
    console.log('   2. Re-import the timetable from XML');
    console.log('   3. Run a cleanup script (to be created)');

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    
  } catch (error) {
    console.error('❌ Error during check:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the check
checkTimetableDuplicates();

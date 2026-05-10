import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Substitution from '../models/Substitution.js';
import Teacher from '../models/Teacher.js';

// Load environment variables
dotenv.config();

/**
 * Script to clean up duplicate substitution records
 * Keeps only the most recent substitution for each (absentTeacher, date, period) combination
 */
async function cleanupDuplicateSubstitutions() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('\nFinding duplicate substitutions...');
    
    // Find all substitutions
    const allSubstitutions = await Substitution.find({})
      .populate('absentTeacher', 'name')
      .populate('substituteTeacher', 'name')
      .sort({ createdAt: -1 }); // Most recent first

    console.log(`Total substitutions found: ${allSubstitutions.length}`);

    // Group by (absentTeacher, date, period)
    const groupedSubstitutions = {};
    
    for (const sub of allSubstitutions) {
      const key = `${sub.absentTeacher._id}_${sub.date.toISOString().split('T')[0]}_${sub.period}`;
      
      if (!groupedSubstitutions[key]) {
        groupedSubstitutions[key] = [];
      }
      
      groupedSubstitutions[key].push(sub);
    }

    // Find duplicates
    const duplicateGroups = Object.entries(groupedSubstitutions).filter(([key, subs]) => subs.length > 1);
    
    console.log(`\nFound ${duplicateGroups.length} groups with duplicates`);

    if (duplicateGroups.length === 0) {
      console.log('No duplicates found. Database is clean!');
      await mongoose.connection.close();
      return;
    }

    // Process each duplicate group
    let totalDeleted = 0;
    
    for (const [key, subs] of duplicateGroups) {
      const [teacherId, date, period] = key.split('_');
      
      console.log(`\n--- Duplicate Group ---`);
      console.log(`Teacher: ${subs[0].absentTeacher.name}`);
      console.log(`Date: ${date}`);
      console.log(`Period: ${period}`);
      console.log(`Count: ${subs.length} records`);
      
      // Keep the most recent one (first in array since we sorted by createdAt desc)
      const toKeep = subs[0];
      const toDelete = subs.slice(1);
      
      console.log(`Keeping: ${toKeep._id} (Substitute: ${toKeep.substituteTeacher.name}, Created: ${toKeep.createdAt})`);
      
      for (const sub of toDelete) {
        console.log(`Deleting: ${sub._id} (Substitute: ${sub.substituteTeacher.name}, Created: ${sub.createdAt})`);
        await Substitution.findByIdAndDelete(sub._id);
        totalDeleted++;
      }
    }

    console.log(`\n✅ Cleanup complete!`);
    console.log(`Total duplicates deleted: ${totalDeleted}`);
    console.log(`Remaining substitutions: ${allSubstitutions.length - totalDeleted}`);

    // Create unique index to prevent future duplicates
    console.log('\nCreating unique index to prevent future duplicates...');
    try {
      await Substitution.collection.createIndex(
        { absentTeacher: 1, date: 1, period: 1 },
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
    console.log('\nDatabase connection closed');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the cleanup
cleanupDuplicateSubstitutions();

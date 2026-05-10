import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Timetable from '../models/Timetable.js';

// Load environment variables
dotenv.config();

/**
 * Script to clear all timetable entries
 */
async function clearTimetable() {
  try {
    console.log('🚀 Starting timetable cleanup...\n');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Count existing entries
    const existingCount = await Timetable.countDocuments();
    console.log(`📊 Current timetable entries: ${existingCount}`);

    if (existingCount === 0) {
      console.log('✅ Timetable is already empty!\n');
      await mongoose.connection.close();
      return;
    }

    // Delete all timetable entries
    console.log('\n🗑️  Deleting all timetable entries...');
    const deleteResult = await Timetable.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} timetable entries\n`);

    // Verify deletion
    const remainingCount = await Timetable.countDocuments();
    console.log(`📊 Remaining entries: ${remainingCount}`);

    if (remainingCount === 0) {
      console.log('\n✅ Timetable cleared successfully!');
      console.log('\n💡 Next steps:');
      console.log('   1. Go to the Timetable page in the web app');
      console.log('   2. Click "Import Timetable"');
      console.log('   3. Select the XML file: "for the data base.xml"');
      console.log('   4. Click "Import"');
      console.log('\n   The system will automatically remove duplicates during import.');
    } else {
      console.log('\n⚠️  Warning: Some entries remain in the database');
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed\n');
    
  } catch (error) {
    console.error('\n❌ Error during cleanup:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
clearTimetable();

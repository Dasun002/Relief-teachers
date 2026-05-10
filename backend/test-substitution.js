// Test script to debug substitution allocation
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SubstitutionService from './services/SubstitutionService.js';
import AttendanceService from './services/AttendanceService.js';

dotenv.config();

async function test() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test data from the screenshot
    const testData = {
      absentTeacherId: '6745e8e2b2c27728dcf06a8d2',  // Miss Udakanda Sasini
      substituteTeacherId: '6745e8e2b2c27728dcf06a8d7',  // Mrs Dahanayaka Shirani
      class: '6B',
      period: 1,
      date: '2026-05-06',  // Wednesday
      subject: 'Science'
    };

    console.log('\n=== Testing Substitution Allocation ===');
    console.log('Test Data:', JSON.stringify(testData, null, 2));

    // Check if teacher is absent
    console.log('\n=== Checking Teacher Absence ===');
    const isAbsent = await AttendanceService.isTeacherAbsent(
      testData.absentTeacherId,
      new Date(testData.date),
      testData.period
    );
    console.log(`Is teacher absent for period ${testData.period}?`, isAbsent);

    // Try to allocate substitute
    console.log('\n=== Attempting Allocation ===');
    const result = await SubstitutionService.allocateSubstitute(testData);
    console.log('Success!', result);

  } catch (error) {
    console.error('\n=== ERROR ===');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

test();

/**
 * Seed Test Data Script
 * Creates sample teachers for testing the inline substitution feature
 */

import mongoose from 'mongoose';
import Teacher from './models/Teacher.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teacher-attendance';

const testTeachers = [
  { name: 'Mr. John Smith', subjects: ['Math', 'Physics'] },
  { name: 'Ms. Jane Doe', subjects: ['English', 'History'] },
  { name: 'Mr. Bob Johnson', subjects: ['Chemistry', 'Biology'] },
  { name: 'Ms. Alice Brown', subjects: ['Math', 'Science'] },
  { name: 'Mr. Charlie Wilson', subjects: ['Geography', 'Social Studies'] },
  { name: 'Ms. Diana Prince', subjects: ['Art', 'Music'] },
  { name: 'Mr. Edward Norton', subjects: ['Physical Education', 'Health'] },
  { name: 'Ms. Fiona Green', subjects: ['Computer Science', 'IT'] },
];

async function seedData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if teachers already exist
    const existingCount = await Teacher.countDocuments();
    console.log(`Found ${existingCount} existing teachers`);

    if (existingCount > 0) {
      console.log('Teachers already exist. Skipping seed.');
      console.log('To re-seed, delete existing teachers first.');
      process.exit(0);
    }

    // Create teachers
    console.log('Creating test teachers...');
    const createdTeachers = await Teacher.insertMany(testTeachers);
    console.log(`✅ Created ${createdTeachers.length} teachers:`);
    createdTeachers.forEach(teacher => {
      console.log(`   - ${teacher.name} (${teacher.subjects.join(', ')})`);
    });

    console.log('\n✅ Test data seeded successfully!');
    console.log('\nYou can now:');
    console.log('1. Login to the app (admin/admin123)');
    console.log('2. Go to Attendance page');
    console.log('3. Select a weekday date');
    console.log('4. Mark a teacher as absent');
    console.log('5. Test the inline substitution feature');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();

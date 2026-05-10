// Check teacher IDs in database
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Teacher from './models/Teacher.js';

dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const teachers = await Teacher.find({}).limit(5);
    
    console.log('=== First 5 Teachers ===\n');
    teachers.forEach(teacher => {
      console.log(`Name: ${teacher.name}`);
      console.log(`ID: ${teacher._id}`);
      console.log(`ID Length: ${teacher._id.toString().length}`);
      console.log(`Subjects: ${teacher.subjects.join(', ')}`);
      console.log('---');
    });

    // Check for Miss Udakanda Sasini
    const udakanda = await Teacher.findOne({ name: /Udakanda/i });
    if (udakanda) {
      console.log('\n=== Miss Udakanda Sasini ===');
      console.log(`ID: ${udakanda._id}`);
      console.log(`ID Length: ${udakanda._id.toString().length}`);
      console.log(`Subjects: ${udakanda.subjects.join(', ')}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

check();

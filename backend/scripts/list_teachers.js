import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const TeacherSchema = new mongoose.Schema({
  name: String,
  subjects: [String],
});

const Teacher = mongoose.model('Teacher', TeacherSchema);

async function listTeachers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const teachers = await Teacher.find().sort({ name: 1 });
    console.log(`Total teachers: ${teachers.length}\n`);
    
    teachers.forEach((t, i) => {
      console.log(`${i + 1}. ${t.name} (${t.subjects.join(', ')})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

listTeachers();

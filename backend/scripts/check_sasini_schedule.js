import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const TimetableSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  class: String,
  subject: String,
  day: String,
  period: Number,
  startTime: String,
  endTime: String,
});

const TeacherSchema = new mongoose.Schema({
  name: String,
  subjects: [String],
});

const Timetable = mongoose.model('Timetable', TimetableSchema);
const Teacher = mongoose.model('Teacher', TeacherSchema);

async function checkSchedule() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Find teacher
    const teacher = await Teacher.findOne({ name: 'Miss Udakanda Sasini' });
    if (!teacher) {
      console.log('Teacher not found');
      return;
    }

    console.log('Teacher:', teacher.name);
    console.log('Teacher ID:', teacher._id);
    console.log('Subjects:', teacher.subjects);

    // Get all schedule entries
    const allSchedule = await Timetable.find({ teacher: teacher._id }).sort({ day: 1, period: 1 });
    console.log('\n=== ALL SCHEDULE ENTRIES ===');
    console.log('Total entries:', allSchedule.length);
    
    // Group by day
    const byDay = {};
    allSchedule.forEach(entry => {
      if (!byDay[entry.day]) byDay[entry.day] = [];
      byDay[entry.day].push(entry);
    });

    Object.keys(byDay).sort().forEach(day => {
      console.log(`\n${day}: ${byDay[day].length} periods`);
      byDay[day].forEach(entry => {
        console.log(`  Period ${entry.period} (${entry.startTime}-${entry.endTime}): ${entry.class} - ${entry.subject}`);
      });
    });

    // Check Monday specifically
    console.log('\n=== MONDAY SCHEDULE (what API should return) ===');
    const mondaySchedule = await Timetable.find({ 
      teacher: teacher._id,
      day: 'Monday'
    }).sort({ period: 1 });

    console.log('Total Monday periods:', mondaySchedule.length);
    if (mondaySchedule.length > 0) {
      mondaySchedule.forEach(entry => {
        console.log(`Period ${entry.period} (${entry.startTime}-${entry.endTime}): ${entry.class} - ${entry.subject}`);
      });
    } else {
      console.log('No Monday schedule found!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkSchedule();

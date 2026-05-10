import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Teacher from '../models/Teacher.js';
import Timetable from '../models/Timetable.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

async function checkTeacherTimetable() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the teacher "Miss Jayathissa Jeewani"
    const teacher = await Teacher.findOne({ name: /Jayathissa/i });
    
    if (!teacher) {
      console.log('❌ Teacher not found');
      return;
    }

    console.log('\n✅ Teacher found:');
    console.log('  ID:', teacher._id);
    console.log('  Name:', teacher.name);
    console.log('  Subjects:', teacher.subjects);

    // Check timetable entries for this teacher
    const timetableEntries = await Timetable.find({ teacher: teacher._id })
      .sort({ day: 1, period: 1 });

    console.log(`\n📅 Timetable entries: ${timetableEntries.length}`);

    if (timetableEntries.length === 0) {
      console.log('❌ No timetable entries found for this teacher');
      
      // Check if there are any timetable entries at all
      const totalEntries = await Timetable.countDocuments();
      console.log(`\n📊 Total timetable entries in database: ${totalEntries}`);
      
      // Check a sample entry to see the structure
      const sampleEntry = await Timetable.findOne().populate('teacher');
      if (sampleEntry) {
        console.log('\n📝 Sample timetable entry:');
        console.log('  Class:', sampleEntry.class);
        console.log('  Day:', sampleEntry.day);
        console.log('  Period:', sampleEntry.period);
        console.log('  Teacher ID:', sampleEntry.teacher._id);
        console.log('  Teacher Name:', sampleEntry.teacher.name);
        console.log('  Subject:', sampleEntry.subject);
      }
      
      // List all teachers in timetable
      const teachersInTimetable = await Timetable.distinct('teacher');
      console.log(`\n👥 Unique teachers in timetable: ${teachersInTimetable.length}`);
      
      // Get teacher names
      const teacherDocs = await Teacher.find({ _id: { $in: teachersInTimetable } });
      console.log('\n📋 Teachers with timetable entries:');
      teacherDocs.forEach(t => {
        console.log(`  - ${t.name} (${t._id})`);
      });
      
    } else {
      // Group by day
      const byDay = {};
      timetableEntries.forEach(entry => {
        if (!byDay[entry.day]) byDay[entry.day] = [];
        byDay[entry.day].push(entry);
      });

      console.log('\n📅 Schedule by day:');
      Object.keys(byDay).forEach(day => {
        console.log(`\n  ${day}:`);
        byDay[day].forEach(entry => {
          console.log(`    Period ${entry.period} (${entry.startTime}-${entry.endTime}): ${entry.class} - ${entry.subject}`);
        });
      });
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

checkTeacherTimetable();

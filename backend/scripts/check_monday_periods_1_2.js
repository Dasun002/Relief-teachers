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

const Timetable = mongoose.model('Timetable', TimetableSchema);

async function checkMondayPeriods() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Find all entries for Monday periods 1 and 2
    const period1 = await Timetable.find({ day: 'Monday', period: 1 }).populate('teacher', 'name');
    const period2 = await Timetable.find({ day: 'Monday', period: 2 }).populate('teacher', 'name');

    console.log('=== MONDAY PERIOD 1 ===');
    console.log(`Total entries: ${period1.length}`);
    period1.forEach(entry => {
      console.log(`${entry.class} - ${entry.subject} - ${entry.teacher.name}`);
    });

    console.log('\n=== MONDAY PERIOD 2 ===');
    console.log(`Total entries: ${period2.length}`);
    period2.forEach(entry => {
      console.log(`${entry.class} - ${entry.subject} - ${entry.teacher.name}`);
    });

    // Check if Miss Udakanda Sasini has any Monday period 1 or 2
    const sasini = await Timetable.find({
      day: 'Monday',
      period: { $in: [1, 2] }
    }).populate('teacher', 'name').then(entries => 
      entries.filter(e => e.teacher.name === 'Miss Udakanda Sasini')
    );

    console.log('\n=== Miss Udakanda Sasini - Monday Periods 1 & 2 ===');
    console.log(`Found: ${sasini.length} entries`);
    sasini.forEach(entry => {
      console.log(`Period ${entry.period}: ${entry.class} - ${entry.subject}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkMondayPeriods();

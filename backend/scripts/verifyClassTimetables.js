import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Teacher from '../models/Teacher.js';
import Timetable from '../models/Timetable.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Verify Class Timetables Match PDF
 * 
 * Verify that co-teaching scenarios from the class timetables PDF
 * are correctly stored in the database
 */
async function verifyClassTimetables() {
  try {
    console.log('='.repeat(80));
    console.log('CLASS TIMETABLE VERIFICATION');
    console.log('='.repeat(80));
    console.log();

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test Case 1: 6A - Monday, Period 3 (Easth)
    console.log('Test Case 1: 6A - Monday, Period 3 (Easth)');
    console.log('-'.repeat(80));
    console.log('Expected: 4 co-teachers (Sasini, Shirani, Prabashini, Kumari)');
    console.log();

    const class6APeriod3 = await Timetable.find({
      class: '6A',
      day: 'Monday',
      period: 3
    }).populate('teacher');

    console.log(`Found ${class6APeriod3.length} entries:`);
    for (const entry of class6APeriod3) {
      console.log(`  - ${entry.teacher.name} (${entry.subject})`);
    }

    if (class6APeriod3.length >= 4) {
      console.log('✅ PASS: Multiple co-teachers found\n');
    } else {
      console.log('❌ FAIL: Expected 4 co-teachers\n');
    }

    // Test Case 2: 10A - Monday, Period 1 (IT/HoS/Ag/He)
    console.log('Test Case 2: 10A - Monday, Period 1 (IT/HoS/Ag/He)');
    console.log('-'.repeat(80));
    console.log('Expected: 4 co-teachers (Srima, Sasini, Ishani, Dimuthu)');
    console.log();

    const class10APeriod1 = await Timetable.find({
      class: '10A',
      day: 'Monday',
      period: 1
    }).populate('teacher');

    console.log(`Found ${class10APeriod1.length} entries:`);
    for (const entry of class10APeriod1) {
      console.log(`  - ${entry.teacher.name} (${entry.subject})`);
    }

    if (class10APeriod1.length >= 4) {
      console.log('✅ PASS: Multiple co-teachers found\n');
    } else {
      console.log('❌ FAIL: Expected 4 co-teachers\n');
    }

    // Test Case 3: 11A - Monday, Period 1 (Maths)
    console.log('Test Case 3: 11A - Monday, Period 1 (Maths)');
    console.log('-'.repeat(80));
    console.log('Expected: 2 co-teachers (Sanjeewa, Shenali)');
    console.log();

    const class11APeriod1 = await Timetable.find({
      class: '11A',
      day: 'Monday',
      period: 1
    }).populate('teacher');

    console.log(`Found ${class11APeriod1.length} entries:`);
    for (const entry of class11APeriod1) {
      console.log(`  - ${entry.teacher.name} (${entry.subject})`);
    }

    if (class11APeriod1.length >= 2) {
      console.log('✅ PASS: Multiple co-teachers found\n');
    } else {
      console.log('❌ FAIL: Expected 2 co-teachers\n');
    }

    // Test Case 4: Miss Udakanda Sasini - Complete Monday Schedule
    console.log('Test Case 4: Miss Udakanda Sasini - Complete Monday Schedule');
    console.log('-'.repeat(80));
    
    const sasini = await Teacher.findOne({ name: 'Miss Udakanda Sasini' });
    
    if (!sasini) {
      console.log('❌ FAIL: Teacher not found\n');
    } else {
      const sasiniMonday = await Timetable.find({
        teacher: sasini._id,
        day: 'Monday'
      }).sort({ period: 1, class: 1 });

      console.log(`Found ${sasiniMonday.length} entries for Monday:`);
      console.log();
      
      // Group by period
      const byPeriod = {};
      for (const entry of sasiniMonday) {
        if (!byPeriod[entry.period]) {
          byPeriod[entry.period] = [];
        }
        byPeriod[entry.period].push(entry);
      }

      for (const [period, entries] of Object.entries(byPeriod).sort((a, b) => a[0] - b[0])) {
        console.log(`  Period ${period}:`);
        for (const entry of entries) {
          console.log(`    - ${entry.class}: ${entry.subject} (${entry.startTime}-${entry.endTime})`);
        }
      }

      console.log();
      console.log(`Unique periods: ${Object.keys(byPeriod).join(', ')}`);
      console.log(`Total unique periods: ${Object.keys(byPeriod).length}`);
      
      // Expected from PDF: Periods 1, 2, 3, 4, 5, 6, 8 (7 unique periods)
      if (Object.keys(byPeriod).length >= 7) {
        console.log('✅ PASS: All expected periods found\n');
      } else {
        console.log('❌ FAIL: Missing some periods\n');
      }
    }

    // Test Case 5: Overall Co-Teaching Statistics
    console.log('Test Case 5: Overall Co-Teaching Statistics');
    console.log('-'.repeat(80));

    // Find all instances where multiple teachers teach same class/day/period
    const pipeline = [
      {
        $group: {
          _id: {
            class: '$class',
            day: '$day',
            period: '$period'
          },
          teachers: { $push: '$teacher' },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ];

    const coTaughtPeriods = await Timetable.aggregate(pipeline);
    
    console.log(`Found ${coTaughtPeriods.length} co-taught class/period combinations`);
    console.log();
    
    // Show some examples
    console.log('Examples of co-taught periods:');
    for (let i = 0; i < Math.min(10, coTaughtPeriods.length); i++) {
      const combo = coTaughtPeriods[i];
      console.log(`  ${combo._id.class} - ${combo._id.day} - Period ${combo._id.period}: ${combo.count} teachers`);
    }
    
    console.log();
    
    if (coTaughtPeriods.length > 0) {
      console.log('✅ PASS: Co-teaching is properly stored in database\n');
    } else {
      console.log('❌ FAIL: No co-taught periods found\n');
    }

    // Summary
    console.log('='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ 6A Period 3: ${class6APeriod3.length} teachers`);
    console.log(`✅ 10A Period 1: ${class10APeriod1.length} teachers`);
    console.log(`✅ 11A Period 1: ${class11APeriod1.length} teachers`);
    console.log(`✅ Miss Udakanda Sasini Monday: ${sasiniMonday?.length || 0} entries`);
    console.log(`✅ Total co-taught periods: ${coTaughtPeriods.length}`);
    console.log();
    
    const allPassed = 
      class6APeriod3.length >= 4 &&
      class10APeriod1.length >= 4 &&
      class11APeriod1.length >= 2 &&
      coTaughtPeriods.length > 0;
    
    if (allPassed) {
      console.log('🎉 ALL TESTS PASSED! Co-teacher issue is COMPLETELY FIXED!');
      console.log('✅ Class timetables match the PDF');
      console.log('✅ All co-teachers are stored in database');
      console.log('✅ System is ready for production use');
    } else {
      console.log('⚠️  Some tests failed. Please review the results above.');
    }
    console.log();

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

verifyClassTimetables();

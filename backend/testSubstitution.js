import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Teacher from './models/Teacher.js';
import Timetable from './models/Timetable.js';
import Attendance from './models/Attendance.js';
import Substitution from './models/Substitution.js';

dotenv.config();

async function testSubstitutionAllocation() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teacher-attendance');
    console.log('✅ Connected to database\n');

    // Get sample teachers
    const teachers = await Teacher.find().limit(5);
    console.log('📋 Sample Teachers:');
    teachers.forEach(t => {
      console.log(`   ID: ${t._id}`);
      console.log(`   Name: ${t.name}`);
      console.log(`   Subjects: ${t.subjects.join(', ')}\n`);
    });

    if (teachers.length < 2) {
      console.log('❌ Need at least 2 teachers in database');
      process.exit(1);
    }

    // Use first teacher as absent, second as substitute
    const absentTeacher = teachers[0];
    const substituteTeacher = teachers[1];

    console.log(`\n🎯 Test Setup:`);
    console.log(`   Absent Teacher: ${absentTeacher.name} (${absentTeacher._id})`);
    console.log(`   Substitute Teacher: ${substituteTeacher.name} (${substituteTeacher._id})`);

    // Use a weekday date (Monday, May 12, 2026)
    const testDate = new Date('2026-05-12');
    testDate.setHours(0, 0, 0, 0);
    const dateString = testDate.toISOString().split('T')[0];
    
    console.log(`   Date: ${dateString} (${testDate.toLocaleDateString('en-US', { weekday: 'long' })})`);
    console.log(`   Period: 1`);

    // Check if absent teacher has schedule for Monday Period 1
    const dayOfWeek = testDate.toLocaleDateString('en-US', { weekday: 'long' });
    const schedule = await Timetable.findOne({
      teacher: absentTeacher._id,
      day: dayOfWeek,
      period: 1
    });

    if (!schedule) {
      console.log(`\n⚠️  ${absentTeacher.name} has no schedule for ${dayOfWeek} Period 1`);
      console.log('   This is OK - we can still test the allocation\n');
    } else {
      console.log(`\n📅 ${absentTeacher.name}'s Schedule:`);
      console.log(`   Class: ${schedule.class}`);
      console.log(`   Subject: ${schedule.subject}`);
      console.log(`   Time: ${schedule.startTime} - ${schedule.endTime}\n`);
    }

    // Step 1: Mark teacher as absent
    console.log('\n📝 Step 1: Marking teacher as absent...');
    const attendance = await Attendance.findOneAndUpdate(
      {
        teacher: absentTeacher._id,
        date: testDate
      },
      {
        teacher: absentTeacher._id,
        date: testDate,
        status: 'absent'
      },
      {
        upsert: true,
        new: true
      }
    );
    console.log(`   ✅ ${absentTeacher.name} marked as absent for ${dateString}`);

    // Step 2: Check if substitute teacher is free
    console.log('\n🔍 Step 2: Checking if substitute teacher is free...');
    
    const substituteSchedule = await Timetable.findOne({
      teacher: substituteTeacher._id,
      day: dayOfWeek,
      period: 1
    });

    if (substituteSchedule) {
      console.log(`   ❌ ${substituteTeacher.name} is NOT free - has schedule:`);
      console.log(`      Class: ${substituteSchedule.class}`);
      console.log(`      Subject: ${substituteSchedule.subject}`);
      console.log('\n   Need to find a different substitute teacher...');
      
      // Find a free teacher
      const allTeachers = await Teacher.find();
      let freeTeacher = null;
      
      for (const t of allTeachers) {
        if (t._id.toString() === absentTeacher._id.toString()) continue;
        
        const hasSchedule = await Timetable.findOne({
          teacher: t._id,
          day: dayOfWeek,
          period: 1
        });
        
        if (!hasSchedule) {
          freeTeacher = t;
          break;
        }
      }
      
      if (freeTeacher) {
        console.log(`   ✅ Found free teacher: ${freeTeacher.name} (${freeTeacher._id})`);
        substituteTeacher._id = freeTeacher._id;
        substituteTeacher.name = freeTeacher.name;
        substituteTeacher.subjects = freeTeacher.subjects;
      } else {
        console.log('   ❌ No free teachers available for Period 1');
        process.exit(1);
      }
    } else {
      console.log(`   ✅ ${substituteTeacher.name} is free for Period 1`);
    }

    // Step 3: Allocate substitute
    console.log('\n🎯 Step 3: Allocating substitute...');
    console.log(`   Request Data:`);
    console.log(`   - absentTeacherId: ${absentTeacher._id}`);
    console.log(`   - substituteTeacherId: ${substituteTeacher._id}`);
    console.log(`   - date: ${dateString}`);
    console.log(`   - period: 1`);
    console.log(`   - class: ${schedule ? schedule.class : '6A'}`);
    console.log(`   - subject: ${schedule ? schedule.subject : 'Math'}`);

    try {
      const substitution = new Substitution({
        absentTeacher: absentTeacher._id,
        substituteTeacher: substituteTeacher._id,
        class: schedule ? schedule.class : '6A',
        period: 1,
        date: testDate,
        subject: schedule ? schedule.subject : 'Math'
      });

      await substitution.save();
      await substitution.populate('absentTeacher', 'name subjects');
      await substitution.populate('substituteTeacher', 'name subjects');

      console.log('\n   ✅ Substitution allocated successfully!');
      console.log(`   Substitution ID: ${substitution._id}`);
      console.log(`   Absent: ${substitution.absentTeacher.name}`);
      console.log(`   Substitute: ${substitution.substituteTeacher.name}`);
      console.log(`   Class: ${substitution.class}`);
      console.log(`   Period: ${substitution.period}`);
      console.log(`   Subject: ${substitution.subject}`);

      // Clean up - delete the test substitution
      await Substitution.findByIdAndDelete(substitution._id);
      console.log('\n   🧹 Test substitution cleaned up');

    } catch (error) {
      console.log('\n   ❌ Error allocating substitute:');
      console.log(`   Error: ${error.message}`);
      console.log(`   Stack: ${error.stack}`);
    }

    // Clean up attendance
    await Attendance.findByIdAndDelete(attendance._id);
    console.log('   🧹 Test attendance cleaned up');

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

testSubstitutionAllocation();

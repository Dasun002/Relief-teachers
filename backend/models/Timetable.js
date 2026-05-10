import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema(
  {
    class: {
      type: String,
      required: [true, 'Class is required'],
      trim: true,
      match: [
        /^(6|7|8|9|10|11|12|13)[A-C]$/,
        'Class must be in format 6A-13C (e.g., 6A, 10B, 13C)',
      ],
    },
    period: {
      type: Number,
      required: [true, 'Period is required'],
      min: [1, 'Period must be between 1 and 8'],
      max: [8, 'Period must be between 1 and 8'],
    },
    day: {
      type: String,
      required: [true, 'Day is required'],
      enum: {
        values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        message: 'Day must be a weekday (Monday-Friday)',
      },
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Teacher is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        'Start time must be in HH:mm format (24-hour)',
      ],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        'End time must be in HH:mm format (24-hour)',
      ],
    },
    isCombinedClass: {
      type: Boolean,
      default: false,
    },
    alternateTeachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
// NOTE: Removed unique constraint on {class, day, period} to support co-teachers
// Multiple teachers can teach the same class/day/period (co-teaching scenario)
timetableSchema.index({ class: 1, day: 1, period: 1 }); // Non-unique index for queries
timetableSchema.index({ teacher: 1, day: 1, period: 1 }); // Find teacher's schedule
timetableSchema.index({ day: 1, period: 1 }); // Find all classes for a period

// Validation: endTime must be after startTime
timetableSchema.pre('save', function () {
  const start = this.startTime.split(':').map(Number);
  const end = this.endTime.split(':').map(Number);
  
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  
  if (endMinutes <= startMinutes) {
    throw new Error('End time must be after start time');
  }
});

const Timetable = mongoose.model('Timetable', timetableSchema);

export default Timetable;

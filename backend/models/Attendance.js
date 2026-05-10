import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Teacher is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['present', 'absent'],
        message: 'Status must be either present or absent',
      },
      default: 'present',
    },
    absentPeriods: {
      type: [Number],
      default: [],
      validate: {
        validator: function(periods) {
          // Each period must be between 1 and 8
          return periods.every(p => p >= 1 && p <= 8);
        },
        message: 'Period numbers must be between 1 and 8',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to ensure one attendance record per teacher per day
attendanceSchema.index({ teacher: 1, date: 1 }, { unique: true });

// Index on date for efficient date-based queries
attendanceSchema.index({ date: 1 });

// Validation: date must be a weekday (Monday-Friday)
attendanceSchema.pre('save', function (next) {
  const dayOfWeek = this.date.getDay();
  // 0 = Sunday, 6 = Saturday
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    next(new Error('Attendance can only be recorded for weekdays (Monday-Friday)'));
  } else {
    next();
  }
});

// Method to format date for display
attendanceSchema.methods.getFormattedDate = function () {
  return this.date.toISOString().split('T')[0];
};

// Method to check if teacher is absent for a specific period
attendanceSchema.methods.isAbsentForPeriod = function (period) {
  return this.absentPeriods.includes(period);
};

// Method to check if teacher is fully absent (all day)
attendanceSchema.methods.isFullyAbsent = function () {
  return this.status === 'absent' || this.absentPeriods.length === 8;
};

// Method to check if teacher is partially absent
attendanceSchema.methods.isPartiallyAbsent = function () {
  return this.absentPeriods.length > 0 && this.absentPeriods.length < 8;
};

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;

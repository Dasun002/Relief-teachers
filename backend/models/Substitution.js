import mongoose from 'mongoose';

const substitutionSchema = new mongoose.Schema(
  {
    absentTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Absent teacher is required'],
    },
    substituteTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Substitute teacher is required'],
    },
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
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      minlength: [2, 'Subject must be at least 2 characters long'],
      maxlength: [50, 'Subject must not exceed 50 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
substitutionSchema.index({ date: 1, period: 1 });
substitutionSchema.index({ substituteTeacher: 1, date: 1, period: 1 });
substitutionSchema.index({ absentTeacher: 1, date: 1 });
substitutionSchema.index({ class: 1 });

// UNIQUE constraint: Prevent duplicate substitutions for same absent teacher, date, and period
// This ensures only ONE substitution record exists per absent teacher per period per date
substitutionSchema.index({ absentTeacher: 1, date: 1, period: 1 }, { unique: true });

// Combined validation hook
substitutionSchema.pre('save', function () {
  // Validation 1: absentTeacher and substituteTeacher must be different
  if (this.absentTeacher.equals(this.substituteTeacher)) {
    throw new Error('Absent teacher and substitute teacher must be different');
  }
  
  // Validation 2: date must be a weekday (Monday-Friday)
  const dayOfWeek = this.date.getDay();
  // 0 = Sunday, 6 = Saturday
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    throw new Error('Substitution can only be recorded for weekdays (Monday-Friday)');
  }
});

// Method to format date for display
substitutionSchema.methods.getFormattedDate = function () {
  return this.date.toISOString().split('T')[0];
};

const Substitution = mongoose.model('Substitution', substitutionSchema);

export default Substitution;

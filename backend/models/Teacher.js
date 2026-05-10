import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Teacher name is required'],
      trim: true,
      minlength: [2, 'Teacher name must be at least 2 characters long'],
      maxlength: [100, 'Teacher name must not exceed 100 characters'],
    },
    subjects: {
      type: [String],
      required: [true, 'At least one subject is required'],
      validate: {
        validator: function (subjects) {
          // Ensure array is not empty
          if (!subjects || subjects.length === 0) {
            return false;
          }
          // Validate each subject
          return subjects.every(
            (subject) =>
              typeof subject === 'string' &&
              subject.trim().length >= 2 &&
              subject.trim().length <= 50
          );
        },
        message:
          'Each subject must be a string between 2 and 50 characters long',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
teacherSchema.index({ name: 1 });

// Method to get teacher with formatted data
teacherSchema.methods.toJSON = function () {
  const teacher = this.toObject();
  // Trim subjects
  teacher.subjects = teacher.subjects.map((s) => s.trim());
  return teacher;
};

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;

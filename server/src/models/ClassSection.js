const mongoose = require('mongoose');

const classSectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Class name is required (e.g. CSE-A)'],
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    section: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      default: 'A',
    },
    academicYear: {
      type: String,
      required: true,
      default: '2026-2027',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate class sections in the same department/semester/academicYear
classSectionSchema.index({ department: 1, semester: 1, section: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('ClassSection', classSectionSchema);

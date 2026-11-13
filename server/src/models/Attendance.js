const mongoose = require('mongoose');

const attendanceRecordItemSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Excused'],
      default: 'Present',
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
    },
    dateString: {
      type: String, // Store YYYY-MM-DD for fast string queries and strict uniqueness
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    classSection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassSection',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    records: [attendanceRecordItemSchema],
    totalStudents: {
      type: Number,
      default: 0,
    },
    presentCount: {
      type: Number,
      default: 0,
    },
    absentCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Strictly prevent duplicate attendance records for the same subject, class section and date
attendanceSchema.index({ subject: 1, classSection: 1, dateString: 1 }, { unique: true });

// Pre-save hook to calculate counts
attendanceSchema.pre('save', function (next) {
  if (this.records && this.records.length > 0) {
    this.totalStudents = this.records.length;
    this.presentCount = this.records.filter((r) => r.status === 'Present' || r.status === 'Late').length;
    this.absentCount = this.records.filter((r) => r.status === 'Absent').length;
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);

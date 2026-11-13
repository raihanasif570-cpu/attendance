const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['teacher', 'student', 'admin'],
      default: 'student',
    },
    phone: {
      type: String,
      default: '',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Student Specific Fields
    rollNumber: {
      type: String,
      trim: true,
      sparse: true, // Only enforces uniqueness when value exists
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
    },
    classSection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassSection',
    },
    parentPhone: {
      type: String,
      default: '',
    },
    admissionYear: {
      type: String,
      default: '2024',
    },

    // Teacher Specific Fields
    employeeId: {
      type: String,
      trim: true,
      sparse: true,
    },
    designation: {
      type: String,
      default: 'Faculty',
    },
    assignedSubjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    assignedClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClassSection',
      },
    ],
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password helper
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

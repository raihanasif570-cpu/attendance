const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'supersecretjwtkey_for_college_attendance_system_2026';
  return jwt.sign({ id }, secret, { expiresIn: '7d' });
};

// @desc    Login user (Teacher or Student)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user by email or rollNumber (for students)
    const user = await User.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { rollNumber: email.trim().toUpperCase() }],
    })
      .populate('department', 'name code')
      .populate('classSection', 'name semester section academicYear');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    // Role check if specifically provided
    if (role && user.role !== role && user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: `Account is registered as '${user.role}', but you selected '${role}'.`,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact admin.' });
    }

    const token = generateToken(user._id);

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      token,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('department', 'name code')
      .populate('classSection', 'name semester section academicYear')
      .populate('assignedSubjects', 'name code')
      .populate('assignedClasses', 'name semester section');

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, parentPhone } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (parentPhone !== undefined && user.role === 'student') {
      user.parentPhone = parentPhone.trim();
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('department', 'name code')
      .populate('classSection', 'name semester section academicYear');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
  updateProfile,
  changePassword,
};

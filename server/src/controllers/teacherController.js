const User = require('../models/User');

// @desc    Get all faculty / teachers
// @route   GET /api/teachers
// @access  Teacher / Admin
const getTeachers = async (req, res, next) => {
  try {
    const teachers = await User.find({ role: { $in: ['teacher', 'admin'] }, isActive: true })
      .select('-password')
      .populate('department', 'name code')
      .populate('assignedSubjects', 'name code')
      .populate('assignedClasses', 'name semester section')
      .sort({ name: 1 });

    res.status(200).json({ success: true, count: teachers.length, data: teachers });
  } catch (error) {
    next(error);
  }
};

// @desc    Create additional teacher account (Admin Only)
// @route   POST /api/teachers
// @access  Admin Only
const createTeacher = async (req, res, next) => {
  try {
    const { name, email, password, employeeId, designation, department, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and initial password are required to create a teacher account.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const teacher = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password.trim(),
      role: 'teacher',
      employeeId: employeeId ? employeeId.trim() : `FAC-${Date.now().toString().slice(-4)}`,
      designation: designation ? designation.trim() : 'Assistant Professor',
      department: department || null,
      phone: phone ? phone.trim() : '',
    });

    const populated = await User.findById(teacher._id)
      .select('-password')
      .populate('department', 'name code');

    res.status(201).json({
      success: true,
      message: 'Teacher account created successfully.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update teacher account (Admin Only)
// @route   PUT /api/teachers/:id
// @access  Admin Only
const updateTeacher = async (req, res, next) => {
  try {
    const { name, employeeId, designation, department, phone, password } = req.body;

    const teacher = await User.findById(req.params.id);
    if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'admin')) {
      return res.status(404).json({ success: false, message: 'Teacher account not found.' });
    }

    if (name) teacher.name = name.trim();
    if (employeeId) teacher.employeeId = employeeId.trim();
    if (designation) teacher.designation = designation.trim();
    if (department) teacher.department = department;
    if (phone !== undefined) teacher.phone = phone.trim();
    if (password && password.trim().length >= 6) {
      teacher.password = password.trim();
    }

    await teacher.save();

    const updated = await User.findById(teacher._id)
      .select('-password')
      .populate('department', 'name code');

    res.status(200).json({
      success: true,
      message: 'Teacher account updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate teacher account (Admin Only)
// @route   DELETE /api/teachers/:id
// @access  Admin Only
const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await User.findByIdAndUpdate(req.params.id, { isActive: false });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher account not found.' });
    res.status(200).json({ success: true, message: 'Teacher account deactivated successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
};

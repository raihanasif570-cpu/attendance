const Department = require('../models/Department');
const ClassSection = require('../models/ClassSection');
const Subject = require('../models/Subject');
const User = require('../models/User');

// --- DEPARTMENTS ---
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, count: departments.length, data: departments });
  } catch (error) {
    next(error);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Name and Code are required' });
    }
    const department = await Department.create({ name, code, description });
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
    res.status(200).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
    res.status(200).json({ success: true, message: 'Department deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

// --- CLASSES / SECTIONS ---
const getClasses = async (req, res, next) => {
  try {
    const query = { isActive: true };
    if (req.query.department) query.department = req.query.department;
    if (req.query.semester) query.semester = Number(req.query.semester);

    const classes = await ClassSection.find(query)
      .populate('department', 'name code')
      .sort({ semester: 1, name: 1 });

    res.status(200).json({ success: true, count: classes.length, data: classes });
  } catch (error) {
    next(error);
  }
};

const createClass = async (req, res, next) => {
  try {
    const { name, department, semester, section, academicYear } = req.body;
    if (!name || !department || !semester) {
      return res.status(400).json({ success: false, message: 'Name, Department, and Semester are required' });
    }

    const newClass = await ClassSection.create({
      name,
      department,
      semester,
      section: section || 'A',
      academicYear: academicYear || '2026-2027',
    });

    const populated = await ClassSection.findById(newClass._id).populate('department', 'name code');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const updateClass = async (req, res, next) => {
  try {
    const updated = await ClassSection.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('department', 'name code');
    if (!updated) return res.status(404).json({ success: false, message: 'Class not found' });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteClass = async (req, res, next) => {
  try {
    const deleted = await ClassSection.findByIdAndUpdate(req.params.id, { isActive: false });
    if (!deleted) return res.status(404).json({ success: false, message: 'Class not found' });
    res.status(200).json({ success: true, message: 'Class removed successfully' });
  } catch (error) {
    next(error);
  }
};

// --- SUBJECTS ---
const getSubjects = async (req, res, next) => {
  try {
    const query = { isActive: true };
    if (req.query.department) query.department = req.query.department;
    if (req.query.semester) query.semester = Number(req.query.semester);
    if (req.query.teacher) query.assignedTeacher = req.query.teacher;

    const subjects = await Subject.find(query)
      .populate('department', 'name code')
      .populate('assignedTeacher', 'name email designation')
      .sort({ semester: 1, name: 1 });

    res.status(200).json({ success: true, count: subjects.length, data: subjects });
  } catch (error) {
    next(error);
  }
};

const createSubject = async (req, res, next) => {
  try {
    const { name, code, department, semester, credits, assignedTeacher } = req.body;
    if (!name || !code || !department || !semester) {
      return res.status(400).json({ success: false, message: 'Name, Code, Department, and Semester are required' });
    }

    const subject = await Subject.create({
      name,
      code,
      department,
      semester,
      credits: credits || 4,
      assignedTeacher: assignedTeacher || null,
    });

    const populated = await Subject.findById(subject._id)
      .populate('department', 'name code')
      .populate('assignedTeacher', 'name email');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const updateSubject = async (req, res, next) => {
  try {
    const updated = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('department', 'name code')
      .populate('assignedTeacher', 'name email');
    if (!updated) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteSubject = async (req, res, next) => {
  try {
    const deleted = await Subject.findByIdAndUpdate(req.params.id, { isActive: false });
    if (!deleted) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.status(200).json({ success: true, message: 'Subject removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
};

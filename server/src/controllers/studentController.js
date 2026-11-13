const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Subject = require('../models/Subject');

// --- TEACHER MANAGEMENT OF STUDENTS ---

// @desc    Get all students with filters
// @route   GET /api/students
// @access  Teacher / Admin
const getStudents = async (req, res, next) => {
  try {
    const { department, semester, classSection, search } = req.query;

    const query = { role: 'student', isActive: true };

    if (department) query.department = department;
    if (semester) query.semester = Number(semester);
    if (classSection) query.classSection = classSection;

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { rollNumber: searchRegex }, { email: searchRegex }];
    }

    const students = await User.find(query)
      .select('-password')
      .populate('department', 'name code')
      .populate('classSection', 'name semester section')
      .sort({ rollNumber: 1, name: 1 });

    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student details
// @route   GET /api/students/:id
// @access  Teacher / Admin / Student (self)
const getStudentById = async (req, res, next) => {
  try {
    // If student, ensure they only request their own ID
    if (req.user.role === 'student' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only view your own profile.' });
    }

    const student = await User.findById(req.params.id)
      .select('-password')
      .populate('department', 'name code')
      .populate('classSection', 'name semester section');

    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Teacher / Admin
const createStudent = async (req, res, next) => {
  try {
    const { name, email, password, rollNumber, department, semester, classSection, phone, parentPhone, admissionYear } = req.body;

    if (!name || !email || !rollNumber || !department || !semester || !classSection) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, roll number, department, semester, and class are required.',
      });
    }

    // Check existing
    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { rollNumber: rollNumber.trim().toUpperCase() }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: existing.email === email.toLowerCase() ? 'Email is already registered' : 'Roll number already exists',
      });
    }

    const newStudent = await User.create({
      name,
      email: email.toLowerCase(),
      password: password || 'student123', // Default if not provided
      role: 'student',
      rollNumber: rollNumber.trim().toUpperCase(),
      department,
      semester: Number(semester),
      classSection,
      phone: phone || '',
      parentPhone: parentPhone || '',
      admissionYear: admissionYear || '2024',
    });

    const populated = await User.findById(newStudent._id)
      .select('-password')
      .populate('department', 'name code')
      .populate('classSection', 'name semester section');

    res.status(201).json({ success: true, message: 'Student created successfully', data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Teacher / Admin
const updateStudent = async (req, res, next) => {
  try {
    const { name, rollNumber, department, semester, classSection, phone, parentPhone, password } = req.body;

    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (name) student.name = name.trim();
    if (rollNumber) student.rollNumber = rollNumber.trim().toUpperCase();
    if (department) student.department = department;
    if (semester) student.semester = Number(semester);
    if (classSection) student.classSection = classSection;
    if (phone !== undefined) student.phone = phone.trim();
    if (parentPhone !== undefined) student.parentPhone = parentPhone.trim();
    if (password && password.trim().length >= 6) {
      student.password = password.trim();
    }

    await student.save();

    const updated = await User.findById(student._id)
      .select('-password')
      .populate('department', 'name code')
      .populate('classSection', 'name semester section');

    res.status(200).json({ success: true, message: 'Student updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student (soft delete)
// @route   DELETE /api/students/:id
// @access  Teacher / Admin
const deleteStudent = async (req, res, next) => {
  try {
    const student = await User.findByIdAndUpdate(req.params.id, { isActive: false });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// --- STUDENT PORTAL ATTENDANCE CALCULATIONS ---

// @desc    Get logged in student's complete attendance summary and subject-wise breakdown
// @route   GET /api/students/me/attendance
// @access  Student
const getMyAttendance = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // Find all attendance records where this student is included
    const attendances = await Attendance.find({
      'records.student': studentId,
    })
      .populate('subject', 'name code credits')
      .populate('classSection', 'name')
      .populate('teacher', 'name')
      .sort({ date: -1 });

    let totalClasses = 0;
    let presentClasses = 0;
    let absentClasses = 0;

    // Group by subject
    const subjectMap = {};

    attendances.forEach((att) => {
      const studentRecord = att.records.find((r) => r.student.toString() === studentId.toString());
      if (!studentRecord) return;

      const subId = att.subject?._id?.toString() || 'unknown';
      const subName = att.subject?.name || 'Unknown Subject';
      const subCode = att.subject?.code || 'N/A';

      if (!subjectMap[subId]) {
        subjectMap[subId] = {
          subjectId: subId,
          subjectName: subName,
          subjectCode: subCode,
          total: 0,
          present: 0,
          absent: 0,
          percentage: 0,
          history: [],
        };
      }

      totalClasses++;
      subjectMap[subId].total++;

      const isPresent = studentRecord.status === 'Present' || studentRecord.status === 'Late';
      if (isPresent) {
        presentClasses++;
        subjectMap[subId].present++;
      } else {
        absentClasses++;
        subjectMap[subId].absent++;
      }

      subjectMap[subId].history.push({
        date: att.dateString,
        status: studentRecord.status,
        remarks: studentRecord.remarks,
      });
    });

    // Compute percentages
    const subjectBreakdown = Object.values(subjectMap).map((item) => {
      const percentage = item.total > 0 ? Math.round((item.present / item.total) * 100 * 10) / 10 : 0;
      return {
        ...item,
        percentage,
      };
    });

    const overallPercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100 * 10) / 10 : 0;

    // Attendance Target Calculator data:
    // Required classes to reach targets: 75%, 80%, 85%, 90%
    const targets = [75, 80, 85, 90];
    const calculator = targets.map((target) => {
      // Formula: (present + x) / (total + x) >= target/100
      // present + x >= (target/100)*total + (target/100)*x
      // x * (1 - target/100) >= (target/100)*total - present
      // x = ceil( (target * total - 100 * present) / (100 - target) )
      if (totalClasses === 0) {
        return { target, needed: 0, status: 'No classes held yet', canBunk: 0 };
      }

      if (overallPercentage >= target) {
        // Can afford to miss:
        // present / (total + y) >= target / 100
        // total + y <= (100 * present) / target
        // y = floor((100 * present - target * total) / target)
        const canBunk = Math.max(0, Math.floor((100 * presentClasses - target * totalClasses) / target));
        return {
          target,
          needed: 0,
          canBunk,
          status: `Target achieved! You can afford to miss ${canBunk} class${canBunk === 1 ? '' : 'es'} without dropping below ${target}%.`,
        };
      } else {
        const needed = Math.ceil((target * totalClasses - 100 * presentClasses) / (100 - target));
        return {
          target,
          needed: Math.max(1, needed),
          canBunk: 0,
          status: `Need to attend next ${needed} consecutive class${needed === 1 ? '' : 'es'} to reach ${target}%.`,
        };
      }
    });

    res.status(200).json({
      success: true,
      data: {
        overall: {
          totalClasses,
          presentClasses,
          absentClasses,
          percentage: overallPercentage,
        },
        subjects: subjectBreakdown,
        calculator,
        recentActivity: attendances.slice(0, 10).map((a) => {
          const rec = a.records.find((r) => r.student.toString() === studentId.toString());
          return {
            id: a._id,
            date: a.dateString,
            subject: a.subject?.name,
            subjectCode: a.subject?.code,
            teacher: a.teacher?.name,
            status: rec ? rec.status : 'N/A',
          };
        }),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly calendar attendance for logged-in student
// @route   GET /api/students/me/calendar
// @access  Student
const getMyCalendar = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { month, year } = req.query; // e.g. month=11, year=2026

    const query = {
      'records.student': studentId,
    };

    if (month && year) {
      const formattedMonth = String(month).padStart(2, '0');
      // Matches dateString starting with "YYYY-MM"
      query.dateString = new RegExp(`^${year}-${formattedMonth}`);
    }

    const attendances = await Attendance.find(query)
      .populate('subject', 'name code')
      .sort({ dateString: 1 });

    const calendarEvents = [];

    attendances.forEach((att) => {
      const rec = att.records.find((r) => r.student.toString() === studentId.toString());
      if (rec) {
        calendarEvents.push({
          id: att._id,
          date: att.dateString,
          subject: att.subject?.name,
          subjectCode: att.subject?.code,
          status: rec.status,
          remarks: rec.remarks,
        });
      }
    });

    res.status(200).json({ success: true, count: calendarEvents.length, data: calendarEvents });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getMyAttendance,
  getMyCalendar,
};

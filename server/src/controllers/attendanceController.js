const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Subject = require('../models/Subject');
const ClassSection = require('../models/ClassSection');

// @desc    Get attendance sheet for marking / editing
// @route   GET /api/attendance/sheet
// @access  Teacher / Admin
const getAttendanceSheet = async (req, res, next) => {
  try {
    const { department, semester, classSection, subject, date } = req.query;

    if (!department || !semester || !classSection || !subject || !date) {
      return res.status(400).json({
        success: false,
        message: 'Department, semester, class, subject, and date are required.',
      });
    }

    // Normalize dateString to YYYY-MM-DD
    const dateObj = new Date(date);
    const dateString = dateObj.toISOString().split('T')[0];

    // Fetch all active students in this class section
    const students = await User.find({
      role: 'student',
      department,
      semester: Number(semester),
      classSection,
      isActive: true,
    })
      .select('name rollNumber email phone')
      .sort({ rollNumber: 1, name: 1 });

    // Check if attendance is already marked for this subject, class, and date
    const existingAttendance = await Attendance.findOne({
      subject,
      classSection,
      dateString,
    }).populate('teacher', 'name email');

    // Prepare student list with marked statuses if already saved
    const studentRecords = students.map((stu) => {
      let status = 'Present'; // Default
      let remarks = '';

      if (existingAttendance) {
        const found = existingAttendance.records.find((r) => r.student.toString() === stu._id.toString());
        if (found) {
          status = found.status;
          remarks = found.remarks || '';
        }
      }

      return {
        studentId: stu._id,
        name: stu.name,
        rollNumber: stu.rollNumber,
        email: stu.email,
        phone: stu.phone,
        status,
        remarks,
      };
    });

    res.status(200).json({
      success: true,
      isEditMode: !!existingAttendance,
      existingId: existingAttendance ? existingAttendance._id : null,
      lastMarkedBy: existingAttendance?.teacher?.name || null,
      lastMarkedAt: existingAttendance?.updatedAt || null,
      dateString,
      studentsCount: students.length,
      data: studentRecords,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save or update attendance (Duplicate prevention ensured via upsert / lookup)
// @route   POST /api/attendance/save
// @access  Teacher / Admin
const saveAttendance = async (req, res, next) => {
  try {
    const { department, semester, classSection, subject, date, records } = req.body;

    if (!department || !semester || !classSection || !subject || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: 'All fields (department, semester, classSection, subject, date, and records) are required.',
      });
    }

    const dateObj = new Date(date);
    const dateString = dateObj.toISOString().split('T')[0];

    // Format records array
    const formattedRecords = records.map((r) => ({
      student: r.studentId || r.student,
      status: r.status || 'Present',
      remarks: r.remarks || '',
    }));

    const totalStudents = formattedRecords.length;
    const presentCount = formattedRecords.filter((r) => r.status === 'Present' || r.status === 'Late').length;
    const absentCount = formattedRecords.filter((r) => r.status === 'Absent').length;

    // Check if attendance already exists for this subject, classSection and dateString
    let attendance = await Attendance.findOne({
      subject,
      classSection,
      dateString,
    });

    if (attendance) {
      // Update existing record (Edit Attendance)
      attendance.records = formattedRecords;
      attendance.teacher = req.user._id;
      attendance.totalStudents = totalStudents;
      attendance.presentCount = presentCount;
      attendance.absentCount = absentCount;
      await attendance.save();

      return res.status(200).json({
        success: true,
        message: 'Attendance record updated successfully.',
        data: attendance,
        action: 'updated',
      });
    }

    // Create new attendance record
    attendance = await Attendance.create({
      date: dateObj,
      dateString,
      subject,
      classSection,
      teacher: req.user._id,
      department,
      semester: Number(semester),
      records: formattedRecords,
      totalStudents,
      presentCount,
      absentCount,
    });

    res.status(201).json({
      success: true,
      message: 'Attendance saved successfully.',
      data: attendance,
      action: 'created',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Attendance for this class, subject, and date has already been recorded. Please use edit mode.',
      });
    }
    next(error);
  }
};

// @desc    Get attendance history with flexible filters
// @route   GET /api/attendance/history
// @access  Teacher / Admin
const getAttendanceHistory = async (req, res, next) => {
  try {
    const { department, semester, classSection, subject, startDate, endDate, date } = req.query;

    const query = {};

    if (department) query.department = department;
    if (semester) query.semester = Number(semester);
    if (classSection) query.classSection = classSection;
    if (subject) query.subject = subject;

    if (date) {
      query.dateString = date;
    } else if (startDate && endDate) {
      query.dateString = { $gte: startDate, $lte: endDate };
    }

    const history = await Attendance.find(query)
      .populate('subject', 'name code')
      .populate('classSection', 'name semester section')
      .populate('teacher', 'name email')
      .populate('department', 'name code')
      .sort({ dateString: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single attendance record details by ID (including student details)
// @route   GET /api/attendance/:id
// @access  Teacher / Admin / Student
const getAttendanceById = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('subject', 'name code')
      .populate('classSection', 'name semester section')
      .populate('teacher', 'name email')
      .populate('department', 'name code')
      .populate('records.student', 'name rollNumber email');

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found.' });
    }

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Teacher / Admin
const deleteAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found.' });
    }
    res.status(200).json({ success: true, message: 'Attendance record deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get teacher dashboard metrics
// @route   GET /api/attendance/dashboard/metrics
// @access  Teacher / Admin
const getTeacherDashboardMetrics = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // Counts
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    const totalSubjects = await Subject.countDocuments({ isActive: true });
    const totalClasses = await ClassSection.countDocuments({ isActive: true });

    // Today's attendance
    const todayRecords = await Attendance.find({ dateString: todayStr });

    let todayPresent = 0;
    let todayAbsent = 0;

    todayRecords.forEach((att) => {
      todayPresent += att.presentCount || 0;
      todayAbsent += att.absentCount || 0;
    });

    // Recent activity (last 7 recorded sessions)
    const recentActivity = await Attendance.find()
      .populate('subject', 'name code')
      .populate('classSection', 'name')
      .populate('teacher', 'name')
      .sort({ dateString: -1, updatedAt: -1 })
      .limit(6);

    // Attendance stats: Overall across all records
    const allAttendance = await Attendance.find();
    let totalAllPresent = 0;
    let totalAllStudentsCount = 0;

    allAttendance.forEach((att) => {
      totalAllPresent += att.presentCount || 0;
      totalAllStudentsCount += att.totalStudents || 0;
    });

    const averageAttendance =
      totalAllStudentsCount > 0 ? Math.round((totalAllPresent / totalAllStudentsCount) * 100 * 10) / 10 : 0;

    // Last 7 days attendance trend
    const last7DaysMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      last7DaysMap[str] = { date: str, present: 0, absent: 0, total: 0 };
    }

    const pastRecords = await Attendance.find({
      dateString: { $in: Object.keys(last7DaysMap) },
    });

    pastRecords.forEach((r) => {
      if (last7DaysMap[r.dateString]) {
        last7DaysMap[r.dateString].present += r.presentCount;
        last7DaysMap[r.dateString].absent += r.absentCount;
        last7DaysMap[r.dateString].total += r.totalStudents;
      }
    });

    const trend = Object.values(last7DaysMap).map((d) => ({
      date: d.date,
      present: d.present,
      absent: d.absent,
      percentage: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalSubjects,
        totalClasses,
        todayPresent,
        todayAbsent,
        averageAttendance,
        recentActivity: recentActivity.map((a) => ({
          id: a._id,
          date: a.dateString,
          subject: a.subject?.name || 'Subject',
          subjectCode: a.subject?.code || '',
          classSection: a.classSection?.name || 'Class',
          teacher: a.teacher?.name || 'Teacher',
          presentCount: a.presentCount,
          absentCount: a.absentCount,
          totalStudents: a.totalStudents,
          percentage: a.totalStudents > 0 ? Math.round((a.presentCount / a.totalStudents) * 100) : 0,
        })),
        trend,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendanceSheet,
  saveAttendance,
  getAttendanceHistory,
  getAttendanceById,
  deleteAttendance,
  getTeacherDashboardMetrics,
};

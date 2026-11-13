const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Subject = require('../models/Subject');
const ClassSection = require('../models/ClassSection');

// @desc    Generate Cumulative Class/Subject Attendance Report
// @route   GET /api/reports/summary
// @access  Teacher / Admin
const getSummaryReport = async (req, res, next) => {
  try {
    const { department, semester, classSection, subject, startDate, endDate } = req.query;

    if (!classSection) {
      return res.status(400).json({ success: false, message: 'Class Section is required for report generation.' });
    }

    // 1. Get all students in the class
    const studentQuery = {
      role: 'student',
      classSection,
      isActive: true,
    };
    if (department) studentQuery.department = department;
    if (semester) studentQuery.semester = Number(semester);

    const students = await User.find(studentQuery)
      .select('name rollNumber email phone')
      .sort({ rollNumber: 1, name: 1 });

    // 2. Build attendance query
    const attQuery = { classSection };
    if (subject) attQuery.subject = subject;
    if (department) attQuery.department = department;
    if (semester) attQuery.semester = Number(semester);

    if (startDate && endDate) {
      attQuery.dateString = { $gte: startDate, $lte: endDate };
    }

    const attendances = await Attendance.find(attQuery)
      .populate('subject', 'name code')
      .populate('teacher', 'name');

    const totalSessions = attendances.length;

    // 3. Aggregate each student's stats
    const studentStats = students.map((stu) => {
      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;

      attendances.forEach((att) => {
        const rec = att.records.find((r) => r.student.toString() === stu._id.toString());
        if (rec) {
          if (rec.status === 'Present') presentCount++;
          else if (rec.status === 'Late') {
            lateCount++;
            presentCount++; // Count late as present
          } else if (rec.status === 'Absent') {
            absentCount++;
          }
        }
      });

      const totalRecorded = presentCount + absentCount;
      const percentage = totalRecorded > 0 ? Math.round((presentCount / totalRecorded) * 100 * 10) / 10 : 0;

      let statusTier = 'good'; // Green: >= 85%
      if (percentage < 75) statusTier = 'critical'; // Red: < 75%
      else if (percentage < 85) statusTier = 'warning'; // Yellow: 75-84%

      return {
        studentId: stu._id,
        rollNumber: stu.rollNumber,
        name: stu.name,
        email: stu.email,
        phone: stu.phone,
        totalClasses: totalRecorded,
        presentClasses: presentCount,
        absentClasses: absentCount,
        lateClasses: lateCount,
        percentage,
        statusTier,
      };
    });

    const averagePercentage =
      studentStats.length > 0
        ? Math.round((studentStats.reduce((acc, s) => acc + s.percentage, 0) / studentStats.length) * 10) / 10
        : 0;

    const defaultersCount = studentStats.filter((s) => s.percentage < 75).length;

    res.status(200).json({
      success: true,
      meta: {
        totalSessions,
        totalStudents: students.length,
        averagePercentage,
        defaultersCount,
      },
      data: studentStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export attendance report as CSV
// @route   GET /api/reports/export-csv
// @access  Teacher / Admin
const exportReportCSV = async (req, res, next) => {
  try {
    const { department, semester, classSection, subject, startDate, endDate } = req.query;

    if (!classSection) {
      return res.status(400).send('Class Section is required for report export.');
    }

    const classInfo = await ClassSection.findById(classSection).populate('department', 'name code');
    const subjectInfo = subject ? await Subject.findById(subject) : null;

    const studentQuery = { role: 'student', classSection, isActive: true };
    const students = await User.find(studentQuery).sort({ rollNumber: 1 });

    const attQuery = { classSection };
    if (subject) attQuery.subject = subject;
    if (startDate && endDate) attQuery.dateString = { $gte: startDate, $lte: endDate };

    const attendances = await Attendance.find(attQuery);
    const totalSessions = attendances.length;

    // Build CSV Headers
    let csv = `College Attendance Report\n`;
    csv += `Class: ${classInfo?.name || 'All'}, Department: ${classInfo?.department?.name || 'All'}, Semester: ${classInfo?.semester || 'N/A'}\n`;
    if (subjectInfo) csv += `Subject: ${subjectInfo.name} (${subjectInfo.code})\n`;
    csv += `Date Range: ${startDate || 'Start'} to ${endDate || 'Latest'}, Total Sessions Held: ${totalSessions}\n\n`;

    csv += `Roll No,Student Name,Email,Total Classes,Present,Absent,Percentage (%),Attendance Status\n`;

    students.forEach((stu) => {
      let presentCount = 0;
      let absentCount = 0;

      attendances.forEach((att) => {
        const rec = att.records.find((r) => r.student.toString() === stu._id.toString());
        if (rec) {
          if (rec.status === 'Present' || rec.status === 'Late') presentCount++;
          else absentCount++;
        }
      });

      const total = presentCount + absentCount;
      const pct = total > 0 ? ((presentCount / total) * 100).toFixed(1) : '0.0';
      let tier = 'Eligible (>=85%)';
      if (pct < 75) tier = 'Defaulter / Shortage (<75%)';
      else if (pct < 85) tier = 'Borderline (75-84%)';

      csv += `"${stu.rollNumber}","${stu.name}","${stu.email}",${total},${presentCount},${absentCount},${pct}%,"${tier}"\n`;
    });

    const filename = `Attendance_Report_${classInfo?.name || 'Class'}_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummaryReport,
  exportReportCSV,
};

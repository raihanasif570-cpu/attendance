require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const academicRoutes = require('./routes/academicRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const teacherRoutes = require('./routes/teacherRoutes');

const app = express();

// Middlewares
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date(), uptime: process.uptime() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/teachers', teacherRoutes);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `API endpoint not found: ${req.originalUrl}` });
});

// Serve frontend static build if available (for monolithic / fullstack deployment)
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to Database & Auto-Seed if empty
const startServer = async () => {
  await connectDB();

  // Check if DB needs initial sample data
  try {
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database is empty. Populating with sample demo data...');
      // Execute seeding programmatically without exiting process
      const Department = require('./models/Department');
      const ClassSection = require('./models/ClassSection');
      const Subject = require('./models/Subject');
      const Attendance = require('./models/Attendance');
      const Notification = require('./models/Notification');

      const cseDept = await Department.create({
        name: 'Computer Science & Engineering',
        code: 'CSE',
        description: 'Department of Computer Science & Engineering',
      });
      const itDept = await Department.create({
        name: 'Information Technology',
        code: 'IT',
        description: 'Department of Information Technology',
      });

      const cse5A = await ClassSection.create({
        name: 'CSE-5A',
        department: cseDept._id,
        semester: 5,
        section: 'A',
        academicYear: '2026-2027',
      });
      const cse5B = await ClassSection.create({
        name: 'CSE-5B',
        department: cseDept._id,
        semester: 5,
        section: 'B',
        academicYear: '2026-2027',
      });

      const teacher1 = await User.create({
        name: 'Prof. Robert Vance',
        email: 'teacher@college.edu',
        password: 'teacher123',
        role: 'teacher',
        employeeId: 'EMP-CSE-101',
        designation: 'HOD & Professor',
        department: cseDept._id,
        phone: '+91 98765 43210',
      });

      const subjects = await Subject.create([
        { name: 'Database Management Systems', code: 'CS501', department: cseDept._id, semester: 5, credits: 4, assignedTeacher: teacher1._id },
        { name: 'Operating Systems', code: 'CS502', department: cseDept._id, semester: 5, credits: 4, assignedTeacher: teacher1._id },
        { name: 'Computer Networks', code: 'CS503', department: cseDept._id, semester: 5, credits: 4, assignedTeacher: teacher1._id },
        { name: 'Software Engineering', code: 'CS504', department: cseDept._id, semester: 5, credits: 3, assignedTeacher: teacher1._id },
        { name: 'Design & Analysis of Algorithms', code: 'CS505', department: cseDept._id, semester: 5, credits: 4, assignedTeacher: teacher1._id },
      ]);

      teacher1.assignedSubjects = [subjects[0]._id, subjects[1]._id, subjects[2]._id];
      teacher1.assignedClasses = [cse5A._id];
      await teacher1.save();

      const studentDocs = [];
      const studentData = [
        { name: 'Aarav Sharma', email: 'student1@college.edu', rollNumber: 'CS202401', bias: 0.92 },
        { name: 'Priya Patel', email: 'student2@college.edu', rollNumber: 'CS202402', bias: 0.78 },
        { name: 'Rohan Gupta', email: 'student3@college.edu', rollNumber: 'CS202403', bias: 0.62 },
        { name: 'Ananya Iyer', email: 'ananya.iyer@college.edu', rollNumber: 'CS202404', bias: 0.95 },
        { name: 'Vikram Malhotra', email: 'vikram.m@college.edu', rollNumber: 'CS202405', bias: 0.81 },
        { name: 'Neha Verma', email: 'neha.v@college.edu', rollNumber: 'CS202406', bias: 0.88 },
        { name: 'Siddharth Nair', email: 'siddharth.n@college.edu', rollNumber: 'CS202407', bias: 0.71 },
        { name: 'Tanvi Kulkarni', email: 'tanvi.k@college.edu', rollNumber: 'CS202408', bias: 0.86 },
        { name: 'Aditya Rao', email: 'aditya.r@college.edu', rollNumber: 'CS202409', bias: 0.90 },
        { name: 'Meera Joshi', email: 'meera.j@college.edu', rollNumber: 'CS202410', bias: 0.74 },
      ];

      for (const s of studentData) {
        const doc = await User.create({
          name: s.name,
          email: s.email,
          password: 'student123',
          role: 'student',
          rollNumber: s.rollNumber,
          department: cseDept._id,
          semester: 5,
          classSection: cse5A._id,
          phone: '+91 98765 00000',
          parentPhone: '+91 98765 11111',
          admissionYear: '2024',
        });
        doc.bias = s.bias;
        studentDocs.push(doc);
      }

      // Generate 15 days of attendance
      const dates = [];
      const now = new Date();
      let dayOffset = 0;
      while (dates.length < 15) {
        const d = new Date(now);
        d.setDate(now.getDate() - dayOffset);
        if (d.getDay() !== 0) dates.push(d);
        dayOffset++;
      }
      dates.sort((a, b) => a - b);

      for (const d of dates) {
        const dateStr = d.toISOString().split('T')[0];
        for (const sub of [subjects[0], subjects[1], subjects[2]]) {
          const recs = studentDocs.map((stu) => {
            const isPresent = Math.random() < stu.bias;
            return {
              student: stu._id,
              status: isPresent ? 'Present' : 'Absent',
              remarks: isPresent ? '' : 'Absent',
            };
          });
          const total = recs.length;
          const present = recs.filter((r) => r.status === 'Present').length;
          await Attendance.create({
            date: d,
            dateString: dateStr,
            subject: sub._id,
            classSection: cse5A._id,
            teacher: teacher1._id,
            department: cseDept._id,
            semester: 5,
            records: recs,
            totalStudents: total,
            presentCount: present,
            absentCount: total - present,
          });
        }
      }

      await Notification.create([
        {
          title: 'Mid-Term Attendance Audit',
          message: 'All students with less than 75% attendance must meet their department advisor.',
          type: 'warning',
          targetRole: 'all',
          createdBy: teacher1._id,
        },
        {
          title: 'Semester Schedule Update',
          message: 'Lab sessions for DBMS and Operating Systems will begin next Monday.',
          type: 'info',
          targetRole: 'student',
          createdBy: teacher1._id,
        },
      ]);

      console.log('Auto-seed completed successfully!');
    }
  } catch (seedErr) {
    console.warn('Auto-seed check error:', seedErr.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
  });
};

startServer();

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const Department = require('../models/Department');
const ClassSection = require('../models/ClassSection');
const Subject = require('../models/Subject');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');

const seed = async () => {
  try {
    await connectDB();
    console.log('Clearing existing database records...');

    await Promise.all([
      Department.deleteMany({}),
      ClassSection.deleteMany({}),
      Subject.deleteMany({}),
      User.deleteMany({}),
      Attendance.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('Seeding Departments...');
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

    const eceDept = await Department.create({
      name: 'Electronics & Communication',
      code: 'ECE',
      description: 'Department of Electronics & Communication Engineering',
    });

    console.log('Seeding Classes...');
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

    const it5A = await ClassSection.create({
      name: 'IT-5A',
      department: itDept._id,
      semester: 5,
      section: 'A',
      academicYear: '2026-2027',
    });

    console.log('Seeding Teachers...');
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

    const teacher2 = await User.create({
      name: 'Dr. Sarah Connor',
      email: 'sarah.faculty@college.edu',
      password: 'teacher123',
      role: 'teacher',
      employeeId: 'EMP-CSE-102',
      designation: 'Assistant Professor',
      department: cseDept._id,
      phone: '+91 98765 43211',
    });

    console.log('Seeding Subjects...');
    const subjects = await Subject.create([
      {
        name: 'Database Management Systems',
        code: 'CS501',
        department: cseDept._id,
        semester: 5,
        credits: 4,
        assignedTeacher: teacher1._id,
      },
      {
        name: 'Operating Systems',
        code: 'CS502',
        department: cseDept._id,
        semester: 5,
        credits: 4,
        assignedTeacher: teacher1._id,
      },
      {
        name: 'Computer Networks',
        code: 'CS503',
        department: cseDept._id,
        semester: 5,
        credits: 4,
        assignedTeacher: teacher2._id,
      },
      {
        name: 'Software Engineering',
        code: 'CS504',
        department: cseDept._id,
        semester: 5,
        credits: 3,
        assignedTeacher: teacher2._id,
      },
      {
        name: 'Design & Analysis of Algorithms',
        code: 'CS505',
        department: cseDept._id,
        semester: 5,
        credits: 4,
        assignedTeacher: teacher1._id,
      },
    ]);

    // Assign subjects to teacher1
    teacher1.assignedSubjects = [subjects[0]._id, subjects[1]._id, subjects[4]._id];
    teacher1.assignedClasses = [cse5A._id, cse5B._id];
    await teacher1.save();

    console.log('Seeding Students...');
    const studentData = [
      {
        name: 'Aarav Sharma',
        email: 'student1@college.edu',
        password: 'student123',
        rollNumber: 'CS202401',
        phone: '+91 98111 22334',
        parentPhone: '+91 98111 00001',
        attendanceBias: 0.92, // ~92% attendance (Green >= 85%)
      },
      {
        name: 'Priya Patel',
        email: 'student2@college.edu',
        password: 'student123',
        rollNumber: 'CS202402',
        phone: '+91 98111 22335',
        parentPhone: '+91 98111 00002',
        attendanceBias: 0.78, // ~78% attendance (Yellow 75-84%)
      },
      {
        name: 'Rohan Gupta',
        email: 'student3@college.edu',
        password: 'student123',
        rollNumber: 'CS202403',
        phone: '+91 98111 22336',
        parentPhone: '+91 98111 00003',
        attendanceBias: 0.62, // ~62% attendance (Red < 75%)
      },
      {
        name: 'Ananya Iyer',
        email: 'ananya.iyer@college.edu',
        password: 'student123',
        rollNumber: 'CS202404',
        phone: '+91 98111 22337',
        parentPhone: '+91 98111 00004',
        attendanceBias: 0.95,
      },
      {
        name: 'Vikram Malhotra',
        email: 'vikram.m@college.edu',
        password: 'student123',
        rollNumber: 'CS202405',
        phone: '+91 98111 22338',
        parentPhone: '+91 98111 00005',
        attendanceBias: 0.81,
      },
      {
        name: 'Neha Verma',
        email: 'neha.v@college.edu',
        password: 'student123',
        rollNumber: 'CS202406',
        phone: '+91 98111 22339',
        parentPhone: '+91 98111 00006',
        attendanceBias: 0.88,
      },
      {
        name: 'Siddharth Nair',
        email: 'siddharth.n@college.edu',
        password: 'student123',
        rollNumber: 'CS202407',
        phone: '+91 98111 22340',
        parentPhone: '+91 98111 00007',
        attendanceBias: 0.71,
      },
      {
        name: 'Tanvi Kulkarni',
        email: 'tanvi.k@college.edu',
        password: 'student123',
        rollNumber: 'CS202408',
        phone: '+91 98111 22341',
        parentPhone: '+91 98111 00008',
        attendanceBias: 0.86,
      },
      {
        name: 'Aditya Rao',
        email: 'aditya.r@college.edu',
        password: 'student123',
        rollNumber: 'CS202409',
        phone: '+91 98111 22342',
        parentPhone: '+91 98111 00009',
        attendanceBias: 0.9,
      },
      {
        name: 'Meera Joshi',
        email: 'meera.j@college.edu',
        password: 'student123',
        rollNumber: 'CS202410',
        phone: '+91 98111 22343',
        parentPhone: '+91 98111 00010',
        attendanceBias: 0.74,
      },
    ];

    const createdStudents = [];
    for (const s of studentData) {
      const studentDoc = await User.create({
        name: s.name,
        email: s.email,
        password: s.password,
        role: 'student',
        rollNumber: s.rollNumber,
        department: cseDept._id,
        semester: 5,
        classSection: cse5A._id,
        phone: s.phone,
        parentPhone: s.parentPhone,
        admissionYear: '2024',
      });
      studentDoc.attendanceBias = s.attendanceBias;
      createdStudents.push(studentDoc);
    }

    console.log('Seeding Attendance records for the last 20 days...');
    // Generate dates for the last 20 working days
    const dates = [];
    const now = new Date();
    let dayCount = 0;
    while (dates.length < 18) {
      const d = new Date(now);
      d.setDate(now.getDate() - dayCount);
      // Skip Sundays (0)
      if (d.getDay() !== 0) {
        dates.push(d);
      }
      dayCount++;
    }

    // Sort ascending for chronological consistency
    dates.sort((a, b) => a - b);

    for (const d of dates) {
      const dateStr = d.toISOString().split('T')[0];

      // Mark attendance for 2-3 subjects per day
      const dailySubjects = [subjects[0], subjects[1], subjects[2]];

      for (const sub of dailySubjects) {
        const records = createdStudents.map((stu) => {
          const isPresent = Math.random() < stu.attendanceBias;
          return {
            student: stu._id,
            status: isPresent ? 'Present' : 'Absent',
            remarks: isPresent ? '' : 'Unexcused Absence',
          };
        });

        const totalStudents = records.length;
        const presentCount = records.filter((r) => r.status === 'Present').length;
        const absentCount = totalStudents - presentCount;

        await Attendance.create({
          date: d,
          dateString: dateStr,
          subject: sub._id,
          classSection: cse5A._id,
          teacher: teacher1._id,
          department: cseDept._id,
          semester: 5,
          records,
          totalStudents,
          presentCount,
          absentCount,
        });
      }
    }

    console.log('Seeding Notifications...');
    await Notification.create([
      {
        title: 'Mid-Term Attendance Audit',
        message: 'All students with less than 75% attendance must meet their department faculty advisor before Friday.',
        type: 'warning',
        targetRole: 'all',
        createdBy: teacher1._id,
      },
      {
        title: 'Campus Placement Prep Session',
        message: 'Pre-placement training sessions for CSE Sem 5 will commence next Monday at 10:00 AM.',
        type: 'info',
        targetRole: 'student',
        createdBy: teacher1._id,
      },
      {
        title: 'Monthly Attendance Submission Due',
        message: 'Faculty members are requested to finalize and review monthly attendance sheets for October.',
        type: 'info',
        targetRole: 'teacher',
        createdBy: teacher1._id,
      },
    ]);

    console.log('\n=== Database Seeding Completed Successfully! ===');
    console.log('Test Teacher Account: teacher@college.edu / teacher123');
    console.log('Test Student 1 Account (Green >85%): student1@college.edu / student123');
    console.log('Test Student 2 Account (Yellow 75-84%): student2@college.edu / student123');
    console.log('Test Student 3 Account (Red <75% Defaulter): student3@college.edu / student123');
    console.log('================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();

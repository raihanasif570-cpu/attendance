const express = require('express');
const router = express.Router();
const {
  getAttendanceSheet,
  saveAttendance,
  getAttendanceHistory,
  getAttendanceById,
  deleteAttendance,
  getTeacherDashboardMetrics,
} = require('../controllers/attendanceController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Teacher dashboard stats
router.get('/dashboard/metrics', authorize('teacher', 'admin'), getTeacherDashboardMetrics);

// Attendance marking and history
router.get('/sheet', authorize('teacher', 'admin'), getAttendanceSheet);
router.post('/save', authorize('teacher', 'admin'), saveAttendance);
router.get('/history', authorize('teacher', 'admin'), getAttendanceHistory);

// Single record inspection & deletion
router.get('/:id', getAttendanceById);
router.delete('/:id', authorize('teacher', 'admin'), deleteAttendance);

module.exports = router;

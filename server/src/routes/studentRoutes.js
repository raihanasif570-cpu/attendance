const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getMyAttendance,
  getMyCalendar,
} = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Student self routes
router.get('/me/attendance', authorize('student'), getMyAttendance);
router.get('/me/calendar', authorize('student'), getMyCalendar);

// Teacher/Admin student management routes
router.get('/', authorize('teacher', 'admin'), getStudents);
router.post('/', authorize('teacher', 'admin'), createStudent);
router.get('/:id', getStudentById);
router.put('/:id', authorize('teacher', 'admin'), updateStudent);
router.delete('/:id', authorize('teacher', 'admin'), deleteStudent);

module.exports = router;

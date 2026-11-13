const express = require('express');
const router = express.Router();
const {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} = require('../controllers/teacherController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Faculty directory viewing
router.get('/', authorize('teacher', 'admin'), getTeachers);

// Only authorized administrators can create, update, or remove additional teacher accounts
router.post('/', authorize('admin'), createTeacher);
router.put('/:id', authorize('admin'), updateTeacher);
router.delete('/:id', authorize('admin'), deleteTeacher);

module.exports = router;

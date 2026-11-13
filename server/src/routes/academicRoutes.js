const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/academicController');
const { authenticate, authorize } = require('../middleware/auth');

// All authenticated users can view academic lists (for filters / dropdowns)
router.use(authenticate);

router.get('/departments', getDepartments);
router.get('/classes', getClasses);
router.get('/subjects', getSubjects);

// Only teachers / admins can mutate academic entities
router.post('/departments', authorize('teacher', 'admin'), createDepartment);
router.put('/departments/:id', authorize('teacher', 'admin'), updateDepartment);
router.delete('/departments/:id', authorize('teacher', 'admin'), deleteDepartment);

router.post('/classes', authorize('teacher', 'admin'), createClass);
router.put('/classes/:id', authorize('teacher', 'admin'), updateClass);
router.delete('/classes/:id', authorize('teacher', 'admin'), deleteClass);

router.post('/subjects', authorize('teacher', 'admin'), createSubject);
router.put('/subjects/:id', authorize('teacher', 'admin'), updateSubject);
router.delete('/subjects/:id', authorize('teacher', 'admin'), deleteSubject);

module.exports = router;

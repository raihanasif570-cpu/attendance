const express = require('express');
const router = express.Router();
const {
  getNotifications,
  createNotification,
  deleteNotification,
} = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getNotifications);
router.post('/', authorize('teacher', 'admin'), createNotification);
router.delete('/:id', authorize('teacher', 'admin'), deleteNotification);

module.exports = router;

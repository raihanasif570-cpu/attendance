const Notification = require('../models/Notification');

// @desc    Get notifications for user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const role = req.user.role;
    const notifications = await Notification.find({
      targetRole: { $in: ['all', role] },
    })
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    next(error);
  }
};

// @desc    Create notification
// @route   POST /api/notifications
// @access  Teacher / Admin
const createNotification = async (req, res, next) => {
  try {
    const { title, message, type, targetRole } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const notification = await Notification.create({
      title,
      message,
      type: type || 'info',
      targetRole: targetRole || 'all',
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Teacher / Admin
const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  createNotification,
  deleteNotification,
};

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const secret = process.env.JWT_SECRET || 'supersecretjwtkey_for_college_attendance_system_2026';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id)
      .select('-password')
      .populate('department', 'name code')
      .populate('classSection', 'name semester section academicYear');

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or account is deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access denied for role '${req.user?.role}'. Required: [${roles.join(', ')}]`,
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };

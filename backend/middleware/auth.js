const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

      req.user = await User.findById(decoded.id)
        .populate('merchant')
        .populate({
          path: 'roles',
          populate: { path: 'permissions' }
        })
        .select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found.' });
      }

      req.merchantId = req.user.merchant?._id || req.user.merchant || null;

      next();
    } catch (error) {
      console.error('Auth protect error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed.' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token.' });
  }
};

// Check if user has permission
const authorize = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized.' });
    }

    // Extract all permissions from user's roles
    const userRoles = req.user.roles || [];
    const isSuperAdmin = userRoles.some(role => role.name === 'supperAdmin');

    if (isSuperAdmin) {
      return next(); // Super Admin has all privileges
    }

    // Collect permissions
    const permissions = [];
    userRoles.forEach(role => {
      if (role.permissions) {
        role.permissions.forEach(p => {
          permissions.push(p.name);
        });
      }
    });

    if (permissions.includes(requiredPermission)) {
      return next();
    } else {
      return res.status(403).json({
        success: false,
        message: `Forbidden: You do not have permission (${requiredPermission}) to access this resource.`
      });
    }
  };
};

module.exports = { protect, authorize };

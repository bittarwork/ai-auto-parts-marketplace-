const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - require authentication
 * Middleware to verify JWT token and attach user to request
 */
exports.protect = async (req, res, next) => {
  let token;
  
  try {
    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    req.user = await User.findById(decoded.userId).select('-password');
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user is active
    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }
    
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

/**
 * Optional authentication
 * Attach user to request if token is provided, but don't require it
 */
exports.optionalAuth = async (req, res, next) => {
  let token;
  
  try {
    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // If no token, continue without user
    if (!token) {
      return next();
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    req.user = await User.findById(decoded.userId).select('-password');
    
    next();
    
  } catch (error) {
    // If token is invalid, continue without user (don't throw error)
    console.log('Optional auth - invalid token, continuing without user');
    next();
  }
};

/**
 * Role-based access control
 * Restrict routes to specific roles
 * 
 * Usage: authorize('administrator', 'supplier')
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    
    next();
  };
};

/**
 * Check if user owns the resource or is admin
 * Used for user-specific routes (e.g., updating profile, viewing orders)
 */
exports.ownerOrAdmin = (userIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    // Admin can access anything
    if (req.user.role === 'administrator') {
      return next();
    }
    
    // Check if user owns the resource
    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    
    if (resourceUserId && resourceUserId.toString() === req.user._id.toString()) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this resource'
    });
  };
};

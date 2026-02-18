const crypto = require('crypto');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const cartController = require('./cartController');

/**
 * Register new user
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role = 'customer' } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role
    });
    
    // Merge guest cart if cartSessionId provided
    const { cartSessionId } = req.body;
    if (cartSessionId) {
      await cartController.mergeGuestCart(user._id, cartSessionId);
    }
    
    // Generate token
    const token = user.generateAuthToken();
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
    
  } catch (error) {
    console.error('[Auth Controller] Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password, cartSessionId } = req.body;
    
    // Find user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Merge guest cart into user cart if sessionId provided
    if (cartSessionId) {
      await cartController.mergeGuestCart(user._id, cartSessionId);
    }

    // Generate token
    const token = user.generateAuthToken();
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone
        },
        token
      }
    });
    
  } catch (error) {
    console.error('[Auth Controller] Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

/**
 * Get current user
 * GET /api/auth/me
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('vehicles')
      .select('-password');
    
    res.json({
      success: true,
      data: user
    });
    
  } catch (error) {
    console.error('[Auth Controller] GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  try {
    // In a real implementation, you might want to blacklist the token
    // or remove it from a token store
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    console.error('[Auth Controller] Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: error.message
    });
  }
};

/**
 * Forgot password - generate reset token
 * POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    // Always return success to prevent email enumeration
    const successResponse = {
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link shortly.'
    };
    if (!user) {
      return res.json(successResponse);
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });
    // In development, return reset URL for testing (no email configured)
    if (process.env.NODE_ENV === 'development') {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      successResponse.resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    }
    return res.json(successResponse);
  } catch (error) {
    console.error('[Auth Controller] ForgotPassword error:', error);
    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link shortly.'
    });
  }
};

/**
 * Reset password with token
 * PUT /api/auth/reset-password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+password');
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token. Please request a new one.'
      });
    }
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    const jwtToken = user.generateAuthToken();
    res.json({
      success: true,
      message: 'Password reset successfully',
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token: jwtToken
      }
    });
  } catch (error) {
    console.error('[Auth Controller] ResetPassword error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, language } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (language) user.language = language;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
    
  } catch (error) {
    console.error('[Auth Controller] Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate, loginRules, registerRules, forgotPasswordRules, resetPasswordRules } = require('../middleware/validationMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', authLimiter, registerRules, validate, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authLimiter, loginRules, validate, authController.login);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', authLimiter, forgotPasswordRules, validate, authController.forgotPassword);

/**
 * @route   PUT /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.put('/reset-password', resetPasswordRules, validate, authController.resetPassword);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', protect, authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', protect, authController.getMe);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, authController.updateProfile);

module.exports = router;

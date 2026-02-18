const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { body } = require('express-validator');
const { apiLimiter } = require('../middleware/rateLimitMiddleware');

/**
 * ★★★ CATEGORY ROUTES ★★★
 * Category management endpoints
 */

// Category validation rules
const categoryRules = [
  body('name.en').notEmpty().withMessage('English name is required'),
  body('slug').notEmpty().withMessage('Slug is required')
];

// ====================
// PUBLIC ROUTES
// ====================

/**
 * @route   GET /api/categories
 * @desc    Get all categories (hierarchical)
 * @access  Public
 */
router.get('/', apiLimiter, categoryController.getAllCategories);

/**
 * @route   GET /api/categories/top
 * @desc    Get top-level categories only
 * @access  Public
 */
router.get('/top', apiLimiter, categoryController.getTopCategories);

/**
 * @route   GET /api/categories/slug/:slug
 * @desc    Get category by slug
 * @access  Public
 */
router.get('/slug/:slug', apiLimiter, categoryController.getCategoryBySlug);

/**
 * @route   GET /api/categories/:id
 * @desc    Get single category by ID
 * @access  Public
 */
router.get('/:id', apiLimiter, categoryController.getCategoryById);

// ====================
// ADMIN ONLY ROUTES
// ====================

/**
 * @route   POST /api/categories
 * @desc    Create new category
 * @access  Private (Admin only)
 */
router.post(
  '/',
  protect,
  authorize('administrator'),
  categoryRules,
  validate,
  categoryController.createCategory
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  protect,
  authorize('administrator'),
  categoryRules,
  validate,
  categoryController.updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category (soft delete)
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  protect,
  authorize('administrator'),
  categoryController.deleteCategory
);

/**
 * @route   PUT /api/categories/reorder
 * @desc    Reorder categories
 * @access  Private (Admin only)
 */
router.put(
  '/admin/reorder',
  protect,
  authorize('administrator'),
  categoryController.reorderCategories
);

module.exports = router;

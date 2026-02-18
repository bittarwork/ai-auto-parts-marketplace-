const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate, productRules, updateStockRules } = require('../middleware/validationMiddleware');
const { apiLimiter } = require('../middleware/rateLimitMiddleware');

/**
 * ★★★ PRODUCT ROUTES ★★★
 * Comprehensive product management endpoints
 */

// ====================
// PUBLIC ROUTES
// ====================

/**
 * @route   GET /api/products
 * @desc    Get all products with advanced filtering
 * @access  Public
 * @query   page, limit, search, category, brand, minPrice, maxPrice, inStock, featured, sortBy, sortOrder
 */
router.get('/', apiLimiter, productController.getAllProducts);

/**
 * @route   GET /api/products/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get('/featured', apiLimiter, productController.getFeaturedProducts);

/**
 * @route   GET /api/products/category/:categoryId
 * @desc    Get products by category
 * @access  Public
 */
router.get('/category/:categoryId', apiLimiter, productController.getProductsByCategory);

/**
 * @route   GET /api/products/slug/:slug
 * @desc    Get product by slug
 * @access  Public
 */
router.get('/slug/:slug', apiLimiter, productController.getProductBySlug);

/**
 * @route   POST /api/products/:id/notify
 * @desc    Subscribe to stock notification (login required)
 * @access  Private
 */
router.post('/:id/notify', protect, productController.addProductNotification);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get('/:id', apiLimiter, productController.getProductById);

// ====================
// PROTECTED ROUTES (Admin/Supplier)
// ====================

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Private (Admin/Supplier)
 */
router.post(
  '/',
  protect,
  authorize('administrator', 'supplier'),
  productRules,
  validate,
  productController.createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private (Admin/Supplier - own products)
 */
router.put(
  '/:id',
  protect,
  authorize('administrator', 'supplier'),
  productRules,
  validate,
  productController.updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product (soft delete)
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  protect,
  authorize('administrator'),
  productController.deleteProduct
);

/**
 * @route   PATCH /api/products/:id/stock
 * @desc    Update product stock
 * @access  Private (Admin/Supplier)
 */
router.patch(
  '/:id/stock',
  protect,
  authorize('administrator', 'supplier'),
  updateStockRules,
  validate,
  productController.updateStock
);

// ====================
// ADMIN ONLY ROUTES
// ====================

/**
 * @route   GET /api/products/stats
 * @desc    Get product statistics
 * @access  Private (Admin only)
 */
router.get(
  '/admin/stats',
  protect,
  authorize('administrator'),
  productController.getProductStats
);

/**
 * @route   PUT /api/products/bulk
 * @desc    Bulk update products
 * @access  Private (Admin only)
 */
router.put(
  '/bulk',
  protect,
  authorize('administrator'),
  productController.bulkUpdate
);

module.exports = router;

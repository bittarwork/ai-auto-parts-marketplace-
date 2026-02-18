const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const orderController = require('../controllers/orderController');
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * ★★★ ADMIN ROUTES ★★★
 * All routes require authentication + administrator role
 */

// Apply auth middleware to all admin routes
router.use(protect);
router.use(authorize('administrator'));

// ============================================================
// DASHBOARD
// ============================================================
router.get('/dashboard', adminController.getDashboard);

// ============================================================
// USER MANAGEMENT
// ============================================================
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/activate', adminController.toggleUserActivation);

// ============================================================
// SUPPLIER MANAGEMENT
// ============================================================
router.get('/suppliers', adminController.getSuppliers);
router.patch('/suppliers/:id/status', adminController.updateSupplierStatus);

// ============================================================
// ANALYTICS
// ============================================================
router.get('/analytics/revenue', adminController.getRevenueAnalytics);
router.get('/analytics/orders', adminController.getOrdersAnalytics);
router.get('/analytics/users', adminController.getUsersAnalytics);
router.get('/analytics/top-products', adminController.getTopProducts);

// ============================================================
// SETTINGS
// ============================================================
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// ============================================================
// AI ANALYTICS
// ============================================================
router.get('/ai/stats', adminController.getAIStats);

// ============================================================
// ORDERS (extended admin routes)
// ============================================================
router.get('/orders', orderController.getAllOrders);
router.get('/orders/quick-stats', orderController.getOrderQuickStats);
router.get('/orders/stats', orderController.getOrderStats);
router.get('/orders/:id', adminController.getOrderDetails);
router.put('/orders/:id', adminController.updateOrderDetails);

// ============================================================
// PRODUCTS (reuse existing controller)
// ============================================================
router.get('/products', productController.getAllProducts);
router.get('/products/stats', productController.getProductStats);

// ============================================================
// CATEGORIES (reuse existing controller)
// ============================================================
router.get('/categories', categoryController.getAllCategories);

module.exports = router;

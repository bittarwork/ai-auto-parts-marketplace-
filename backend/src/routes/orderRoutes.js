const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { body } = require('express-validator');

/**
 * ★★★ ORDER ROUTES ★★★
 * Order management endpoints
 */

// Order creation validation rules
const createOrderRules = [
  body('shippingAddress.fullName').notEmpty().withMessage('Full name is required'),
  body('shippingAddress.phone').notEmpty().withMessage('Phone is required'),
  body('shippingAddress.addressLine1').notEmpty().withMessage('Address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['credit_card', 'debit_card', 'cash_on_delivery', 'bank_transfer'])
    .withMessage('Invalid payment method')
];

// Status update validation rules
const updateStatusRules = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status'),
  body('note').optional().isString()
];

// Payment status validation rules
const updatePaymentRules = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'paid', 'failed', 'refunded'])
    .withMessage('Invalid payment status')
];

// ====================
// USER ROUTES
// ====================

/**
 * @route   GET /api/orders
 * @desc    Get all orders for current user
 * @access  Private
 */
router.get('/', protect, orderController.getUserOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order by ID
 * @access  Private
 */
router.get('/:id', protect, orderController.getOrderById);

/**
 * @route   POST /api/orders
 * @desc    Create new order from cart
 * @access  Private
 */
router.post(
  '/',
  protect,
  createOrderRules,
  validate,
  orderController.createOrder
);

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private
 */
router.put('/:id/cancel', protect, orderController.cancelOrder);

// ====================
// ADMIN ROUTES
// ====================

/**
 * @route   GET /api/orders/admin/all
 * @desc    Get all orders (Admin only)
 * @access  Private (Admin)
 */
router.get(
  '/admin/all',
  protect,
  authorize('administrator'),
  orderController.getAllOrders
);

/**
 * @route   GET /api/orders/admin/stats
 * @desc    Get order statistics
 * @access  Private (Admin)
 */
router.get(
  '/admin/stats',
  protect,
  authorize('administrator'),
  orderController.getOrderStats
);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private (Admin)
 */
router.put(
  '/:id/status',
  protect,
  authorize('administrator'),
  updateStatusRules,
  validate,
  orderController.updateOrderStatus
);

/**
 * @route   PATCH /api/orders/:id/payment
 * @desc    Update payment status
 * @access  Private (Admin)
 */
router.patch(
  '/:id/payment',
  protect,
  authorize('administrator'),
  updatePaymentRules,
  validate,
  orderController.updatePaymentStatus
);

module.exports = router;

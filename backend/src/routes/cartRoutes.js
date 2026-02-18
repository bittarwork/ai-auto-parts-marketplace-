const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { body } = require('express-validator');

const addToCartRules = [
  body('productId').notEmpty().withMessage('Product ID required').isMongoId().withMessage('Invalid product ID'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];
const updateCartRules = [
  body('quantity').notEmpty().withMessage('Quantity required').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

// Guest + User: optionalAuth
router.get('/', optionalAuth, cartController.getCart);
router.get('/count', optionalAuth, cartController.getCartCount);
router.post('/items', optionalAuth, addToCartRules, validate, cartController.addToCart);
router.put('/items/:productId', optionalAuth, updateCartRules, validate, cartController.updateCartItem);
router.delete('/items/:productId', optionalAuth, cartController.removeFromCart);
router.delete('/', optionalAuth, cartController.clearCart);

// Checkout validation - LOGIN REQUIRED
router.post('/validate', protect, cartController.validateCart);

module.exports = router;

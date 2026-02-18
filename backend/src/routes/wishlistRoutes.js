const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

// All wishlist routes require login
router.get('/', protect, wishlistController.getWishlist);
router.post('/:productId', protect, wishlistController.addToWishlist);
router.delete('/:productId', protect, wishlistController.removeFromWishlist);
router.get('/check/:productId', protect, wishlistController.checkWishlist);

module.exports = router;

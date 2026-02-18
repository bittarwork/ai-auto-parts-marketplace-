const express = require('express');
const router = express.Router();
const aiSearchController = require('../controllers/aiSearchController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// ★★★ INTELLIGENT SEARCH ROUTES ★★★

/**
 * @route   POST /api/ai/search
 * @desc    Intelligent search with NLP
 * @access  Public (but personalized if authenticated)
 */
router.post('/search', optionalAuth, aiSearchController.intelligentSearch);

/**
 * @route   GET /api/ai/suggestions
 * @desc    Get search suggestions for autocomplete
 * @access  Public
 */
router.get('/suggestions', aiSearchController.getSearchSuggestions);

/**
 * @route   GET /api/ai/related-searches
 * @desc    Get related search queries
 * @access  Public
 */
router.get('/related-searches', aiSearchController.getRelatedSearches);

// ★★ COMPATIBILITY ROUTES ★★

/**
 * @route   POST /api/ai/compatibility
 * @desc    Check if product is compatible with vehicle
 * @access  Public
 */
router.post('/compatibility', aiSearchController.checkCompatibility);

/**
 * @route   GET /api/ai/compatible-products/:vehicleId
 * @desc    Get all products compatible with a vehicle
 * @access  Public
 */
router.get('/compatible-products/:vehicleId', aiSearchController.getCompatibleProducts);

// ★★ RECOMMENDATION ROUTES ★★

/**
 * @route   GET /api/ai/recommendations
 * @desc    Get personalized product recommendations
 * @access  Private (requires authentication)
 */
router.get('/recommendations', protect, aiSearchController.getRecommendations);

/**
 * @route   GET /api/ai/similar/:productId
 * @desc    Get similar products
 * @access  Public
 */
router.get('/similar/:productId', aiSearchController.getSimilarProducts);

/**
 * @route   GET /api/ai/frequently-bought-together/:productId
 * @desc    Get frequently bought together products
 * @access  Public
 */
router.get('/frequently-bought-together/:productId', aiSearchController.getFrequentlyBoughtTogether);

/**
 * @route   GET /api/ai/popular
 * @desc    Get popular products
 * @access  Public
 */
router.get('/popular', aiSearchController.getPopularProducts);

/**
 * @route   GET /api/ai/trending
 * @desc    Get trending products
 * @access  Public
 */
router.get('/trending', aiSearchController.getTrendingProducts);

// ★★ CHATBOT ROUTES ★★

/**
 * @route   POST /api/ai/chatbot
 * @desc    Send message to AI chatbot
 * @access  Public (but personalized if authenticated)
 */
router.post('/chatbot', optionalAuth, aiSearchController.chatbotMessage);

/**
 * @route   GET /api/ai/chatbot/quick-actions
 * @desc    Get chatbot quick action suggestions
 * @access  Public
 */
router.get('/chatbot/quick-actions', aiSearchController.getChatbotQuickActions);

/**
 * @route   DELETE /api/ai/chatbot/:sessionId
 * @desc    Clear chatbot conversation history
 * @access  Public
 */
router.delete('/chatbot/:sessionId', aiSearchController.clearChatbotHistory);

module.exports = router;

const aiSearchService = require('../services/aiSearchService');
const nlpProcessor = require('../services/nlpProcessorService');
const compatibilityService = require('../services/compatibilityService');
const recommendationService = require('../services/recommendationService');
const chatbotService = require('../services/chatbotService');

/**
 * ★★★ INTELLIGENT SEARCH - Main endpoint
 * POST /api/ai/search
 */
exports.intelligentSearch = async (req, res) => {
  try {
    const { query, language = 'en', page = 1, limit = 20, sortBy = 'relevance', filters = {} } = req.body;
    
    // Validate query
    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    // Get user ID from authenticated request (if available)
    const userId = req.user ? req.user._id : null;
    
    // Perform intelligent search
    const results = await aiSearchService.intelligentSearch(query, userId, {
      language,
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      filters
    });
    
    res.json({
      success: true,
      data: results
    });
    
  } catch (error) {
    console.error('[AI Search Controller] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing search',
      error: error.message
    });
  }
};

/**
 * ★★ GET SEARCH SUGGESTIONS
 * GET /api/ai/suggestions?q=query&lang=en
 */
exports.getSearchSuggestions = async (req, res) => {
  try {
    const { q: query, lang: language = 'en', limit = 10 } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const suggestions = await aiSearchService.getSearchSuggestions(
      query,
      language,
      parseInt(limit)
    );
    
    res.json({
      success: true,
      data: suggestions
    });
    
  } catch (error) {
    console.error('[AI Search Controller] Error getting suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting suggestions',
      error: error.message
    });
  }
};

/**
 * ★★ GET RELATED SEARCHES
 * GET /api/ai/related-searches?q=query&lang=en
 */
exports.getRelatedSearches = async (req, res) => {
  try {
    const { q: query, lang: language = 'en', limit = 5 } = req.query;
    
    if (!query) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const relatedSearches = await aiSearchService.getRelatedSearches(
      query,
      language,
      parseInt(limit)
    );
    
    res.json({
      success: true,
      data: relatedSearches
    });
    
  } catch (error) {
    console.error('[AI Search Controller] Error getting related searches:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting related searches',
      error: error.message
    });
  }
};

/**
 * ★ CHECK COMPATIBILITY
 * POST /api/ai/compatibility
 */
exports.checkCompatibility = async (req, res) => {
  try {
    const { productId, vehicleId } = req.body;
    
    if (!productId || !vehicleId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and Vehicle ID are required'
      });
    }
    
    const result = await compatibilityService.checkCompatibility(productId, vehicleId);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('[AI Search Controller] Error checking compatibility:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking compatibility',
      error: error.message
    });
  }
};

/**
 * ★ GET COMPATIBLE PRODUCTS FOR VEHICLE
 * GET /api/ai/compatible-products/:vehicleId
 */
exports.getCompatibleProducts = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { category, page = 1, limit = 20 } = req.query;
    
    const result = await compatibilityService.findCompatibleProducts(vehicleId, {
      category,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('[AI Search Controller] Error getting compatible products:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting compatible products',
      error: error.message
    });
  }
};

/**
 * ★ GET PERSONALIZED RECOMMENDATIONS
 * GET /api/ai/recommendations
 */
exports.getRecommendations = async (req, res) => {
  try {
    // Require authentication
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const { vehicleId, limit = 10 } = req.query;
    const userId = req.user._id;
    
    const recommendations = await recommendationService.getPersonalizedRecommendations(
      userId,
      {
        vehicleId,
        limit: parseInt(limit)
      }
    );
    
    res.json({
      success: true,
      data: recommendations
    });
    
  } catch (error) {
    console.error('[AI Search Controller] Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting recommendations',
      error: error.message
    });
  }
};

/**
 * ★ GET SIMILAR PRODUCTS
 * GET /api/ai/similar/:productId
 */
exports.getSimilarProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 6 } = req.query;
    
    const similarProducts = await recommendationService.getSimilarProducts(
      productId,
      parseInt(limit)
    );
    
    res.json({
      success: true,
      data: similarProducts
    });
    
  } catch (error) {
    console.error('[AI Search Controller] Error getting similar products:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting similar products',
      error: error.message
    });
  }
};

/**
 * ★ GET FREQUENTLY BOUGHT TOGETHER
 * GET /api/ai/frequently-bought-together/:productId
 */
exports.getFrequentlyBoughtTogether = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 4 } = req.query;
    
    const products = await recommendationService.getFrequentlyBoughtTogether(
      productId,
      parseInt(limit)
    );
    
    res.json({
      success: true,
      data: products
    });
    
  } catch (error) {
    console.error('[AI Search Controller] Error getting frequently bought together:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting frequently bought together products',
      error: error.message
    });
  }
};

/**
 * ★★ CHATBOT MESSAGE
 * POST /api/ai/chatbot
 */
exports.chatbotMessage = async (req, res) => {
  try {
    const { message, sessionId, context = {} } = req.body;
    
    if (!message || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Message and session ID are required'
      });
    }
    
    const userId = req.user ? req.user._id : null;
    
    const response = await chatbotService.processMessage(
      message,
      userId,
      sessionId,
      context
    );
    
    res.json({
      success: true,
      data: response
    });
    
  } catch (error) {
    console.error('[AI Search Controller] Error processing chatbot message:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing message',
      error: error.message
    });
  }
};

/**
 * ★ GET CHATBOT QUICK ACTIONS
 * GET /api/ai/chatbot/quick-actions
 */
exports.getChatbotQuickActions = async (req, res) => {
  try {
    const { lang: language = 'en' } = req.query;
    
    const quickActions = chatbotService.getQuickActions(language);
    
    res.json({
      success: true,
      data: quickActions
    });
    
  } catch (error) {
    console.error('[AI Search Controller] Error getting quick actions:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting quick actions',
      error: error.message
    });
  }
};

/**
 * ★ CLEAR CHATBOT HISTORY
 * DELETE /api/ai/chatbot/:sessionId
 */
exports.clearChatbotHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    await chatbotService.clearChatHistory(sessionId);
    
    res.json({
      success: true,
      message: 'Chat history cleared'
    });
    
  } catch (error) {
    console.error('[AI Search Controller] Error clearing chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing chat history',
      error: error.message
    });
  }
};

/**
 * ★★ GET USER CHAT SESSIONS
 * GET /api/ai/chatbot/sessions
 */
exports.getUserChatSessions = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to view chat history'
      });
    }
    
    const { page = 1, limit = 20 } = req.query;
    
    const result = await chatbotService.getUserSessions(
      req.user._id,
      parseInt(page),
      parseInt(limit)
    );
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('[AI Search Controller] Error getting chat sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting chat sessions',
      error: error.message
    });
  }
};

/**
 * ★★ GET SESSION MESSAGES
 * GET /api/ai/chatbot/sessions/:sessionId
 */
exports.getSessionMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user ? req.user._id : null;
    
    const session = await chatbotService.getSessionMessages(sessionId, userId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }
    
    res.json({
      success: true,
      data: session
    });
    
  } catch (error) {
    console.error('[AI Search Controller] Error getting session messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting session messages',
      error: error.message
    });
  }
};

/**
 * ★ DELETE CHAT SESSION
 * DELETE /api/ai/chatbot/sessions/:sessionId
 */
exports.deleteChatSession = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const { sessionId } = req.params;
    const deleted = await chatbotService.deleteSession(sessionId, req.user._id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Chat session deleted'
    });
    
  } catch (error) {
    console.error('[AI Search Controller] Error deleting chat session:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting chat session',
      error: error.message
    });
  }
};

/**
 * ★ GET POPULAR PRODUCTS
 * GET /api/ai/popular
 */
exports.getPopularProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const products = await recommendationService.getPopularProducts(parseInt(limit));
    
    res.json({
      success: true,
      data: products
    });
    
  } catch (error) {
    console.error('[AI Search Controller] Error getting popular products:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting popular products',
      error: error.message
    });
  }
};

/**
 * ★ GET TRENDING PRODUCTS
 * GET /api/ai/trending
 */
exports.getTrendingProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const products = await recommendationService.getTrendingProducts(parseInt(limit));
    
    res.json({
      success: true,
      data: products
    });
    
  } catch (error) {
    console.error('[AI Search Controller] Error getting trending products:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting trending products',
      error: error.message
    });
  }
};

import api from './api';

/**
 * AI Search Service
 * Handles all AI-powered search and recommendation features
 */

class AISearchService {
  /**
   * ★★★ Perform intelligent search
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async intelligentSearch(query, options = {}) {
    const {
      language = 'en',
      page = 1,
      limit = 20,
      sortBy = 'relevance',
      filters = {}
    } = options;
    
    return api.post('/ai/search', {
      query,
      language,
      page,
      limit,
      sortBy,
      filters
    });
  }
  
  /**
   * Get search suggestions for autocomplete
   * @param {string} query - Partial search query
   * @param {string} language - Language code
   * @returns {Promise<Array>} Suggestions
   */
  async getSearchSuggestions(query, language = 'en') {
    return api.get('/ai/suggestions', {
      params: { q: query, lang: language }
    });
  }
  
  /**
   * Get related searches
   * @param {string} query - Current search query
   * @param {string} language - Language code
   * @returns {Promise<Array>} Related searches
   */
  async getRelatedSearches(query, language = 'en') {
    return api.get('/ai/related-searches', {
      params: { q: query, lang: language }
    });
  }
  
  /**
   * Check product compatibility with vehicle
   * @param {string} productId - Product ID
   * @param {string} vehicleId - Vehicle ID
   * @returns {Promise<Object>} Compatibility result
   */
  async checkCompatibility(productId, vehicleId) {
    return api.post('/ai/compatibility', {
      productId,
      vehicleId
    });
  }
  
  /**
   * Get all compatible products for a vehicle
   * @param {string} vehicleId - Vehicle ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Compatible products
   */
  async getCompatibleProducts(vehicleId, options = {}) {
    return api.get(`/ai/compatible-products/${vehicleId}`, {
      params: options
    });
  }
  
  /**
   * Get personalized recommendations
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Recommended products
   */
  async getRecommendations(options = {}) {
    return api.get('/ai/recommendations', {
      params: options
    });
  }
  
  /**
   * Get similar products
   * @param {string} productId - Product ID
   * @param {number} limit - Number of products
   * @returns {Promise<Array>} Similar products
   */
  async getSimilarProducts(productId, limit = 6) {
    return api.get(`/ai/similar/${productId}`, {
      params: { limit }
    });
  }
  
  /**
   * Get frequently bought together products
   * @param {string} productId - Product ID
   * @param {number} limit - Number of products
   * @returns {Promise<Array>} Related products
   */
  async getFrequentlyBoughtTogether(productId, limit = 4) {
    return api.get(`/ai/frequently-bought-together/${productId}`, {
      params: { limit }
    });
  }
  
  /**
   * Get popular products
   * @param {number} limit - Number of products
   * @returns {Promise<Array>} Popular products
   */
  async getPopularProducts(limit = 10) {
    return api.get('/ai/popular', {
      params: { limit }
    });
  }
  
  /**
   * Get trending products
   * @param {number} limit - Number of products
   * @returns {Promise<Array>} Trending products
   */
  async getTrendingProducts(limit = 10) {
    return api.get('/ai/trending', {
      params: { limit }
    });
  }
}

export default new AISearchService();

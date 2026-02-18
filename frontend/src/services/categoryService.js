import api from './api';

/**
 * Category Service
 * Handles all category-related API calls
 */

class CategoryService {
  /**
   * Get all categories (hierarchical)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Categories list
   */
  async getAllCategories(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/categories?${queryString}`);
  }
  
  /**
   * Get single category by ID
   * @param {string} id - Category ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Category details
   */
  async getCategoryById(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/categories/${id}?${queryString}`);
  }
  
  /**
   * Get category by slug
   * @param {string} slug - Category slug
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Category details
   */
  async getCategoryBySlug(slug, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/categories/slug/${slug}?${queryString}`);
  }
  
  /**
   * Get top-level categories
   * @returns {Promise<Object>} Top categories
   */
  async getTopCategories() {
    return api.get('/categories/top');
  }
}

export default new CategoryService();

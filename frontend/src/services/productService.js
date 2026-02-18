import api from './api';

/**
 * Product Service
 * Handles all product-related API calls
 */

class ProductService {
  /**
   * Get all products with filters
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Products list with pagination
   */
  async getAllProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/products?${queryString}`);
  }
  
  /**
   * Get single product by ID
   * @param {string} id - Product ID
   * @returns {Promise<Object>} Product details
   */
  async getProductById(id) {
    return api.get(`/products/${id}`);
  }
  
  /**
   * Get product by slug
   * @param {string} slug - Product slug
   * @returns {Promise<Object>} Product details
   */
  async getProductBySlug(slug) {
    return api.get(`/products/slug/${slug}`);
  }
  
  /**
   * Get products by category
   * @param {string} categoryId - Category ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Products list
   */
  async getProductsByCategory(categoryId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/products/category/${categoryId}?${queryString}`);
  }
  
  /**
   * Get featured products
   * @param {number} limit - Number of products
   * @returns {Promise<Object>} Featured products
   */
  async getFeaturedProducts(limit = 10) {
    return api.get(`/products/featured?limit=${limit}`);
  }
  
  /**
   * Create new product (Admin/Supplier)
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product
   */
  async createProduct(productData) {
    return api.post('/products', productData);
  }
  
  /**
   * Update product (Admin/Supplier)
   * @param {string} id - Product ID
   * @param {Object} updates - Product updates
   * @returns {Promise<Object>} Updated product
   */
  async updateProduct(id, updates) {
    return api.put(`/products/${id}`, updates);
  }
  
  /**
   * Delete product (Admin)
   * @param {string} id - Product ID
   * @returns {Promise<Object>} Success message
   */
  async deleteProduct(id) {
    return api.delete(`/products/${id}`);
  }
  
  /**
   * Update product stock (Admin/Supplier)
   * @param {string} id - Product ID
   * @param {number} stock - New stock value
   * @returns {Promise<Object>} Updated stock
   */
  async updateStock(id, stock) {
    return api.patch(`/products/${id}/stock`, { stock });
  }
  
  /**
   * Get product statistics (Admin)
   * @returns {Promise<Object>} Product statistics
   */
  async getProductStats() {
    return api.get('/products/admin/stats');
  }

  /**
   * Subscribe to stock notification (login required)
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Success message
   */
  async subscribeNotifyMe(productId) {
    return api.post(`/products/${productId}/notify`);
  }
}

export default new ProductService();

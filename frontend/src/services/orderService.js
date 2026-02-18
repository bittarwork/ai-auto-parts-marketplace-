import api from './api';

/**
 * Order Service
 * Handles all order-related API calls
 */

class OrderService {
  /**
   * Get user's orders
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Orders list
   */
  async getUserOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/orders?${queryString}`);
  }
  
  /**
   * Get single order by ID
   * @param {string} id - Order ID
   * @returns {Promise<Object>} Order details
   */
  async getOrderById(id) {
    return api.get(`/orders/${id}`);
  }
  
  /**
   * Create new order
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} Created order
   */
  async createOrder(orderData) {
    return api.post('/orders', orderData);
  }
  
  /**
   * Cancel order
   * @param {string} id - Order ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Cancelled order
   */
  async cancelOrder(id, reason) {
    return api.put(`/orders/${id}/cancel`, { reason });
  }
}

export default new OrderService();

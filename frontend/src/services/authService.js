import api from './api';
import cartService from './cartService';

/**
 * Authentication Service
 * Handles user authentication operations
 */

class AuthService {
  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  async register(userData) {
    const cartSessionId = cartService?.getCartSessionId?.();
    const response = await api.post('/auth/register', { ...userData, cartSessionId });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
      this.setUser(response.data.user);
      window.dispatchEvent(new Event('auth:changed'));
    }
    
    return response;
  }
  
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login response
   */
  async login(email, password) {
    const cartSessionId = cartService?.getCartSessionId?.() || localStorage.getItem('cart_session_id');
    const response = await api.post('/auth/login', { email, password, cartSessionId });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
      this.setUser(response.data.user);
      window.dispatchEvent(new Event('auth:changed'));
    }
    
    return response;
  }
  
  /**
   * Logout user
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
      window.dispatchEvent(new Event('auth:changed'));
    }
  }
  
  /**
   * Get current user
   * @returns {Promise<Object>} Current user data
   */
  async getMe() {
    return api.get('/auth/me');
  }
  
  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Response with optional resetUrl (dev mode)
   */
  async forgotPassword(email) {
    return api.post('/auth/forgot-password', { email });
  }

  /**
   * Reset password with token
   * @param {string} token - Reset token from email/link
   * @param {string} password - New password
   * @returns {Promise<Object>} Response with user & token if success
   */
  async resetPassword(token, password) {
    return api.put('/auth/reset-password', { token, password });
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Updated user data
   */
  async updateProfile(profileData) {
    return api.put('/auth/profile', profileData);
  }
  
  /**
   * Set auth token in localStorage
   * @param {string} token - JWT token
   */
  setToken(token) {
    localStorage.setItem('token', token);
  }
  
  /**
   * Get auth token from localStorage
   * @returns {string|null} JWT token
   */
  getToken() {
    return localStorage.getItem('token');
  }
  
  /**
   * Set user data in localStorage
   * @param {Object} user - User data
   */
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
  
  /**
   * Get user data from localStorage
   * @returns {Object|null} User data
   */
  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  
  /**
   * Clear all auth data
   */
  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  
  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!this.getToken();
  }
  
  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} Role match status
   */
  hasRole(role) {
    const user = this.getUser();
    return user && user.role === role;
  }
}

export default new AuthService();

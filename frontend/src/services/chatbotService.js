import api from './api';

/**
 * Chatbot Service
 * Handles chatbot interactions
 */

class ChatbotService {
  /**
   * Send message to chatbot
   * @param {string} message - User message
   * @param {string} sessionId - Session ID
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} Bot response
   */
  async sendMessage(message, sessionId, context = {}) {
    return api.post('/ai/chatbot', {
      message,
      sessionId,
      context
    });
  }
  
  /**
   * Get quick action suggestions
   * @param {string} language - Language code
   * @returns {Promise<Array>} Quick actions
   */
  async getQuickActions(language = 'en') {
    return api.get('/ai/chatbot/quick-actions', {
      params: { lang: language }
    });
  }
  
  /**
   * Clear chat history
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Response
   */
  async clearHistory(sessionId) {
    return api.delete(`/ai/chatbot/${sessionId}`);
  }
  
  /**
   * Generate session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new ChatbotService();

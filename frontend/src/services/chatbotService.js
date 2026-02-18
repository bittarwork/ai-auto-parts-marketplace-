import api from './api';

/**
 * Chatbot Service
 * Handles chatbot interactions and chat history management
 */
class ChatbotService {
  /**
   * Send message to chatbot
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
   */
  async getQuickActions(language = 'en') {
    return api.get('/ai/chatbot/quick-actions', {
      params: { lang: language }
    });
  }
  
  /**
   * Clear chat history (cache only)
   */
  async clearHistory(sessionId) {
    return api.delete(`/ai/chatbot/${sessionId}`);
  }
  
  /**
   * Get user's saved chat sessions
   */
  async getSessions(page = 1, limit = 20) {
    return api.get('/ai/chatbot/sessions', {
      params: { page, limit }
    });
  }
  
  /**
   * Get messages for a specific session
   */
  async getSessionMessages(sessionId) {
    return api.get(`/ai/chatbot/sessions/${sessionId}`);
  }
  
  /**
   * Delete a chat session
   */
  async deleteSession(sessionId) {
    return api.delete(`/ai/chatbot/sessions/${sessionId}`);
  }
  
  /**
   * Generate session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new ChatbotService();

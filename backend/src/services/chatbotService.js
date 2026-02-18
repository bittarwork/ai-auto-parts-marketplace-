const { openai, prompts, callGPT4 } = require('../config/openai');
const { cacheHelper, cacheKeys } = require('../config/redis');
const Vehicle = require('../models/Vehicle');
const Product = require('../models/Product');

class ChatbotService {
  
  /**
   * Process chatbot message
   * 
   * @param {string} message - User message
   * @param {string} userId - User ID (optional)
   * @param {string} sessionId - Session ID for conversation context
   * @param {Object} context - Additional context (product, vehicle, etc.)
   * @returns {Object} Chatbot response
   */
  async processMessage(message, userId = null, sessionId, context = {}) {
    try {
      console.log(`[Chatbot] Processing message for session: ${sessionId}`);
      
      // Get conversation history from cache
      const chatHistory = await this.getChatHistory(sessionId);
      
      // Get user vehicles if available
      let userVehicles = [];
      if (userId) {
        userVehicles = await Vehicle.find({ user: userId }).lean();
      }
      
      // Get current product context if provided
      let currentProduct = null;
      if (context.productId) {
        currentProduct = await Product.findById(context.productId).lean();
      }
      
      // Build messages for GPT-4
      const messages = [
        { role: 'system', content: prompts.chatbot.system }
      ];
      
      // Add context
      const contextMessage = prompts.chatbot.contextBuilder(
        chatHistory,
        userVehicles,
        currentProduct
      );
      
      if (contextMessage) {
        messages[0].content += contextMessage;
      }
      
      // Add conversation history (last 5 messages)
      chatHistory.slice(-5).forEach(msg => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
      
      // Add current message
      messages.push({
        role: 'user',
        content: message
      });
      
      // Call GPT-4
      const response = await callGPT4(messages, {
        temperature: 0.7, // Slightly higher for more natural conversation
        maxTokens: 500
      });
      
      // Update chat history
      await this.updateChatHistory(sessionId, [
        { role: 'user', content: message, timestamp: new Date() },
        { role: 'assistant', content: response, timestamp: new Date() }
      ]);
      
      return {
        message: response,
        sessionId,
        timestamp: new Date()
      };
      
    } catch (error) {
      console.error('[Chatbot] Error processing message:', error);
      
      // Return fallback response
      return {
        message: this.getFallbackResponse(message),
        sessionId,
        timestamp: new Date(),
        error: true
      };
    }
  }
  
  /**
   * Get chat history from cache
   * 
   * @param {string} sessionId - Session ID
   * @returns {Array} Chat history
   */
  async getChatHistory(sessionId) {
    try {
      const cacheKey = cacheKeys.chatContext(sessionId);
      const history = await cacheHelper.get(cacheKey);
      return history || [];
    } catch (error) {
      console.error('[Chatbot] Error getting chat history:', error);
      return [];
    }
  }
  
  /**
   * Update chat history in cache
   * 
   * @param {string} sessionId - Session ID
   * @param {Array} newMessages - New messages to add
   */
  async updateChatHistory(sessionId, newMessages) {
    try {
      const cacheKey = cacheKeys.chatContext(sessionId);
      const history = await this.getChatHistory(sessionId);
      
      // Add new messages
      history.push(...newMessages);
      
      // Keep only last 20 messages to prevent context from getting too large
      const trimmedHistory = history.slice(-20);
      
      // Cache for 1 hour
      await cacheHelper.set(cacheKey, trimmedHistory, 3600);
      
    } catch (error) {
      console.error('[Chatbot] Error updating chat history:', error);
    }
  }
  
  /**
   * Clear chat history for a session
   * 
   * @param {string} sessionId - Session ID
   */
  async clearChatHistory(sessionId) {
    try {
      const cacheKey = cacheKeys.chatContext(sessionId);
      await cacheHelper.del(cacheKey);
      console.log(`[Chatbot] Cleared chat history for session: ${sessionId}`);
    } catch (error) {
      console.error('[Chatbot] Error clearing chat history:', error);
    }
  }
  
  /**
   * Get fallback response when AI fails
   * 
   * @param {string} message - User message
   * @returns {string} Fallback response
   */
  getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Detect language (simple heuristic)
    const isArabic = /[\u0600-\u06FF]/.test(message);
    
    // Common intents
    if (lowerMessage.includes('price') || lowerMessage.includes('سعر')) {
      return isArabic
        ? 'عذراً، لا أستطيع الوصول إلى معلومات الأسعار حالياً. يرجى تصفح المنتجات مباشرة أو التواصل مع فريق الدعم.'
        : 'Sorry, I cannot access price information right now. Please browse products directly or contact our support team.';
    }
    
    if (lowerMessage.includes('shipping') || lowerMessage.includes('توصيل') || lowerMessage.includes('شحن')) {
      return isArabic
        ? 'نقدم خدمة التوصيل لجميع مدن المملكة. عادة ما يستغرق التوصيل من 3-5 أيام عمل.'
        : 'We offer delivery to all cities in Saudi Arabia. Delivery usually takes 3-5 business days.';
    }
    
    if (lowerMessage.includes('compatible') || lowerMessage.includes('fit') || lowerMessage.includes('متوافق') || lowerMessage.includes('يناسب')) {
      return isArabic
        ? 'للتحقق من توافق القطعة مع سيارتك، يرجى إضافة سيارتك إلى ملفك الشخصي أو البحث عن ماركة وموديل سيارتك.'
        : 'To check if a part fits your car, please add your vehicle to your profile or search for your car brand and model.';
    }
    
    // Default fallback
    return isArabic
      ? 'عذراً، أواجه بعض الصعوبة في فهم سؤالك. هل يمكنك إعادة صياغته؟ أو يمكنك التواصل مع فريق الدعم للمساعدة.'
      : 'Sorry, I\'m having trouble understanding your question. Could you rephrase it? Or you can contact our support team for assistance.';
  }
  
  /**
   * Get quick action suggestions
   * 
   * @param {string} language - Language ('ar' or 'en')
   * @returns {Array} Quick actions
   */
  getQuickActions(language = 'en') {
    if (language === 'ar') {
      return [
        { id: 'search', label: 'ابحث عن قطعة', icon: 'search' },
        { id: 'compatibility', label: 'تحقق من التوافق', icon: 'check' },
        { id: 'shipping', label: 'معلومات الشحن', icon: 'truck' },
        { id: 'return', label: 'سياسة الإرجاع', icon: 'return' },
        { id: 'contact', label: 'تواصل معنا', icon: 'phone' }
      ];
    } else {
      return [
        { id: 'search', label: 'Search for a part', icon: 'search' },
        { id: 'compatibility', label: 'Check compatibility', icon: 'check' },
        { id: 'shipping', label: 'Shipping info', icon: 'truck' },
        { id: 'return', label: 'Return policy', icon: 'return' },
        { id: 'contact', label: 'Contact us', icon: 'phone' }
      ];
    }
  }
}

module.exports = new ChatbotService();

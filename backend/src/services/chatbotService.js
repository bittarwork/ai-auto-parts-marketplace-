const { openai, prompts, callGPT4 } = require('../config/openai');
const { cacheHelper, cacheKeys } = require('../config/redis');
const Vehicle = require('../models/Vehicle');
const Product = require('../models/Product');
const ChatSession = require('../models/ChatSession');

class ChatbotService {
  
  /**
   * Process chatbot message with persistent history and product linking
   */
  async processMessage(message, userId = null, sessionId, context = {}) {
    try {
      console.log(`[Chatbot] Processing message for session: ${sessionId}`);
      
      // Get conversation history from cache (fast) or DB (fallback)
      let chatHistory = await this.getChatHistory(sessionId);
      
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
      
      // Add product linking instructions to system prompt
      messages[0].content += `\n\nIMPORTANT: When you identify or recommend specific auto parts, mention them clearly by name and type so the system can link them. For example: "I recommend the Oil Filter for Chery Tiggo" or "You might need Brake Pads for your vehicle."`;
      
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
        temperature: 0.7,
        maxTokens: 500
      });
      
      // Search for relevant products mentioned in the response
      const suggestedProducts = await this.findMentionedProducts(response, message, userVehicles);
      
      // Prepare message records
      const userMsg = { role: 'user', content: message, timestamp: new Date() };
      const assistantMsg = { 
        role: 'assistant', 
        content: response, 
        timestamp: new Date(),
        suggestedProducts: suggestedProducts.map(p => ({
          productId: p._id,
          name: p.name?.en || p.name?.ar || '',
          partNumber: p.partNumber,
          price: p.price,
          currency: p.currency,
          image: p.images?.[0]?.url || ''
        }))
      };
      
      // Update cache (fast access)
      await this.updateChatHistory(sessionId, [userMsg, assistantMsg]);
      
      // Persist to MongoDB (durable storage)
      await this.persistToDatabase(sessionId, userId, [userMsg, assistantMsg], context);
      
      return {
        message: response,
        sessionId,
        timestamp: new Date(),
        suggestedProducts: suggestedProducts.map(p => ({
          id: p._id,
          name: p.name,
          partNumber: p.partNumber,
          price: p.price,
          currency: p.currency,
          image: p.images?.[0]?.url || '',
          stock: p.stock,
          link: `/products/${p._id}`
        }))
      };
      
    } catch (error) {
      console.error('[Chatbot] Error processing message:', error);
      
      return {
        message: this.getFallbackResponse(message),
        sessionId,
        timestamp: new Date(),
        suggestedProducts: [],
        error: true
      };
    }
  }
  
  /**
   * Find products mentioned in the AI response or related to user query
   */
  async findMentionedProducts(aiResponse, userMessage, userVehicles = []) {
    try {
      const combinedText = `${userMessage} ${aiResponse}`.toLowerCase();
      
      // Part type keywords to search for
      const partKeywords = [
        'brake pad', 'brake disc', 'oil filter', 'air filter', 'spark plug',
        'headlight', 'tail light', 'bumper', 'mirror', 'battery', 'alternator',
        'starter', 'radiator', 'thermostat', 'water pump', 'fuel pump',
        'timing belt', 'serpentine belt', 'shock absorber', 'strut',
        'control arm', 'tie rod', 'ball joint', 'wheel bearing',
        'clutch', 'transmission', 'engine mount', 'exhaust', 'muffler',
        'wiper', 'cabin filter', 'fuel filter', 'sensor', 'coil'
      ];
      
      // Find which part types are mentioned
      const mentionedParts = partKeywords.filter(part => combinedText.includes(part));
      
      if (mentionedParts.length === 0) return [];
      
      // Build search query
      let searchQuery = {
        isActive: true,
        $or: mentionedParts.map(part => ({
          $or: [
            { 'name.en': { $regex: part, $options: 'i' } },
            { 'searchKeywords.en': { $regex: part, $options: 'i' } }
          ]
        }))
      };
      
      // If user has vehicles, prefer compatible products
      if (userVehicles.length > 0) {
        const primaryVehicle = userVehicles.find(v => v.isPrimary) || userVehicles[0];
        if (primaryVehicle) {
          searchQuery['compatibility'] = {
            $elemMatch: {
              brand: primaryVehicle.brand,
              model: primaryVehicle.model,
              yearFrom: { $lte: primaryVehicle.year },
              yearTo: { $gte: primaryVehicle.year }
            }
          };
        }
      }
      
      // Also check for brand mentions in the text
      const brands = ['chery', 'geely', 'mg', 'haval', 'great wall', 'changan', 'byd'];
      const mentionedBrand = brands.find(b => combinedText.includes(b));
      if (mentionedBrand && !searchQuery['compatibility']) {
        searchQuery['compatibility.brand'] = new RegExp(mentionedBrand, 'i');
      }
      
      const products = await Product.find(searchQuery)
        .select('name partNumber price currency images stock compatibility')
        .sort({ purchaseCount: -1, averageRating: -1 })
        .limit(3)
        .lean();
      
      return products;
    } catch (error) {
      console.error('[Chatbot] Error finding mentioned products:', error);
      return [];
    }
  }
  
  /**
   * Persist chat messages to MongoDB for permanent storage
   */
  async persistToDatabase(sessionId, userId, newMessages, context = {}) {
    try {
      let session = await ChatSession.findOne({ sessionId });
      
      if (!session) {
        // Create new session
        session = new ChatSession({
          sessionId,
          user: userId || null,
          messages: newMessages,
          context: {
            productId: context.productId || null,
            currentPage: context.currentPage || ''
          },
          lastMessageAt: new Date()
        });
        session.generateTitle();
      } else {
        // Append messages to existing session
        session.messages.push(...newMessages);
        session.lastMessageAt = new Date();
        
        // Update user if not set and now available
        if (!session.user && userId) {
          session.user = userId;
        }
        
        // Update context if provided
        if (context.productId) {
          session.context.productId = context.productId;
        }
        
        // Generate title if still default
        if (session.title === 'New Conversation') {
          session.generateTitle();
        }
      }
      
      await session.save();
      console.log(`[Chatbot] Persisted messages to DB for session: ${sessionId}`);
    } catch (error) {
      console.error('[Chatbot] Error persisting to database:', error);
    }
  }
  
  /**
   * Get user's chat sessions list (for history panel)
   */
  async getUserSessions(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const sessions = await ChatSession.find({ 
        user: userId,
        isActive: true 
      })
        .select('sessionId title lastMessageAt messages createdAt')
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      
      const total = await ChatSession.countDocuments({ 
        user: userId,
        isActive: true 
      });
      
      // Return sessions with message count and last message preview
      return {
        sessions: sessions.map(s => ({
          sessionId: s.sessionId,
          title: s.title,
          lastMessageAt: s.lastMessageAt,
          createdAt: s.createdAt,
          messageCount: s.messages.length,
          lastMessage: s.messages.length > 0 
            ? s.messages[s.messages.length - 1].content.substring(0, 80) + '...'
            : ''
        })),
        total,
        page,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('[Chatbot] Error getting user sessions:', error);
      return { sessions: [], total: 0, page: 1, pages: 0 };
    }
  }
  
  /**
   * Get full messages for a specific session
   */
  async getSessionMessages(sessionId, userId = null) {
    try {
      const query = { sessionId };
      if (userId) query.user = userId;
      
      const session = await ChatSession.findOne(query)
        .populate('messages.suggestedProducts.productId', 'name partNumber price currency images stock')
        .lean();
      
      if (!session) return null;
      
      return {
        sessionId: session.sessionId,
        title: session.title,
        messages: session.messages.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
          suggestedProducts: (m.suggestedProducts || []).map(p => ({
            id: p.productId?._id || p.productId,
            name: p.name,
            partNumber: p.partNumber,
            price: p.price,
            currency: p.currency,
            image: p.image,
            link: `/products/${p.productId?._id || p.productId}`
          }))
        })),
        createdAt: session.createdAt,
        lastMessageAt: session.lastMessageAt
      };
    } catch (error) {
      console.error('[Chatbot] Error getting session messages:', error);
      return null;
    }
  }
  
  /**
   * Delete a chat session (soft delete)
   */
  async deleteSession(sessionId, userId) {
    try {
      const result = await ChatSession.findOneAndUpdate(
        { sessionId, user: userId },
        { isActive: false },
        { new: true }
      );
      return !!result;
    } catch (error) {
      console.error('[Chatbot] Error deleting session:', error);
      return false;
    }
  }
  
  /**
   * Get chat history from cache
   */
  async getChatHistory(sessionId) {
    try {
      const cacheKey = cacheKeys.chatContext(sessionId);
      const history = await cacheHelper.get(cacheKey);
      
      // If not in cache, try to load from DB
      if (!history) {
        const session = await ChatSession.findOne({ sessionId }).lean();
        if (session && session.messages.length > 0) {
          const dbHistory = session.messages.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp
          }));
          // Re-cache the history
          await cacheHelper.set(cacheKey, dbHistory, 3600);
          return dbHistory;
        }
        return [];
      }
      
      return history;
    } catch (error) {
      console.error('[Chatbot] Error getting chat history:', error);
      return [];
    }
  }
  
  /**
   * Update chat history in cache
   */
  async updateChatHistory(sessionId, newMessages) {
    try {
      const cacheKey = cacheKeys.chatContext(sessionId);
      const history = await this.getChatHistory(sessionId);
      
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
   */
  getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    const isArabic = /[\u0600-\u06FF]/.test(message);
    
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
    
    return isArabic
      ? 'عذراً، أواجه بعض الصعوبة في فهم سؤالك. هل يمكنك إعادة صياغته؟ أو يمكنك التواصل مع فريق الدعم للمساعدة.'
      : 'Sorry, I\'m having trouble understanding your question. Could you rephrase it? Or you can contact our support team for assistance.';
  }
  
  /**
   * Get quick action suggestions
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

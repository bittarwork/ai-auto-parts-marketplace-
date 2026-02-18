import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ClockIcon,
  TrashIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  ShoppingCartIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import chatbotService from '../../services/chatbotService';
import authService from '../../services/authService';
import clsx from 'clsx';

/**
 * ★★ CHAT WIDGET ★★
 * Floating AI chatbot with:
 * - Persistent chat history (saved to DB)
 * - Product link recommendations
 * - Quick actions and product context awareness
 */

// View modes for the chat widget
const VIEW = {
  CHAT: 'chat',
  HISTORY: 'history',
  LOADING_SESSION: 'loading_session'
};

export default function ChatWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(() => chatbotService.generateSessionId());
  const [quickActions, setQuickActions] = useState([]);
  const [showQuickActions, setShowQuickActions] = useState(true);
  
  // History-related state
  const [view, setView] = useState(VIEW.CHAT);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Track auth status
  useEffect(() => {
    const checkAuth = () => setIsLoggedIn(authService.isAuthenticated());
    checkAuth();
    window.addEventListener('auth:changed', checkAuth);
    return () => window.removeEventListener('auth:changed', checkAuth);
  }, []);

  const getProductContext = () => {
    const match = location.pathname.match(/^\/products\/([a-f0-9]{24})$/i);
    return match ? { productId: match[1], currentPage: 'product_details' } : { currentPage: location.pathname };
  };
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    if (isOpen && inputRef.current && view === VIEW.CHAT) {
      inputRef.current.focus();
    }
  }, [isOpen, view]);
  
  // Welcome message + load quick actions
  useEffect(() => {
    if (isOpen && messages.length === 0 && view === VIEW.CHAT) {
      setMessages([{
        id: Date.now(),
        role: 'assistant',
        content: "Hello! I'm your AI assistant. How can I help you find the right auto parts today?",
        timestamp: new Date(),
        suggestedProducts: []
      }]);
      loadQuickActions();
    }
  }, [isOpen]);
  
  const loadQuickActions = async () => {
    try {
      const res = await chatbotService.getQuickActions('en');
      if (res.success && res.data) {
        setQuickActions(res.data);
      }
    } catch {
      setQuickActions([
        { label: 'Find parts for my car', message: 'Help me find parts for my car' },
        { label: 'Check compatibility', message: 'I want to check if a part is compatible with my vehicle' },
        { label: 'Shipping info', message: 'What are the shipping options?' },
        { label: 'Return policy', message: 'What is your return policy?' }
      ]);
    }
  };

  const sendMessage = async (messageText) => {
    const text = messageText || inputMessage;
    if (!text.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      suggestedProducts: []
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setShowQuickActions(false);
    
    try {
      const context = getProductContext();
      const response = await chatbotService.sendMessage(text, sessionId, context);
      
      if (response.success) {
        const botMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date(),
          suggestedProducts: response.data.suggestedProducts || []
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: "Sorry, I'm having trouble processing your message. Please try again or contact our support team.",
        timestamp: new Date(),
        isError: true,
        suggestedProducts: []
      }]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const clearChat = async () => {
    try {
      await chatbotService.clearHistory(sessionId);
      const newId = chatbotService.generateSessionId();
      setSessionId(newId);
      setMessages([{
        id: Date.now(),
        role: 'assistant',
        content: "Chat cleared. How can I help you?",
        timestamp: new Date(),
        suggestedProducts: []
      }]);
      setShowQuickActions(true);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  // Load chat history sessions
  const loadSessions = useCallback(async () => {
    if (!isLoggedIn) return;
    setSessionsLoading(true);
    try {
      const res = await chatbotService.getSessions(1, 20);
      if (res.success && res.data) {
        setSessions(res.data.sessions || []);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setSessionsLoading(false);
    }
  }, [isLoggedIn]);

  // Load a previous session
  const loadSession = async (targetSessionId) => {
    setView(VIEW.LOADING_SESSION);
    try {
      const res = await chatbotService.getSessionMessages(targetSessionId);
      if (res.success && res.data) {
        setSessionId(targetSessionId);
        setMessages(res.data.messages.map((m, i) => ({
          id: Date.now() + i,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
          suggestedProducts: m.suggestedProducts || []
        })));
        setShowQuickActions(false);
        setView(VIEW.CHAT);
      }
    } catch (error) {
      console.error('Error loading session:', error);
      setView(VIEW.HISTORY);
    }
  };

  // Delete a saved session
  const handleDeleteSession = async (targetSessionId, e) => {
    e.stopPropagation();
    try {
      await chatbotService.deleteSession(targetSessionId);
      setSessions(prev => prev.filter(s => s.sessionId !== targetSessionId));
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  // Start a new conversation
  const startNewChat = () => {
    const newId = chatbotService.generateSessionId();
    setSessionId(newId);
    setMessages([{
      id: Date.now(),
      role: 'assistant',
      content: "Hello! I'm your AI assistant. How can I help you find the right auto parts today?",
      timestamp: new Date(),
      suggestedProducts: []
    }]);
    setShowQuickActions(true);
    setView(VIEW.CHAT);
  };

  // Open history panel
  const openHistory = () => {
    setView(VIEW.HISTORY);
    loadSessions();
  };
  
  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-soft-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
          aria-label="Open chat"
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-success-500 rounded-full border-2 border-white dark:border-dark-bg animate-pulse"></span>
        </button>
      )}
      
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border flex flex-col animate-slide-up">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              {view === VIEW.HISTORY ? (
                <button 
                  onClick={() => setView(VIEW.CHAT)}
                  className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
              ) : (
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <h3 className="text-white font-semibold">
                  {view === VIEW.HISTORY ? 'Chat History' : 'AI Assistant'}
                </h3>
                <p className="text-primary-100 text-xs">
                  {view === VIEW.HISTORY ? 'Your saved conversations' : 'Online • Instant replies'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {/* History Button - only show if logged in and in chat view */}
              {isLoggedIn && view === VIEW.CHAT && (
                <button
                  onClick={openHistory}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Chat history"
                  title="Chat History"
                >
                  <ClockIcon className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close chat"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* ==================== HISTORY VIEW ==================== */}
          {view === VIEW.HISTORY && (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* New Chat Button */}
              <button
                onClick={startNewChat}
                className="w-full p-4 border-b border-gray-100 dark:border-dark-border flex items-center space-x-3 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary-600 dark:text-primary-400">Start New Conversation</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Begin a fresh chat</p>
                </div>
              </button>

              {sessionsLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading conversations...</p>
                </div>
              ) : sessions.length === 0 ? (
                <div className="p-8 text-center">
                  <ClockIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No saved conversations yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Your chat history will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-dark-border">
                  {sessions.map((session) => (
                    <div
                      key={session.sessionId}
                      onClick={() => loadSession(session.sessionId)}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary cursor-pointer transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {session.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {session.lastMessage}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {new Date(session.lastMessageAt).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                            <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {session.messageCount} messages
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <button
                            onClick={(e) => handleDeleteSession(session.sessionId, e)}
                            className="p-1.5 text-gray-400 hover:text-error-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-error-50 dark:hover:bg-error-900/20"
                            title="Delete conversation"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                          <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* ==================== LOADING SESSION VIEW ==================== */}
          {view === VIEW.LOADING_SESSION && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading conversation...</p>
              </div>
            </div>
          )}
          
          {/* ==================== CHAT VIEW ==================== */}
          {view === VIEW.CHAT && (
            <>
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((message) => (
                  <div key={message.id}>
                    {/* Message Bubble */}
                    <div
                      className={clsx(
                        "flex",
                        message.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={clsx(
                          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                          message.role === 'user'
                            ? "bg-primary-600 text-white rounded-br-sm"
                            : message.isError
                            ? "bg-error-50 dark:bg-error-900/20 text-error-800 dark:text-error-400 rounded-bl-sm"
                            : "bg-gray-100 dark:bg-dark-bg-tertiary text-gray-900 dark:text-white rounded-bl-sm"
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        <p className={clsx(
                          "text-xs mt-1",
                          message.role === 'user' 
                            ? "text-primary-100"
                            : "text-gray-500 dark:text-gray-400"
                        )}>
                          {new Date(message.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Product Link Cards */}
                    {message.suggestedProducts && message.suggestedProducts.length > 0 && (
                      <div className="mt-2 ml-2 space-y-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                          <CubeIcon className="w-3.5 h-3.5" />
                          <span>Related products:</span>
                        </p>
                        {message.suggestedProducts.map((product, idx) => (
                          <Link
                            key={idx}
                            to={product.link}
                            onClick={() => setIsOpen(false)}
                            className="block p-3 bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all group"
                          >
                            <div className="flex items-center space-x-3">
                              {product.image ? (
                                <img 
                                  src={product.image} 
                                  alt={product.name?.en || product.name}
                                  className="w-12 h-12 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-100 dark:bg-dark-bg-tertiary rounded-lg flex items-center justify-center flex-shrink-0">
                                  <CubeIcon className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                  {product.name?.en || product.name}
                                </p>
                                {product.partNumber && (
                                  <p className="text-xs text-gray-400 dark:text-gray-500">
                                    #{product.partNumber}
                                  </p>
                                )}
                                <div className="flex items-center justify-between mt-1">
                                  <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                    {product.price} {product.currency || 'EUR'}
                                  </p>
                                  {product.stock !== undefined && (
                                    <span className={clsx(
                                      "text-xs px-1.5 py-0.5 rounded-full",
                                      product.stock > 0 
                                        ? "bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-400"
                                        : "bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-400"
                                    )}>
                                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Quick Actions */}
                {showQuickActions && quickActions.length > 0 && messages.length <= 1 && (
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => sendMessage(action.message || action.label || action)}
                        className="px-3 py-1.5 text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full border border-primary-200 dark:border-primary-800/40 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                      >
                        {action.label || action}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-dark-bg-tertiary rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex space-x-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 dark:border-dark-border">
                <div className="flex items-end space-x-2">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    rows={1}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none max-h-32"
                    style={{ minHeight: '40px' }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!inputMessage.trim() || isTyping}
                    className="p-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    aria-label="Send message"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Bottom Actions */}
                {messages.length > 1 && (
                  <div className="flex items-center justify-between mt-2">
                    <button
                      onClick={clearChat}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      Clear conversation
                    </button>
                    {isLoggedIn && (
                      <span className="text-xs text-success-500 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 bg-success-500 rounded-full"></span>
                        <span>Auto-saved</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

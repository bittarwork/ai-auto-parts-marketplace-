import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import chatbotService from '../../services/chatbotService';
import Button from '../common/Button';
import clsx from 'clsx';

/**
 * ★★ CHAT WIDGET ★★
 * Floating AI chatbot with quick actions and product context awareness
 */
export default function ChatWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => chatbotService.generateSessionId());
  const [quickActions, setQuickActions] = useState([]);
  const [showQuickActions, setShowQuickActions] = useState(true);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Extract product ID from URL if on product details page
  const getProductContext = () => {
    const match = location.pathname.match(/^\/products\/([a-f0-9]{24})$/i);
    return match ? { productId: match[1], currentPage: 'product_details' } : { currentPage: location.pathname };
  };
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  // Welcome message + load quick actions
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: Date.now(),
        role: 'assistant',
        content: "Hello! I'm your AI assistant. How can I help you find the right auto parts today?",
        timestamp: new Date()
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
      // Fallback quick actions
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
      timestamp: new Date()
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
          timestamp: new Date()
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
        isError: true
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
      setMessages([{
        id: Date.now(),
        role: 'assistant',
        content: "Chat cleared. How can I help you?",
        timestamp: new Date()
      }]);
      setShowQuickActions(true);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };
  
  return (
    <>
      {/* Chat Button (Floating) */}
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
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">AI Assistant</h3>
                <p className="text-primary-100 text-xs">Online • Instant replies</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((message) => (
              <div
                key={message.id}
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
            
            {/* Clear Chat */}
            {messages.length > 1 && (
              <button
                onClick={clearChat}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mt-2"
              >
                Clear conversation
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

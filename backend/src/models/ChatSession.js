const mongoose = require('mongoose');

// Individual message sub-schema
const chatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  // Products referenced in this message (links provided by AI)
  suggestedProducts: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name: String,
    partNumber: String,
    price: Number,
    currency: String,
    image: String
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Chat session schema - stores full conversation history
const chatSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    default: null
  },
  // Auto-generated title from first user message
  title: {
    type: String,
    default: 'New Conversation'
  },
  messages: [chatMessageSchema],
  // Track conversation context
  context: {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null
    },
    currentPage: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatSessionSchema.index({ user: 1, lastMessageAt: -1 });
chatSessionSchema.index({ sessionId: 1, user: 1 });
chatSessionSchema.index({ createdAt: -1 });

// Auto-generate title from first user message
chatSessionSchema.methods.generateTitle = function() {
  const firstUserMsg = this.messages.find(m => m.role === 'user');
  if (firstUserMsg) {
    const title = firstUserMsg.content.substring(0, 60);
    this.title = title.length < firstUserMsg.content.length ? title + '...' : title;
  }
  return this.title;
};

module.exports = mongoose.model('ChatSession', chatSessionSchema);

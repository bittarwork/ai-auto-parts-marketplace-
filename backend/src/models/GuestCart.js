const mongoose = require('mongoose');

/**
 * Guest Cart - Session-based cart for non-logged-in users
 * Stored for 30 days, merged to user cart on login
 */
const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  priceAtAdd: {
    type: Number,
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const guestCartSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  items: [cartItemSchema],
  lastActivity: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days - TTL index defined below
  }
}, {
  timestamps: true
});

// Update lastActivity and expiresAt on any modification
// Use async (no next) - Mongoose 7+ handles async middleware
guestCartSchema.pre('save', async function() {
  this.lastActivity = new Date();
  this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Refresh to 30 days
});

// TTL index for automatic cleanup of expired carts
guestCartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('GuestCart', guestCartSchema);

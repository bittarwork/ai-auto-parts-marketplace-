const mongoose = require('mongoose');

/**
 * ProductNotification - users who want to be notified when out-of-stock product is back
 */
const productNotificationSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  notifiedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

productNotificationSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('ProductNotification', productNotificationSchema);

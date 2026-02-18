const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  // Snapshot of product details at time of order
  productSnapshot: {
    name: {
      ar: String,
      en: String
    },
    partNumber: String,
    images: [{
      url: String
    }]
  }
});

const orderSchema = new mongoose.Schema({
  // Order number (human-readable)
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  // Customer
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Order items
  items: [orderItemSchema],
  
  // Pricing
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  
  shipping: {
    type: Number,
    default: 0,
    min: 0
  },
  
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  total: {
    type: Number,
    required: true,
    min: 0
  },
  
  currency: {
    type: String,
    enum: ['SAR', 'EUR'],
    default: 'SAR'
  },
  
  // Shipping address
  shippingAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    district: String,
    postalCode: String,
    country: String
  },
  
  // Payment information
  paymentMethod: {
    type: String,
    enum: ['card', 'cash_on_delivery', 'bank_transfer'],
    required: true
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  
  paymentDetails: {
    transactionId: String,
    gateway: String,
    paidAt: Date
  },
  
  // Order status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  // Status history
  statusHistory: [{
    status: String,
    date: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Tracking
  trackingNumber: String,
  shippingCarrier: String,
  
  // Delivery dates
  estimatedDelivery: Date,
  actualDelivery: Date,
  
  // Notes
  customerNotes: String,
  adminNotes: String,
  
  // Cancellation
  cancellationReason: String,
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  
}, {
  timestamps: true
});

// Indexes for order searches - defined once using schema.index()
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1, paymentStatus: 1 });

// Pre-save middleware to generate order number (async - no next in Mongoose)
orderSchema.pre('save', async function() {
  if (!this.orderNumber) {
    // Generate order number: ORD-YYYYMMDD-XXXX
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      }
    });
    this.orderNumber = `ORD-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
});

// Method to update status
orderSchema.methods.updateStatus = function(newStatus, note = '', updatedBy = null) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    date: new Date(),
    note,
    updatedBy
  });
  return this.save();
};

// Virtual for total items
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

module.exports = mongoose.model('Order', orderSchema);

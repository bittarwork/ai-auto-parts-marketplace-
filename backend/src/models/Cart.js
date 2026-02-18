const mongoose = require('mongoose');

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
  // Store price at time of adding to cart
  priceAtAdd: {
    type: Number,
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  items: [cartItemSchema],
  
  // Last activity for cleanup of abandoned carts
  lastActivity: {
    type: Date,
    default: Date.now
  }
  
}, {
  timestamps: true
});

// Update lastActivity on any modification (async for Mongoose compatibility)
cartSchema.pre('save', async function() {
  this.lastActivity = new Date();
});

// Virtual for total items
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Virtual for subtotal (using current prices)
cartSchema.virtual('subtotal').get(function() {
  return this.items.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0);
});

// Method to add item to cart
cartSchema.methods.addItem = async function(productId, quantity, price) {
  const existingItem = this.items.find(item => 
    item.product.toString() === productId.toString()
  );
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({
      product: productId,
      quantity,
      priceAtAdd: price
    });
  }
  
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = async function(productId, quantity) {
  const item = this.items.find(item => 
    item.product.toString() === productId.toString()
  );
  
  if (item) {
    if (quantity <= 0) {
      this.items = this.items.filter(item => 
        item.product.toString() !== productId.toString()
      );
    } else {
      item.quantity = quantity;
    }
  }
  
  return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = async function(productId) {
  this.items = this.items.filter(item => 
    item.product.toString() !== productId.toString()
  );
  
  return this.save();
};

// Method to clear cart
cartSchema.methods.clear = async function() {
  this.items = [];
  return this.save();
};

// Static method to get or create cart for user
cartSchema.statics.getOrCreate = async function(userId) {
  let cart = await this.findOne({ user: userId }).populate('items.product');
  
  if (!cart) {
    cart = await this.create({ user: userId, items: [] });
    cart = await cart.populate('items.product');
  }
  
  return cart;
};

module.exports = mongoose.model('Cart', cartSchema);

const mongoose = require('mongoose');

/**
 * Settings Model
 * Key-value store for site-wide configuration
 */
const settingsSchema = new mongoose.Schema({
  // General settings
  siteName: {
    type: String,
    default: 'Auto Parts Marketplace'
  },
  contactEmail: {
    type: String,
    default: 'admin@autoparts.com'
  },
  currency: {
    type: String,
    enum: ['EUR', 'SYP'],
    default: 'EUR'
  },
  defaultLanguage: {
    type: String,
    enum: ['en', 'ar'],
    default: 'en'
  },

  // Shipping settings
  shippingFlatRate: {
    type: Number,
    default: 10
  },
  freeShippingThreshold: {
    type: Number,
    default: 100
  },

  // Tax settings
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  // Notification settings
  lowStockThreshold: {
    type: Number,
    default: 5
  },
  notifyOnNewOrder: {
    type: Boolean,
    default: true
  },
  notifyOnLowStock: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);

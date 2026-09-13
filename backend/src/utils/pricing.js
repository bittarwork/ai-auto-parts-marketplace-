const Settings = require('../models/Settings');

/**
 * Load store pricing rules from Settings (tax, shipping, currency).
 */
async function getPricingSettings() {
  const settings = await Settings.getSettings();
  const taxRate = Number(settings.taxRate || 0) / 100;
  const shippingFlatRate = Number(settings.shippingFlatRate || 0);
  const freeShippingThreshold = Number(settings.freeShippingThreshold || 0);

  return {
    taxRate,
    shippingFlatRate,
    freeShippingThreshold,
    currency: settings.currency || 'EUR'
  };
}

/**
 * Build cart/order totals from a subtotal and store settings.
 */
function calculateTotals(subtotal, pricing) {
  const tax = Math.round(subtotal * pricing.taxRate * 100) / 100;
  const shipping = subtotal >= pricing.freeShippingThreshold ? 0 : pricing.shippingFlatRate;
  const total = Math.round((subtotal + tax + shipping) * 100) / 100;

  return {
    subtotal,
    tax,
    shipping,
    total,
    currency: pricing.currency
  };
}

module.exports = {
  getPricingSettings,
  calculateTotals
};

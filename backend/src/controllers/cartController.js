const Cart = require('../models/Cart');
const GuestCart = require('../models/GuestCart');
const Product = require('../models/Product');

/** Helper: Calculate cart totals from items */
function calculateCartTotals(items) {
  let subtotal = 0, totalItems = 0;
  const validItems = items.filter(item => {
    if (!item.product || !item.product.isActive || item.product.stock === 0) return false;
    const price = item.product.discount ? item.product.price * (1 - item.product.discount / 100) : item.product.price;
    subtotal += price * item.quantity;
    totalItems += item.quantity;
    item.itemTotal = price * item.quantity;
    item.unitPrice = price;
    return true;
  });
  return { validItems, subtotal, totalItems };
}

/**
 * Get cart - supports both logged-in user and guest session (30 days)
 * GET /api/cart
 */
exports.getCart = async (req, res) => {
  try {
    let cartData = null;

    if (req.user) {
      // Logged-in user: use Cart model
      let cart = await Cart.findOne({ user: req.user._id })
        .populate({ path: 'items.product', select: 'name partNumber price images stock isActive discount' })
        .lean();
      if (!cart) cart = { items: [] };
      cartData = cart;
    } else {
      // Guest: use GuestCart with sessionId
      const sessionId = req.headers['x-cart-session'] || req.query.sessionId;
      if (!sessionId) {
        return res.json({
          success: true,
          data: { cart: { items: [] }, summary: { subtotal: 0, totalItems: 0, tax: 0, total: 0 } }
        });
      }
      let guestCart = await GuestCart.findOne({ sessionId })
        .populate({ path: 'items.product', select: 'name partNumber price images stock isActive discount' })
        .lean();
      if (!guestCart) guestCart = { items: [] };
      cartData = guestCart;
    }

    const { validItems, subtotal, totalItems } = calculateCartTotals(cartData.items || []);

    res.json({
      success: true,
      data: {
        cart: { ...cartData, items: validItems },
        summary: {
          subtotal,
          totalItems,
          tax: subtotal * 0.15,
          total: subtotal * 1.15
        }
      }
    });
  } catch (error) {
    console.error('[Cart] getCart error:', error);
    res.status(500).json({ success: false, message: 'Error fetching cart' });
  }
};

/**
 * Add item to cart - works for both user and guest
 * POST /api/cart/items
 */
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, sessionId } = req.body;
    const cartSessionId = sessionId || req.headers['x-cart-session'];

    const product = await Product.findById(productId);
    if (!product || !product.isActive) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.stock === 0) return res.status(400).json({ success: false, message: 'Product is out of stock' });
    if (quantity > product.stock) return res.status(400).json({ success: false, message: `Only ${product.stock} items available` });

    if (req.user) {
      let cart = await Cart.findOne({ user: req.user._id });
      if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
      const idx = cart.items.findIndex(i => i.product.toString() === productId);
      if (idx > -1) {
        const newQty = cart.items[idx].quantity + quantity;
        if (newQty > product.stock) return res.status(400).json({ success: false, message: `Only ${product.stock} available` });
        cart.items[idx].quantity = newQty;
      } else {
        cart.items.push({ product: productId, quantity, priceAtAdd: product.price });
      }
      await cart.save();
      await cart.populate('items.product', 'name partNumber price images stock');
      return res.json({ success: true, message: 'Added to cart', data: cart });
    }

    // Guest cart
    if (!cartSessionId) return res.status(400).json({ success: false, message: 'Session ID required for guest cart' });
    let guestCart = await GuestCart.findOne({ sessionId: cartSessionId });
    if (!guestCart) guestCart = await GuestCart.create({ sessionId: cartSessionId, items: [] });
    const idx = guestCart.items.findIndex(i => i.product.toString() === productId);
    if (idx > -1) {
      const newQty = guestCart.items[idx].quantity + quantity;
      if (newQty > product.stock) return res.status(400).json({ success: false, message: `Only ${product.stock} available` });
      guestCart.items[idx].quantity = newQty;
    } else {
      guestCart.items.push({ product: productId, quantity, priceAtAdd: product.price });
    }
    await guestCart.save();
    await guestCart.populate('items.product', 'name partNumber price images stock');
    return res.json({ success: true, message: 'Added to cart', data: guestCart });
  } catch (error) {
    console.error('[Cart] addToCart error:', error);
    res.status(500).json({ success: false, message: 'Error adding to cart' });
  }
};

/**
 * Update cart item
 * PUT /api/cart/items/:productId
 */
exports.updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const cartSessionId = req.headers['x-cart-session'] || req.body.sessionId;
    if (!quantity || quantity < 1) return res.status(400).json({ success: false, message: 'Invalid quantity' });

    const product = await Product.findById(productId);
    if (!product || !product.isActive) return res.status(404).json({ success: false, message: 'Product not found' });
    if (quantity > product.stock) return res.status(400).json({ success: false, message: `Only ${product.stock} available` });

    if (req.user) {
      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
      const idx = cart.items.findIndex(i => i.product.toString() === productId);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Item not in cart' });
      cart.items[idx].quantity = quantity;
      cart.items[idx].priceAtAdd = product.price;
      await cart.save();
      await cart.populate('items.product', 'name partNumber price images stock');
      return res.json({ success: true, message: 'Cart updated', data: cart });
    }

    if (!cartSessionId) return res.status(400).json({ success: false, message: 'Session ID required' });
    const guestCart = await GuestCart.findOne({ sessionId: cartSessionId });
    if (!guestCart) return res.status(404).json({ success: false, message: 'Cart not found' });
    const idx = guestCart.items.findIndex(i => i.product.toString() === productId);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Item not in cart' });
    guestCart.items[idx].quantity = quantity;
    guestCart.items[idx].priceAtAdd = product.price;
    await guestCart.save();
    await guestCart.populate('items.product', 'name partNumber price images stock');
    return res.json({ success: true, message: 'Cart updated', data: guestCart });
  } catch (error) {
    console.error('[Cart] updateCartItem error:', error);
    res.status(500).json({ success: false, message: 'Error updating cart' });
  }
};

/**
 * Remove item from cart
 * DELETE /api/cart/items/:productId
 */
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const cartSessionId = req.headers['x-cart-session'];

    if (req.user) {
      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
      cart.items = cart.items.filter(i => i.product.toString() !== productId);
      await cart.save();
      await cart.populate('items.product', 'name partNumber price images stock');
      return res.json({ success: true, message: 'Item removed', data: cart });
    }

    if (!cartSessionId) return res.status(400).json({ success: false, message: 'Session ID required' });
    const guestCart = await GuestCart.findOne({ sessionId: cartSessionId });
    if (!guestCart) return res.status(404).json({ success: false, message: 'Cart not found' });
    guestCart.items = guestCart.items.filter(i => i.product.toString() !== productId);
    await guestCart.save();
    await guestCart.populate('items.product', 'name partNumber price images stock');
    return res.json({ success: true, message: 'Item removed', data: guestCart });
  } catch (error) {
    console.error('[Cart] removeFromCart error:', error);
    res.status(500).json({ success: false, message: 'Error removing item' });
  }
};

/**
 * Clear cart
 * DELETE /api/cart
 */
exports.clearCart = async (req, res) => {
  try {
    const cartSessionId = req.headers['x-cart-session'];

    if (req.user) {
      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart) return res.json({ success: true, message: 'Cart cleared', data: { items: [] } });
      cart.items = [];
      await cart.save();
      return res.json({ success: true, message: 'Cart cleared', data: cart });
    }

    if (!cartSessionId) return res.status(400).json({ success: false, message: 'Session ID required' });
    const guestCart = await GuestCart.findOne({ sessionId: cartSessionId });
    if (guestCart) {
      guestCart.items = [];
      await guestCart.save();
    }
    return res.json({ success: true, message: 'Cart cleared', data: { items: [] } });
  } catch (error) {
    console.error('[Cart] clearCart error:', error);
    res.status(500).json({ success: false, message: 'Error clearing cart' });
  }
};

/**
 * Get cart count - for user returns count, for guest requires sessionId
 * GET /api/cart/count
 */
exports.getCartCount = async (req, res) => {
  try {
    const cartSessionId = req.headers['x-cart-session'] || req.query.sessionId;

    if (req.user) {
      const cart = await Cart.findOne({ user: req.user._id }).lean();
      const count = cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0;
      return res.json({ success: true, data: { count } });
    }

    if (!cartSessionId) return res.json({ success: true, data: { count: 0 } });
    const guestCart = await GuestCart.findOne({ sessionId: cartSessionId }).lean();
    const count = guestCart?.items?.reduce((s, i) => s + i.quantity, 0) || 0;
    return res.json({ success: true, data: { count } });
  } catch (error) {
    console.error('[Cart] getCartCount error:', error);
    res.status(500).json({ success: false, message: 'Error fetching cart count' });
  }
};

/**
 * Validate cart before checkout - REQUIRES LOGIN
 * POST /api/cart/validate
 */
exports.validateCart = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Login required to checkout' });

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name partNumber price stock isActive');
    if (!cart || cart.items.length === 0) return res.status(400).json({ success: false, message: 'Cart is empty' });

    const issues = [];
    for (const item of cart.items) {
      if (!item.product || !item.product.isActive) issues.push({ productId: item.product?._id, issue: 'Product no longer available' });
      else if (item.product.stock === 0) issues.push({ productId: item.product._id, productName: item.product.name, issue: 'Out of stock' });
      else if (item.quantity > item.product.stock) issues.push({ productId: item.product._id, productName: item.product.name, issue: `Only ${item.product.stock} available` });
      else if (item.priceAtAdd !== item.product.price) issues.push({ productId: item.product._id, productName: item.product.name, issue: 'Price changed' });
    }

    return res.json({
      success: true,
      data: { isValid: issues.length === 0, issues, validItems: cart.items.length - issues.length, totalItems: cart.items.length }
    });
  } catch (error) {
    console.error('[Cart] validateCart error:', error);
    res.status(500).json({ success: false, message: 'Error validating cart' });
  }
};

/**
 * Merge guest cart into user cart (call on login)
 */
exports.mergeGuestCart = async (userId, sessionId) => {
  if (!sessionId) return;
  const guestCart = await GuestCart.findOne({ sessionId });
  if (!guestCart || guestCart.items.length === 0) return;

  let userCart = await Cart.findOne({ user: userId });
  if (!userCart) userCart = await Cart.create({ user: userId, items: [] });

  for (const item of guestCart.items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive || product.stock === 0) continue;
    const idx = userCart.items.findIndex(i => i.product.toString() === item.product.toString());
    if (idx > -1) {
      userCart.items[idx].quantity = Math.min(userCart.items[idx].quantity + item.quantity, product.stock);
    } else {
      userCart.items.push({ product: item.product, quantity: Math.min(item.quantity, product.stock), priceAtAdd: product.price });
    }
  }
  await userCart.save();
  await GuestCart.deleteOne({ sessionId });
}

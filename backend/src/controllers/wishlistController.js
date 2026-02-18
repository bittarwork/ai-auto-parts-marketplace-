const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

/**
 * Get user's wishlist
 * GET /api/wishlist
 */
exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products', 'name partNumber price images stock isActive')
      .lean();
    if (!wishlist) wishlist = { products: [] };
    const products = (wishlist.products || []).filter(p => p && p.isActive);
    return res.json({ success: true, data: products });
  } catch (error) {
    console.error('[Wishlist] getWishlist error:', error);
    res.status(500).json({ success: false, message: 'Error fetching wishlist' });
  }
};

/**
 * Add product to wishlist
 * POST /api/wishlist/:productId
 */
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product || !product.isActive) return res.status(404).json({ success: false, message: 'Product not found' });

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    if (wishlist.products.some(p => p.toString() === productId)) {
      return res.json({ success: true, message: 'Already in wishlist', data: wishlist });
    }
    wishlist.products.push(productId);
    await wishlist.save();
    await wishlist.populate('products', 'name partNumber price images stock');
    return res.json({ success: true, message: 'Added to wishlist', data: wishlist });
  } catch (error) {
    console.error('[Wishlist] addToWishlist error:', error);
    res.status(500).json({ success: false, message: 'Error adding to wishlist' });
  }
};

/**
 * Remove from wishlist
 * DELETE /api/wishlist/:productId
 */
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) return res.json({ success: true, message: 'Removed', data: { products: [] } });
    wishlist.products = wishlist.products.filter(p => p.toString() !== productId);
    await wishlist.save();
    await wishlist.populate('products', 'name partNumber price images stock');
    return res.json({ success: true, message: 'Removed from wishlist', data: wishlist });
  } catch (error) {
    console.error('[Wishlist] removeFromWishlist error:', error);
    res.status(500).json({ success: false, message: 'Error removing from wishlist' });
  }
};

/**
 * Check if product is in wishlist
 * GET /api/wishlist/check/:productId
 */
exports.checkWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const wishlist = await Wishlist.findOne({ user: req.user._id }).lean();
    const isInWishlist = wishlist?.products?.some(p => p.toString() === productId) || false;
    return res.json({ success: true, data: { isInWishlist } });
  } catch (error) {
    console.error('[Wishlist] check error:', error);
    res.status(500).json({ success: false, message: 'Error' });
  }
};

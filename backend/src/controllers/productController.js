const Product = require('../models/Product');
const ProductNotification = require('../models/ProductNotification');
const { cacheHelper, cacheKeys } = require('../config/redis');

/**
 * ★★★ PRODUCT CONTROLLER ★★★
 * Comprehensive product management with advanced features
 */

/**
 * Get all products with advanced filtering, sorting, and pagination
 * GET /api/products
 * @access Public
 */
exports.getAllProducts = async (req, res) => {
  try {
    const {
      // Pagination
      page = 1,
      limit = 20,
      
      // Search
      search,
      
      // Filters
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      featured,
      
      // Sorting
      sortBy = 'createdAt',
      sortOrder = 'desc',
      
      // Language
      language = 'en'
    } = req.query;
    
    // Build query object
    const query = {};
    
    // Search in name and description
    if (search) {
      query.$or = [
        { [`name.${language}`]: { $regex: search, $options: 'i' } },
        { [`description.${language}`]: { $regex: search, $options: 'i' } },
        { partNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    // Brand filter (within compatibility array)
    if (brand) {
      query['compatibility.brand'] = { $regex: brand, $options: 'i' };
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Stock filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }
    
    // Featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    // Ensure active products only
    query.isActive = true;
    
    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(query)
    ]);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;
    
    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: totalPages,
        hasNext: hasNextPage,
        hasPrev: hasPrevPage
      },
      filters: {
        search,
        category,
        brand,
        minPrice,
        maxPrice,
        inStock,
        featured,
        sortBy,
        sortOrder
      }
    });
    
  } catch (error) {
    console.error('[Product Controller] GetAll error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

/**
 * Get single product by ID
 * GET /api/products/:id
 * @access Public
 */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to get from cache first
    const cacheKey = cacheKeys.product(id);
    const cached = await cacheHelper.get(cacheKey);
    
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true
      });
    }
    
    // Fetch from database
    const product = await Product.findById(id)
      .populate('category', 'name slug description')
      .lean();
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (!product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not available'
      });
    }
    
    // Cache the result for 1 hour
    await cacheHelper.set(cacheKey, product, 3600);
    
    // Increment view count asynchronously
    Product.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).exec();
    
    res.json({
      success: true,
      data: product,
      cached: false
    });
    
  } catch (error) {
    console.error('[Product Controller] GetById error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

/**
 * Get product by slug
 * GET /api/products/slug/:slug
 * @access Public
 */
exports.getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const product = await Product.findOne({ slug, isActive: true })
      .populate('category', 'name slug description')
      .lean();
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Increment view count
    Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } }).exec();
    
    res.json({
      success: true,
      data: product
    });
    
  } catch (error) {
    console.error('[Product Controller] GetBySlug error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

/**
 * Create new product
 * POST /api/products
 * @access Private (Admin/Supplier)
 */
exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;
    
    // Add created by user
    productData.createdBy = req.user._id;
    
    // If supplier, automatically approve if they own the product
    if (req.user.role === 'supplier') {
      productData.supplier = req.user._id;
    }
    
    // Create product
    const product = await Product.create(productData);
    
    // Populate category
    await product.populate('category', 'name slug');
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
    
  } catch (error) {
    console.error('[Product Controller] Create error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product with this part number already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

/**
 * Update product
 * PUT /api/products/:id
 * @access Private (Admin/Supplier - own products)
 */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Find product
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check authorization
    // Admin can update any product
    // Supplier can only update their own products
    if (req.user.role === 'supplier' && product.supplier.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }
    
    // Prevent changing certain fields
    delete updates.createdBy;
    delete updates.supplier;
    delete updates.purchaseCount;
    delete updates.viewCount;
    
    // Update product
    Object.assign(product, updates);
    product.updatedAt = Date.now();
    
    await product.save();
    
    // Invalidate cache
    const cacheKey = cacheKeys.product(id);
    await cacheHelper.del(cacheKey);
    
    // Populate and return
    await product.populate('category', 'name slug');
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
    
  } catch (error) {
    console.error('[Product Controller] Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

/**
 * Delete product (soft delete)
 * DELETE /api/products/:id
 * @access Private (Admin only)
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Soft delete
    product.isActive = false;
    product.updatedAt = Date.now();
    await product.save();
    
    // Invalidate cache
    const cacheKey = cacheKeys.product(id);
    await cacheHelper.del(cacheKey);
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
    
  } catch (error) {
    console.error('[Product Controller] Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

/**
 * Get products by category
 * GET /api/products/category/:categoryId
 * @access Public
 */
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const query = {
      category: categoryId,
      isActive: true
    };
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('[Product Controller] GetByCategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

/**
 * Get featured products
 * GET /api/products/featured
 * @access Public
 */
exports.getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Try cache first
    const cacheKey = cacheKeys.featured();
    const cached = await cacheHelper.get(cacheKey);
    
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true
      });
    }
    
    const products = await Product.find({
      isFeatured: true,
      isActive: true,
      stock: { $gt: 0 }
    })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();
    
    // Cache for 30 minutes
    await cacheHelper.set(cacheKey, products, 1800);
    
    res.json({
      success: true,
      data: products,
      cached: false
    });
    
  } catch (error) {
    console.error('[Product Controller] GetFeatured error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured products',
      error: error.message
    });
  }
};

/**
 * Update product stock
 * PATCH /api/products/:id/stock
 * @access Private (Admin/Supplier)
 */
exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    
    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stock value'
      });
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check authorization for suppliers
    if (req.user.role === 'supplier' && product.supplier.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }
    
    product.stock = stock;
    product.updatedAt = Date.now();
    await product.save();
    
    // Invalidate cache
    await cacheHelper.del(cacheKeys.product(id));
    
    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: { stock: product.stock }
    });
    
  } catch (error) {
    console.error('[Product Controller] UpdateStock error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating stock',
      error: error.message
    });
  }
};

/**
 * Bulk update products
 * PUT /api/products/bulk
 * @access Private (Admin only)
 */
exports.bulkUpdate = async (req, res) => {
  try {
    const { productIds, updates } = req.body;
    
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs array is required'
      });
    }
    
    // Prevent updating sensitive fields
    const allowedUpdates = {
      isActive: updates.isActive,
      isFeatured: updates.isFeatured,
      price: updates.price,
      discount: updates.discount
    };
    
    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key => 
      allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );
    
    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: allowedUpdates }
    );
    
    // Clear cache for updated products
    await Promise.all(
      productIds.map(id => cacheHelper.del(cacheKeys.product(id)))
    );
    
    res.json({
      success: true,
      message: `${result.modifiedCount} products updated successfully`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount
      }
    });
    
  } catch (error) {
    console.error('[Product Controller] BulkUpdate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error bulk updating products',
      error: error.message
    });
  }
};

/**
 * Get product statistics
 * GET /api/products/stats
 * @access Private (Admin)
 */
exports.getProductStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
          averagePrice: { $avg: '$price' },
          totalStock: { $sum: '$stock' },
          outOfStock: {
            $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] }
          },
          lowStock: {
            $sum: { $cond: [{ $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', 10] }] }, 1, 0] }
          },
          featured: {
            $sum: { $cond: ['$isFeatured', 1, 0] }
          }
        }
      }
    ]);
    
    // Get top products by sales
    const topBySales = await Product.find({ isActive: true })
      .sort({ purchaseCount: -1 })
      .limit(10)
      .select('name partNumber purchaseCount price')
      .lean();
    
    // Get top products by views
    const topByViews = await Product.find({ isActive: true })
      .sort({ viewCount: -1 })
      .limit(10)
      .select('name partNumber viewCount price')
      .lean();
    
    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        topBySales,
        topByViews
      }
    });
    
  } catch (error) {
    console.error('[Product Controller] GetStats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product statistics',
      error: error.message
    });
  }
};

/**
 * Request notification when product is back in stock
 * POST /api/products/:id/notify
 * @access Private (login required)
 */
exports.addProductNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (product.stock > 0) {
      return res.json({
        success: true,
        message: 'Product is already in stock. You can add it to cart.'
      });
    }
    const existing = await ProductNotification.findOne({
      product: id,
      user: req.user._id,
      notifiedAt: null
    });
    if (existing) {
      return res.json({
        success: true,
        message: 'You are already subscribed to notifications for this product'
      });
    }
    await ProductNotification.create({
      product: id,
      user: req.user._id
    });
    res.status(201).json({
      success: true,
      message: 'You will be notified when this product is back in stock'
    });
  } catch (error) {
    console.error('[Product Controller] AddNotification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error subscribing to notification',
      error: error.message
    });
  }
};

module.exports = exports;

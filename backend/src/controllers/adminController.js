const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Settings = require('../models/Settings');
const ChatSession = require('../models/ChatSession');

/**
 * ★★★ ADMIN CONTROLLER ★★★
 * Handles all admin-specific operations
 */

// ============================================================
// DASHBOARD STATS
// ============================================================

/**
 * Get combined dashboard KPIs
 * GET /api/admin/dashboard
 */
exports.getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // Run all queries in parallel
    const [
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      newUsersToday,
      newOrdersToday,
      pendingOrdersCount,
      recentOrders,
      lowStockProducts,
      ordersByStatus
    ] = await Promise.all([
      // Total revenue from paid orders
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),

      // Total orders count
      Order.countDocuments(),

      // Total active users count
      User.countDocuments({ isActive: true, deletedAt: { $exists: false } }),

      // Total active products
      Product.countDocuments({ isActive: true }),

      // New users registered today
      User.countDocuments({ createdAt: { $gte: startOfToday } }),

      // New orders placed today
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),

      // Orders needing attention (pending, confirmed, processing - not cancelled)
      Order.countDocuments({
        status: { $in: ['pending', 'confirmed', 'processing'] }
      }),

      // Recent 10 orders
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('customer', 'name email')
        .select('orderNumber customer total status paymentStatus createdAt'),

      // Low stock products (stock <= threshold)
      Product.find({ stock: { $lte: 5 }, isActive: true })
        .sort({ stock: 1 })
        .limit(10)
        .select('name stock partNumber images'),

      // Orders grouped by status
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    // Revenue chart: last 30 days
    const revenueChart = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top 5 selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          revenue: 1,
          'product.name': 1,
          'product.images': { $slice: ['$product.images', 1] }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        kpis: {
          totalRevenue: totalRevenue[0]?.total || 0,
          totalOrders,
          totalUsers,
          totalProducts,
          newUsersToday,
          newOrdersToday,
          pendingOrdersCount
        },
        recentOrders,
        lowStockProducts,
        ordersByStatus,
        revenueChart,
        topProducts
      }
    });
  } catch (error) {
    console.error('getDashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// USER MANAGEMENT
// ============================================================

/**
 * Get all users with pagination and filters
 * GET /api/admin/users
 */
exports.getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { deletedAt: { $exists: false } };

    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-password -tokens'),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get single user with stats
 * GET /api/admin/users/:id
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -tokens');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get user's orders stats
    const [orders, orderStats] = await Promise.all([
      Order.find({ customer: user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('orderNumber total status createdAt'),
      Order.aggregate([
        { $match: { customer: user._id } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSpent: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0] }
            }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        user,
        orders,
        stats: orderStats[0] || { totalOrders: 0, totalSpent: 0 }
      }
    });
  } catch (error) {
    console.error('getUserById error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update user (role, status)
 * PUT /api/admin/users/:id
 */
exports.updateUser = async (req, res) => {
  try {
    const { role, isActive, name, phone } = req.body;

    // Prevent admin from deactivating their own account
    if (req.params.id === req.user._id.toString() && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    const allowedFields = {};
    if (role !== undefined) allowedFields.role = role;
    if (isActive !== undefined) allowedFields.isActive = isActive;
    if (name) allowedFields.name = name;
    if (phone) allowedFields.phone = phone;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      allowedFields,
      { new: true, runValidators: true }
    ).select('-password -tokens');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('updateUser error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Soft delete user
 * DELETE /api/admin/users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date(), isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Toggle user active status
 * PATCH /api/admin/users/:id/activate
 */
exports.toggleUserActivation = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { isActive: user.isActive }
    });
  } catch (error) {
    console.error('toggleUserActivation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// ANALYTICS
// ============================================================

/**
 * Revenue analytics by period
 * GET /api/admin/analytics/revenue?period=daily|weekly|monthly
 */
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { period = 'daily' } = req.query;

    let dateFormat;
    let daysBack;

    if (period === 'daily') {
      dateFormat = '%Y-%m-%d';
      daysBack = 30;
    } else if (period === 'weekly') {
      dateFormat = '%Y-W%V';
      daysBack = 84; // 12 weeks
    } else {
      dateFormat = '%Y-%m';
      daysBack = 365;
    }

    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    const revenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data: revenue });
  } catch (error) {
    console.error('getRevenueAnalytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Orders breakdown by status
 * GET /api/admin/analytics/orders
 */
exports.getOrdersAnalytics = async (req, res) => {
  try {
    const byStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const byPayment = await Order.aggregate([
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
    ]);

    res.json({ success: true, data: { byStatus, byPayment } });
  } catch (error) {
    console.error('getOrdersAnalytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * User growth over time
 * GET /api/admin/analytics/users
 */
exports.getUsersAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const growth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          deletedAt: { $exists: false }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const byRole = await User.aggregate([
      { $match: { deletedAt: { $exists: false } } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    res.json({ success: true, data: { growth, byRole } });
  } catch (error) {
    console.error('getUsersAnalytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Top selling products
 * GET /api/admin/analytics/top-products
 */
exports.getTopProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: { path: '$product', preserveNullAndEmpty: true } },
      {
        $project: {
          totalSold: 1,
          revenue: 1,
          'product._id': 1,
          'product.name': 1,
          'product.partNumber': 1,
          'product.images': { $slice: ['$product.images', 1] }
        }
      }
    ]);

    res.json({ success: true, data: topProducts });
  } catch (error) {
    console.error('getTopProducts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// SETTINGS
// ============================================================

/**
 * Get site settings
 * GET /api/admin/settings
 */
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('getSettings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update site settings
 * PUT /api/admin/settings
 */
exports.updateSettings = async (req, res) => {
  try {
    const allowedFields = [
      'siteName', 'contactEmail', 'currency', 'defaultLanguage',
      'shippingFlatRate', 'freeShippingThreshold',
      'taxRate',
      'lowStockThreshold', 'notifyOnNewOrder', 'notifyOnLowStock'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(updateData);
    } else {
      Object.assign(settings, updateData);
      await settings.save();
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('updateSettings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// AI ANALYTICS
// ============================================================

/**
 * Get AI/Chatbot stats
 * GET /api/admin/ai/stats
 */
exports.getAIStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalSessions, recentSessions, sessionsByDay] = await Promise.all([
      ChatSession.countDocuments(),
      ChatSession.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('user messages createdAt'),
      ChatSession.aggregate([
        {
          $match: { createdAt: { $gte: thirtyDaysAgo } }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalSessions,
        recentSessions,
        sessionsByDay
      }
    });
  } catch (error) {
    console.error('getAIStats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get suppliers (users with role=supplier)
 * GET /api/admin/suppliers
 */
exports.getSuppliers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search
    } = req.query;

    const query = { role: 'supplier', deletedAt: { $exists: false } };

    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [suppliers, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-password -tokens'),
      User.countDocuments(query)
    ]);

    // Get product count per supplier
    const Product = require('../models/Product');
    const supplierIds = suppliers.map(s => s._id);
    const productCounts = await Product.aggregate([
      { $match: { supplier: { $in: supplierIds } } },
      { $group: { _id: '$supplier', count: { $sum: 1 } } }
    ]);

    const productCountMap = {};
    productCounts.forEach(p => {
      productCountMap[p._id.toString()] = p.count;
    });

    const suppliersWithCount = suppliers.map(s => ({
      ...s.toObject(),
      productsCount: productCountMap[s._id.toString()] || 0
    }));

    res.json({
      success: true,
      data: {
        suppliers: suppliersWithCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('getSuppliers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Approve/reject supplier
 * PATCH /api/admin/suppliers/:id/status
 */
exports.updateSupplierStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const supplier = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'supplier' },
      { isActive },
      { new: true }
    ).select('-password -tokens');

    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    res.json({
      success: true,
      message: `Supplier ${isActive ? 'approved' : 'suspended'} successfully`,
      data: supplier
    });
  } catch (error) {
    console.error('updateSupplierStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get order with full details for admin
 * GET /api/admin/orders/:id
 */
exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name partNumber images')
      .populate('statusHistory.updatedBy', 'name');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('getOrderDetails error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update order with tracking and admin notes
 * PUT /api/admin/orders/:id
 */
exports.updateOrderDetails = async (req, res) => {
  try {
    const { trackingNumber, shippingCarrier, adminNotes, estimatedDelivery } = req.body;

    const updateData = {};
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (shippingCarrier !== undefined) updateData.shippingCarrier = shippingCarrier;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (estimatedDelivery !== undefined) updateData.estimatedDelivery = estimatedDelivery;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('customer', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('updateOrderDetails error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

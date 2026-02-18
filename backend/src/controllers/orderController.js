const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * ★★★ ORDER CONTROLLER ★★★
 * Comprehensive order management system
 */

/**
 * Get all orders for current user
 * GET /api/orders
 * @access Private
 */
exports.getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const query = { customer: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    // Search by order number
    if (search && search.trim()) {
      query.orderNumber = { $regex: search.trim(), $options: 'i' };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('items.product', 'name partNumber images')
        .lean(),
      Order.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('[Order Controller] GetUserOrders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

/**
 * Get single order by ID
 * GET /api/orders/:id
 * @access Private
 */
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findOne({
      _id: id,
      customer: req.user._id
    })
      .populate('items.product', 'name partNumber images price')
      .lean();
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
    
  } catch (error) {
    console.error('[Order Controller] GetOrderById error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

/**
 * Create new order from cart
 * POST /api/orders
 * @access Private
 */
exports.createOrder = async (req, res) => {
  try {
    const {
      shippingAddress,
      paymentMethod,
      notes
    } = req.body;
    
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    // Validate all items and calculate totals - match Order schema
    const orderItems = [];
    let subtotal = 0;
    
    for (const item of cart.items) {
      const product = item.product;
      
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${product?.name?.en || 'Unknown'} is no longer available`
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name.en}. Only ${product.stock} available.`
        });
      }
      
      const unitPrice = product.discount
        ? product.price * (1 - product.discount / 100)
        : product.price;
      
      subtotal += unitPrice * item.quantity;
      
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: unitPrice,
        productSnapshot: {
          name: product.name || {},
          partNumber: product.partNumber,
          images: (product.images || []).map(img => ({ url: img.url }))
        }
      });
    }
    
    const tax = subtotal * 0.15; // 15% VAT
    const shippingCost = subtotal >= 500 ? 0 : 50; // Free shipping over 500 SAR
    const total = subtotal + tax + shippingCost;
    
    // Map payment method to Order schema enum (card, cash_on_delivery, bank_transfer)
    const paymentMethodMap = {
      credit_card: 'card',
      debit_card: 'card',
      cash_on_delivery: 'cash_on_delivery',
      bank_transfer: 'bank_transfer'
    };
    const orderPaymentMethod = paymentMethodMap[paymentMethod] || 'cash_on_delivery';
    
    // Map shipping address to Order schema (name, phone, street, city, district, postalCode, country)
    const addr = shippingAddress || {};
    const mappedAddress = {
      name: addr.fullName || addr.name || '',
      phone: addr.phone || '',
      street: [addr.addressLine1, addr.addressLine2].filter(Boolean).join(', '),
      city: addr.city || '',
      district: addr.state || addr.district || '',
      postalCode: addr.postalCode || '',
      country: addr.country || 'Saudi Arabia'
    };
    
    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      subtotal,
      tax,
      shipping: shippingCost,
      discount: 0,
      total,
      shippingAddress: mappedAddress,
      paymentMethod: orderPaymentMethod,
      paymentStatus: 'pending',
      status: 'pending',
      statusHistory: [{
        status: 'pending',
        date: new Date(),
        note: 'Order created',
        updatedBy: req.user._id
      }],
      customerNotes: notes || ''
    });
    
    // Update product stock and sales
    const stockUpdates = orderItems.map(item =>
      Product.findByIdAndUpdate(item.product, {
        $inc: {
          stock: -item.quantity,
          purchaseCount: item.quantity
        }
      })
    );
    
    await Promise.all(stockUpdates);
    
    // Clear cart
    cart.items = [];
    await cart.save();
    
    // Populate and return
    await order.populate('items.product', 'name partNumber images');
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
    
  } catch (error) {
    console.error('[Order Controller] CreateOrder error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

/**
 * Update order status (Admin only)
 * PUT /api/orders/:id/status
 * @access Private (Admin)
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    order.status = status;
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status,
      date: new Date(),
      note: note || `Status updated to ${status}`,
      updatedBy: req.user._id
    });
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
    
  } catch (error) {
    console.error('[Order Controller] UpdateOrderStatus error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

/**
 * Cancel order
 * PUT /api/orders/:id/cancel
 * @access Private
 */
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const order = await Order.findOne({
      _id: id,
      customer: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if order can be cancelled - use status field
    const currentStatus = order.status || (order.statusHistory?.length ? order.statusHistory[order.statusHistory.length - 1]?.status : 'pending');
    
    if (['shipped', 'delivered', 'cancelled'].includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${currentStatus}`
      });
    }
    
    order.status = 'cancelled';
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: 'cancelled',
      date: new Date(),
      note: reason || 'Cancelled by user',
      updatedBy: req.user._id
    });
    
    await order.save();
    
    // Restore product stock
    const restoreStockPromises = order.items.map(item =>
      Product.findByIdAndUpdate(item.product, {
        $inc: {
          stock: item.quantity,
          purchaseCount: -item.quantity
        }
      })
    );
    
    await Promise.all(restoreStockPromises);
    
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
    
  } catch (error) {
    console.error('[Order Controller] CancelOrder error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
};

/**
 * Update payment status (Admin only)
 * PATCH /api/orders/:id/payment
 * @access Private (Admin)
 */
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transactionId } = req.body;
    
    const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    order.paymentStatus = status;
    if (transactionId) {
      order.paymentDetails = order.paymentDetails || {};
      order.paymentDetails.transactionId = transactionId;
    }
    if (status === 'paid') {
      order.paymentDetails = order.paymentDetails || {};
      order.paymentDetails.paidAt = new Date();
    }
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: order
    });
    
  } catch (error) {
    console.error('[Order Controller] UpdatePaymentStatus error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment status',
      error: error.message
    });
  }
};

/**
 * Get all orders (Admin only)
 * GET /api/orders/admin/all
 * @access Private (Admin)
 */
exports.getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      paymentStatus,
      search 
    } = req.query;
    
    const query = {};
    
    if (status) {
      if (status === 'needs_attention') {
        query.status = { $in: ['pending', 'confirmed', 'processing'] };
      } else {
        query.status = status;
      }
    }
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    if (search && search.trim()) {
      const term = search.trim();
      const User = require('../models/User');
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: term, $options: 'i' } },
          { email: { $regex: term, $options: 'i' } }
        ]
      }).select('_id').lean();
      const customerIds = matchingUsers.map(u => u._id);
      query.$or = [
        { orderNumber: { $regex: term, $options: 'i' } },
        ...(customerIds.length > 0 ? [{ customer: { $in: customerIds } }] : [])
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('customer', 'name email phone')
        .populate('items.product', 'name partNumber')
        .lean(),
      Order.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('[Order Controller] GetAllOrders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

/**
 * Get quick order stats for admin dashboard (pending, new today, etc.)
 * GET /api/orders/admin/quick-stats
 * @access Private (Admin)
 */
exports.getOrderQuickStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [pending, confirmed, processing, newToday] = await Promise.all([
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'confirmed' }),
      Order.countDocuments({ status: 'processing' }),
      Order.countDocuments({ createdAt: { $gte: startOfToday } })
    ]);

    res.json({
      success: true,
      data: {
        pending,
        confirmed,
        processing,
        newToday,
        needsAttention: pending + confirmed + processing
      }
    });
  } catch (error) {
    console.error('[Order Controller] getOrderQuickStats error:', error);
    res.status(500).json({ success: false, message: 'Error fetching stats' });
  }
};

/**
 * Get order statistics (Admin only)
 * GET /api/orders/admin/stats
 * @access Private (Admin)
 */
exports.getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' }
        }
      }
    ]);
    
    // Get orders by status
    const statusCounts = await Order.aggregate([
      { $unwind: '$statusHistory' },
      { $sort: { 'statusHistory.date': -1 } },
      {
        $group: {
          _id: '$_id',
          currentStatus: { $first: '$statusHistory.status' }
        }
      },
      {
        $group: {
          _id: '$currentStatus',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        byStatus: statusCounts
      }
    });
    
  } catch (error) {
    console.error('[Order Controller] GetOrderStats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order statistics',
      error: error.message
    });
  }
};

/**
 * Helper: Generate unique order number
 */
function generateOrderNumber() {
  const prefix = 'ORD';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

module.exports = exports;

const Category = require('../models/Category');
const Product = require('../models/Product');
const { cacheHelper, cacheKeys } = require('../config/redis');

/**
 * ★★★ CATEGORY CONTROLLER ★★★
 * Comprehensive category management
 */

/**
 * Get all categories (hierarchical)
 * GET /api/categories
 * @access Public
 */
exports.getAllCategories = async (req, res) => {
  try {
    const { language = 'en', includeProducts = false } = req.query;
    
    // Try cache first
    const cacheKey = `categories:all:${language}`;
    const cached = await cacheHelper.get(cacheKey);
    
    if (cached && !includeProducts) {
      return res.json({
        success: true,
        data: cached,
        cached: true
      });
    }
    
    // Find all active categories
    let query = Category.find({ isActive: true });
    
    // Populate parent if exists
    query = query.populate('parent', 'name slug');
    
    // Sort by order
    query = query.sort({ order: 1, createdAt: -1 });
    
    let categories = await query.lean();
    
    // Build hierarchical structure
    const buildHierarchy = (cats, parentId = null) => {
      return cats
        .filter(cat => {
          if (parentId === null) {
            return !cat.parent;
          }
          return cat.parent && cat.parent._id.toString() === parentId.toString();
        })
        .map(cat => ({
          ...cat,
          children: buildHierarchy(cats, cat._id)
        }));
    };
    
    const hierarchicalCategories = buildHierarchy(categories);
    
    // Include product count if requested
    if (includeProducts) {
      const addProductCount = async (cats) => {
        for (let cat of cats) {
          cat.productCount = await Product.countDocuments({ 
            category: cat._id, 
            isActive: true 
          });
          
          if (cat.children && cat.children.length > 0) {
            await addProductCount(cat.children);
          }
        }
      };
      
      await addProductCount(hierarchicalCategories);
    }
    
    // Cache for 1 hour
    if (!includeProducts) {
      await cacheHelper.set(cacheKey, hierarchicalCategories, 3600);
    }
    
    res.json({
      success: true,
      data: hierarchicalCategories,
      cached: false
    });
    
  } catch (error) {
    console.error('[Category Controller] GetAll error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

/**
 * Get single category by ID
 * GET /api/categories/:id
 * @access Public
 */
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { includeProducts = false, language = 'en' } = req.query;
    
    // Try cache first
    const cacheKey = `category:${id}:${language}`;
    const cached = await cacheHelper.get(cacheKey);
    
    if (cached && !includeProducts) {
      return res.json({
        success: true,
        data: cached,
        cached: true
      });
    }
    
    const category = await Category.findById(id)
      .populate('parent', 'name slug')
      .lean();
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    if (!category.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Category not available'
      });
    }
    
    // Get subcategories
    category.children = await Category.find({ 
      parent: id, 
      isActive: true 
    }).select('name slug image').lean();
    
    // Include products if requested
    if (includeProducts) {
      category.products = await Product.find({
        category: id,
        isActive: true
      })
        .select('name partNumber price images stock')
        .limit(20)
        .lean();
    }
    
    // Get product count
    category.productCount = await Product.countDocuments({ 
      category: id, 
      isActive: true 
    });
    
    // Cache for 30 minutes
    if (!includeProducts) {
      await cacheHelper.set(cacheKey, category, 1800);
    }
    
    res.json({
      success: true,
      data: category,
      cached: false
    });
    
  } catch (error) {
    console.error('[Category Controller] GetById error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
};

/**
 * Get category by slug
 * GET /api/categories/slug/:slug
 * @access Public
 */
exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { includeProducts = false } = req.query;
    
    const category = await Category.findOne({ slug, isActive: true })
      .populate('parent', 'name slug')
      .lean();
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Get subcategories
    category.children = await Category.find({ 
      parent: category._id, 
      isActive: true 
    }).select('name slug image').lean();
    
    // Include products if requested
    if (includeProducts) {
      category.products = await Product.find({
        category: category._id,
        isActive: true
      })
        .select('name partNumber price images stock')
        .limit(20)
        .lean();
    }
    
    // Get product count
    category.productCount = await Product.countDocuments({ 
      category: category._id, 
      isActive: true 
    });
    
    res.json({
      success: true,
      data: category
    });
    
  } catch (error) {
    console.error('[Category Controller] GetBySlug error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
};

/**
 * Create new category
 * POST /api/categories
 * @access Private (Admin only)
 */
exports.createCategory = async (req, res) => {
  try {
    const categoryData = req.body;
    
    // Check if parent exists (if provided)
    if (categoryData.parent) {
      const parentCategory = await Category.findById(categoryData.parent);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }
    }
    
    // Create category
    const category = await Category.create(categoryData);
    
    // Clear categories cache
    await cacheHelper.clearPattern('categories:*');
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
    
  } catch (error) {
    console.error('[Category Controller] Create error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this slug already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
};

/**
 * Update category
 * PUT /api/categories/:id
 * @access Private (Admin only)
 */
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Find category
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if trying to set itself as parent
    if (updates.parent && updates.parent.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'Category cannot be its own parent'
      });
    }
    
    // Check for circular reference
    if (updates.parent) {
      const parentCat = await Category.findById(updates.parent);
      if (parentCat && parentCat.parent && parentCat.parent.toString() === id) {
        return res.status(400).json({
          success: false,
          message: 'Circular parent reference detected'
        });
      }
    }
    
    // Update category
    Object.assign(category, updates);
    await category.save();
    
    // Clear cache
    await cacheHelper.clearPattern('categories:*');
    await cacheHelper.clearPattern(`category:${id}:*`);
    
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
    
  } catch (error) {
    console.error('[Category Controller] Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
};

/**
 * Delete category (soft delete)
 * DELETE /api/categories/:id
 * @access Private (Admin only)
 */
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if category has products
    const productCount = await Product.countDocuments({ category: id });
    
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${productCount} products. Please reassign or delete products first.`
      });
    }
    
    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({ parent: id });
    
    if (subcategoryCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${subcategoryCount} subcategories. Please delete subcategories first.`
      });
    }
    
    // Soft delete
    category.isActive = false;
    await category.save();
    
    // Clear cache
    await cacheHelper.clearPattern('categories:*');
    await cacheHelper.clearPattern(`category:${id}:*`);
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
    
  } catch (error) {
    console.error('[Category Controller] Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
};

/**
 * Get top-level categories (no parent)
 * GET /api/categories/top
 * @access Public
 */
exports.getTopCategories = async (req, res) => {
  try {
    const categories = await Category.find({ 
      parent: null, 
      isActive: true 
    })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    
    // Add product count for each
    for (let cat of categories) {
      cat.productCount = await Product.countDocuments({ 
        category: cat._id, 
        isActive: true 
      });
    }
    
    res.json({
      success: true,
      data: categories
    });
    
  } catch (error) {
    console.error('[Category Controller] GetTop error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top categories',
      error: error.message
    });
  }
};

/**
 * Reorder categories
 * PUT /api/categories/reorder
 * @access Private (Admin only)
 */
exports.reorderCategories = async (req, res) => {
  try {
    const { categoryOrders } = req.body; // Array of { id, order }
    
    if (!Array.isArray(categoryOrders)) {
      return res.status(400).json({
        success: false,
        message: 'categoryOrders must be an array'
      });
    }
    
    // Update each category's order
    const updatePromises = categoryOrders.map(({ id, order }) =>
      Category.findByIdAndUpdate(id, { order })
    );
    
    await Promise.all(updatePromises);
    
    // Clear cache
    await cacheHelper.clearPattern('categories:*');
    
    res.json({
      success: true,
      message: 'Categories reordered successfully'
    });
    
  } catch (error) {
    console.error('[Category Controller] Reorder error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering categories',
      error: error.message
    });
  }
};

module.exports = exports;

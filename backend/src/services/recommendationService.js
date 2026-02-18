const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Vehicle = require('../models/Vehicle');
const { cacheHelper, cacheKeys } = require('../config/redis');

class RecommendationService {
  
  /**
   * Get personalized product recommendations for a user
   * 
   * @param {string} userId - User ID
   * @param {Object} options - Recommendation options
   * @returns {Array} Recommended products
   */
  async getPersonalizedRecommendations(userId, options = {}) {
    const { limit = 10, vehicleId = null } = options;
    
    try {
      // Check cache first
      const cacheKey = cacheKeys.recommendations(userId, vehicleId || '');
      const cached = await cacheHelper.get(cacheKey);
      
      if (cached) {
        console.log(`[Recommendations] Cache hit for user: ${userId}`);
        return cached;
      }
      
      console.log(`[Recommendations] Generating recommendations for user: ${userId}`);
      
      // Get user's vehicles
      const vehicles = vehicleId 
        ? [await Vehicle.findById(vehicleId).lean()]
        : await Vehicle.find({ user: userId }).lean();
      
      if (!vehicles || vehicles.length === 0) {
        // No vehicles, return popular products
        return await this.getPopularProducts(limit);
      }
      
      // Get user's purchase history
      const orders = await Order.find({
        customer: userId,
        status: { $in: ['delivered', 'confirmed'] }
      })
      .populate('items.product')
      .limit(10)
      .lean();
      
      const purchasedProductIds = new Set();
      const purchasedCategories = new Set();
      
      orders.forEach(order => {
        order.items.forEach(item => {
          if (item.product) {
            purchasedProductIds.add(item.product._id.toString());
            if (item.product.category) {
              purchasedCategories.add(item.product.category.toString());
            }
          }
        });
      });
      
      // Build recommendation query
      const recommendationQuery = {
        isActive: true,
        stock: { $gt: 0 },
        _id: { $nin: Array.from(purchasedProductIds) } // Exclude already purchased
      };
      
      // Prioritize compatible products
      const compatibleBrands = [...new Set(vehicles.map(v => v.brand))];
      const compatibleModels = [...new Set(vehicles.map(v => v.model))];
      
      const recommendations = [];
      
      // Strategy 1: Compatible products from purchased categories (60% weight)
      if (purchasedCategories.size > 0) {
        const categoryRecommendations = await Product.find({
          ...recommendationQuery,
          category: { $in: Array.from(purchasedCategories) },
          'compatibility.brand': { $in: compatibleBrands },
          'compatibility.model': { $in: compatibleModels }
        })
        .populate('category', 'name')
        .sort({ averageRating: -1, purchaseCount: -1 })
        .limit(Math.ceil(limit * 0.6))
        .lean();
        
        recommendations.push(...categoryRecommendations);
      }
      
      // Strategy 2: Popular compatible products (40% weight)
      const popularCompatible = await Product.find({
        ...recommendationQuery,
        'compatibility.brand': { $in: compatibleBrands },
        'compatibility.model': { $in: compatibleModels },
        _id: { $nin: recommendations.map(p => p._id) }
      })
      .populate('category', 'name')
      .sort({ purchaseCount: -1, averageRating: -1 })
      .limit(Math.ceil(limit * 0.4))
      .lean();
      
      recommendations.push(...popularCompatible);
      
      // If still not enough, add general popular products
      if (recommendations.length < limit) {
        const additional = await this.getPopularProducts(limit - recommendations.length);
        recommendations.push(...additional.filter(p => 
          !recommendations.some(r => r._id.toString() === p._id.toString())
        ));
      }
      
      // Limit to requested count
      const finalRecommendations = recommendations.slice(0, limit);
      
      // Cache results for 1 hour
      await cacheHelper.set(cacheKey, finalRecommendations, 3600);
      
      console.log(`[Recommendations] Generated ${finalRecommendations.length} recommendations`);
      
      return finalRecommendations;
      
    } catch (error) {
      console.error('[Recommendations] Error generating recommendations:', error);
      // Fallback to popular products
      return await this.getPopularProducts(limit);
    }
  }
  
  /**
   * Get similar products to a given product
   * 
   * @param {string} productId - Product ID
   * @param {number} limit - Number of recommendations
   * @returns {Array} Similar products
   */
  /**
   * Get similar products - IMPROVED multi-strategy algorithm
   * 1. Same category + same compatibility (highest relevance)
   * 2. Same category + same brand (high relevance)
   * 3. Same category (medium relevance)
   * 4. Same brand from compatibility (medium relevance)
   * 5. Fill with popular products from same category
   */
  async getSimilarProducts(productId, limit = 6) {
    try {
      const product = await Product.findById(productId)
        .populate('category')
        .lean();
      
      if (!product) throw new Error('Product not found');
      
      const categoryId = product.category?._id || product.category;
      const excludeId = { _id: { $ne: productId } };
      const baseQuery = { ...excludeId, isActive: true, stock: { $gt: 0 } };
      const brands = product.compatibility?.length > 0
        ? [...new Set(product.compatibility.map(c => c.brand))]
        : [];
      const models = product.compatibility?.length > 0
        ? [...new Set(product.compatibility.map(c => c.model))]
        : [];
      
      const similarIds = new Set();
      const results = [];
      
      // Strategy 1: Same category + same brand + same model (best match)
      if (categoryId && brands.length > 0 && models.length > 0) {
        const s1 = await Product.find({
          ...baseQuery,
          category: categoryId,
          'compatibility.brand': { $in: brands },
          'compatibility.model': { $in: models }
        })
          .populate('category', 'name')
          .sort({ averageRating: -1, purchaseCount: -1, viewCount: -1 })
          .limit(limit)
          .lean();
        s1.forEach(p => {
          if (!similarIds.has(p._id.toString())) {
            similarIds.add(p._id.toString());
            results.push(p);
          }
        });
      }
      
      // Strategy 2: Same category + same brand
      if (results.length < limit && categoryId && brands.length > 0) {
        const s2 = await Product.find({
          ...baseQuery,
          category: categoryId,
          'compatibility.brand': { $in: brands },
          _id: { $nin: Array.from(similarIds).map(id => new mongoose.Types.ObjectId(id)) }
        })
          .populate('category', 'name')
          .sort({ averageRating: -1, purchaseCount: -1 })
          .limit(limit - results.length)
          .lean();
        s2.forEach(p => {
          if (!similarIds.has(p._id.toString())) {
            similarIds.add(p._id.toString());
            results.push(p);
          }
        });
      }
      
      // Strategy 3: Same category only
      if (results.length < limit && categoryId) {
        const s3 = await Product.find({
          ...baseQuery,
          category: categoryId,
          _id: { $nin: Array.from(similarIds).map(id => new mongoose.Types.ObjectId(id)) }
        })
          .populate('category', 'name')
          .sort({ purchaseCount: -1, averageRating: -1 })
          .limit(limit - results.length)
          .lean();
        s3.forEach(p => {
          if (!similarIds.has(p._id.toString())) {
            similarIds.add(p._id.toString());
            results.push(p);
          }
        });
      }
      
      // Strategy 4: Same brand from compatibility (different category)
      if (results.length < limit && brands.length > 0) {
        const s4 = await Product.find({
          ...baseQuery,
          'compatibility.brand': { $in: brands },
          _id: { $nin: Array.from(similarIds).map(id => new mongoose.Types.ObjectId(id)) }
        })
          .populate('category', 'name')
          .sort({ purchaseCount: -1 })
          .limit(limit - results.length)
          .lean();
        s4.forEach(p => {
          if (!similarIds.has(p._id.toString())) {
            similarIds.add(p._id.toString());
            results.push(p);
          }
        });
      }
      
      // Strategy 5: Popular products (fallback)
      if (results.length < limit) {
        const s5 = await Product.find({
          ...baseQuery,
          _id: { $nin: Array.from(similarIds).map(id => new mongoose.Types.ObjectId(id)) }
        })
          .populate('category', 'name')
          .sort({ purchaseCount: -1, viewCount: -1 })
          .limit(limit - results.length)
          .lean();
        s5.forEach(p => {
          if (!similarIds.has(p._id.toString())) {
            similarIds.add(p._id.toString());
            results.push(p);
          }
        });
      }
      
      return results.slice(0, limit);
      
    } catch (error) {
      console.error('[Recommendations] Error getting similar products:', error);
      return [];
    }
  }
  
  /**
   * Get frequently bought together products
   * 
   * @param {string} productId - Product ID
   * @param {number} limit - Number of recommendations
   * @returns {Array} Frequently bought together products
   */
  async getFrequentlyBoughtTogether(productId, limit = 4) {
    try {
      // Find orders containing this product
      const orders = await Order.find({
        'items.product': productId,
        status: { $in: ['delivered', 'confirmed'] }
      })
      .populate('items.product')
      .limit(100)
      .lean();
      
      // Count co-occurrences
      const coOccurrences = new Map();
      
      orders.forEach(order => {
        const otherProducts = order.items
          .filter(item => item.product && item.product._id.toString() !== productId)
          .map(item => item.product);
        
        otherProducts.forEach(prod => {
          const prodId = prod._id.toString();
          coOccurrences.set(prodId, {
            product: prod,
            count: (coOccurrences.get(prodId)?.count || 0) + 1
          });
        });
      });
      
      // Sort by frequency and return top N
      const sorted = Array.from(coOccurrences.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
        .map(item => item.product);
      
      return sorted;
      
    } catch (error) {
      console.error('[Recommendations] Error getting frequently bought together:', error);
      return [];
    }
  }
  
  /**
   * Get popular products
   * 
   * @param {number} limit - Number of products
   * @returns {Array} Popular products
   */
  async getPopularProducts(limit = 10) {
    try {
      // Check cache
      const cacheKey = cacheKeys.popularProducts();
      const cached = await cacheHelper.get(cacheKey);
      
      if (cached) {
        return cached.slice(0, limit);
      }
      
      const popular = await Product.find({
        isActive: true,
        stock: { $gt: 0 }
      })
      .populate('category', 'name')
      .sort({ purchaseCount: -1, averageRating: -1, viewCount: -1 })
      .limit(limit)
      .lean();
      
      // Cache for 6 hours
      await cacheHelper.set(cacheKey, popular, 21600);
      
      return popular;
      
    } catch (error) {
      console.error('[Recommendations] Error getting popular products:', error);
      return [];
    }
  }
  
  /**
   * Get trending products (recently popular)
   * 
   * @param {number} limit - Number of products
   * @returns {Array} Trending products
   */
  async getTrendingProducts(limit = 10) {
    try {
      // Get products with high recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const trending = await Product.find({
        isActive: true,
        stock: { $gt: 0 },
        createdAt: { $gte: thirtyDaysAgo }
      })
      .populate('category', 'name')
      .sort({ viewCount: -1, purchaseCount: -1 })
      .limit(limit)
      .lean();
      
      return trending;
      
    } catch (error) {
      console.error('[Recommendations] Error getting trending products:', error);
      return [];
    }
  }
}

module.exports = new RecommendationService();

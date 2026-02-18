const Product = require('../models/Product');
const Vehicle = require('../models/Vehicle');
const { cacheHelper, cacheKeys } = require('../config/redis');

class CompatibilityService {
  
  /**
   * ★★ Check if a product is compatible with a vehicle
   * 
   * @param {string|Object} productId - Product ID or product object
   * @param {string|Object} vehicleId - Vehicle ID or vehicle object
   * @returns {Object} Compatibility result
   */
  async checkCompatibility(productId, vehicleId) {
    try {
      // Get product and vehicle data
      let product, vehicle;
      
      if (typeof productId === 'string') {
        // Check cache first
        const cacheKey = cacheKeys.compatibility(productId, vehicleId);
        const cached = await cacheHelper.get(cacheKey);
        if (cached) {
          return cached;
        }
        
        product = await Product.findById(productId).select('compatibility name partNumber').lean();
        if (!product) {
          throw new Error('Product not found');
        }
      } else {
        product = productId; // Already an object
      }
      
      if (typeof vehicleId === 'string') {
        vehicle = await Vehicle.findById(vehicleId).lean();
        if (!vehicle) {
          throw new Error('Vehicle not found');
        }
      } else {
        vehicle = vehicleId; // Already an object
      }
      
      // Check compatibility
      const compatibilityMatch = product.compatibility.find(compat =>
        compat.brand === vehicle.brand &&
        compat.model === vehicle.model &&
        compat.yearFrom <= vehicle.year &&
        compat.yearTo >= vehicle.year
      );
      
      const result = {
        isCompatible: !!compatibilityMatch,
        product: {
          id: product._id,
          name: product.name,
          partNumber: product.partNumber
        },
        vehicle: {
          id: vehicle._id,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year
        },
        compatibilityDetails: compatibilityMatch || null,
        message: this.getCompatibilityMessage(!!compatibilityMatch, vehicle, compatibilityMatch)
      };
      
      // Cache result for 1 hour
      if (typeof productId === 'string' && typeof vehicleId === 'string') {
        const cacheKey = cacheKeys.compatibility(productId, vehicleId);
        await cacheHelper.set(cacheKey, result, 3600);
      }
      
      return result;
      
    } catch (error) {
      console.error('[Compatibility] Error checking compatibility:', error);
      return {
        isCompatible: false,
        error: error.message
      };
    }
  }
  
  /**
   * Check compatibility with multiple vehicles
   */
  async checkMultipleVehicles(productId, vehicleIds) {
    return await Promise.all(
      vehicleIds.map(vehicleId => this.checkCompatibility(productId, vehicleId))
    );
  }
  
  /**
   * Find all products compatible with a vehicle
   */
  async findCompatibleProducts(vehicleId, options = {}) {
    const { category, limit = 50, page = 1 } = options;
    
    const vehicle = await Vehicle.findById(vehicleId).lean();
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    
    const query = {
      isActive: true,
      'compatibility': {
        $elemMatch: {
          brand: vehicle.brand,
          model: vehicle.model,
          yearFrom: { $lte: vehicle.year },
          yearTo: { $gte: vehicle.year }
        }
      }
    };
    
    if (category) {
      query.category = category;
    }
    
    const skip = (page - 1) * limit;
    
    const products = await Product.find(query)
      .populate('category', 'name')
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Product.countDocuments(query);
    
    return {
      products,
      vehicle,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  /**
   * Get compatibility message for UI display
   */
  getCompatibilityMessage(isCompatible, vehicle, compatDetails) {
    const vehicleName = `${vehicle.brand} ${vehicle.model} (${vehicle.year})`;
    
    if (isCompatible) {
      if (compatDetails && compatDetails.notes) {
        return {
          ar: `متوافق مع ${vehicleName}. ${compatDetails.notes.ar || ''}`,
          en: `Compatible with ${vehicleName}. ${compatDetails.notes.en || ''}`
        };
      }
      return {
        ar: `متوافق مع ${vehicleName}`,
        en: `Compatible with ${vehicleName}`
      };
    } else {
      return {
        ar: `غير متوافق مع ${vehicleName}. يرجى التحقق من المواصفات.`,
        en: `Not compatible with ${vehicleName}. Please check specifications.`
      };
    }
  }
  
  /**
   * Clear compatibility cache for a product (call when product is updated)
   */
  async clearProductCompatibilityCache(productId) {
    const pattern = `compat:${productId}:*`;
    await cacheHelper.clearPattern(pattern);
  }
  
  /**
   * Batch check compatibility for multiple products and one vehicle
   */
  async batchCheckCompatibility(productIds, vehicleId) {
    const vehicle = await Vehicle.findById(vehicleId).lean();
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true
    }).select('_id name partNumber compatibility').lean();
    
    return products.map(product => {
      const compatibilityMatch = product.compatibility.find(compat =>
        compat.brand === vehicle.brand &&
        compat.model === vehicle.model &&
        compat.yearFrom <= vehicle.year &&
        compat.yearTo >= vehicle.year
      );
      
      return {
        productId: product._id,
        productName: product.name,
        isCompatible: !!compatibilityMatch,
        compatibilityDetails: compatibilityMatch || null
      };
    });
  }
}

module.exports = new CompatibilityService();

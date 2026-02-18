const Product = require('../models/Product');
const Vehicle = require('../models/Vehicle');
const nlpProcessor = require('./nlpProcessorService');
const compatibilityService = require('./compatibilityService');
const searchRankingService = require('./searchRankingService');

class AISearchService {
  
  /**
   * ★★★ MAIN INTELLIGENT SEARCH FUNCTION ★★★
   * 
   * This orchestrates the entire AI-powered search process:
   * 1. NLP processing to understand query
   * 2. MongoDB query building
   * 3. Compatibility checking
   * 4. Intelligent ranking
   * 5. Sorting and pagination
   * 
   * @param {string} query - Raw search query
   * @param {string} userId - User ID (optional, for personalization)
   * @param {Object} options - Search options
   * @returns {Object} Search results with metadata
   */
  async intelligentSearch(query, userId = null, options = {}) {
    const {
      language = 'en',
      page = 1,
      limit = 20,
      sortBy = 'relevance',
      filters = {}
    } = options;
    
    const searchStartTime = Date.now();
    
    try {
      // STEP 1: Process query with NLP ★★★
      console.log(`[AI Search] Starting intelligent search for: "${query}"`);
      const nlpResult = await nlpProcessor.processSearchQuery(query, language);
      console.log(`[AI Search] NLP result:`, nlpResult);
      
      // STEP 2: Get user's vehicles for compatibility checking ★★
      let userVehicles = [];
      if (userId) {
        userVehicles = await Vehicle.find({ user: userId })
          .sort({ isPrimary: -1 })
          .limit(3)
          .lean();
        console.log(`[AI Search] Found ${userVehicles.length} vehicles for user`);
      }
      
      // STEP 3: Build MongoDB query from NLP results ★★
      const mongoQuery = this.buildMongoQuery(nlpResult, filters, language);
      console.log(`[AI Search] MongoDB query:`, JSON.stringify(mongoQuery));
      
      // STEP 4: Execute search with pagination
      const skip = (page - 1) * limit;
      
      // Use aggregation pipeline for complex queries
      let products = await this.executeSearchQuery(mongoQuery, {
        skip,
        limit,
        language,
        includeTextScore: true
      });
      
      console.log(`[AI Search] Found ${products.length} products from MongoDB`);
      
      // STEP 5: Check compatibility for each product ★★
      if (userVehicles.length > 0) {
        products = await this.addCompatibilityInfo(products, userVehicles);
      }
      
      // STEP 6: Apply intelligent ranking ★★★
      products = await searchRankingService.rankSearchResults(
        products,
        nlpResult,
        userVehicles,
        userId
      );
      
      // STEP 7: Sort results according to user preference
      products = this.sortResults(products, sortBy);
      
      // STEP 8: Get total count for pagination
      const total = await Product.countDocuments(mongoQuery);
      
      const searchTime = Date.now() - searchStartTime;
      console.log(`[AI Search] Search completed in ${searchTime}ms`);
      
      // STEP 9: Return comprehensive results
      return {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        },
        nlpAnalysis: nlpResult,
        appliedFilters: filters,
        searchMetadata: {
          searchTime,
          resultCount: products.length,
          totalMatches: total,
          language,
          hasVehicles: userVehicles.length > 0
        }
      };
      
    } catch (error) {
      console.error('[AI Search] Error in intelligent search:', error);
      throw error;
    }
  }
  
  /**
   * Build MongoDB query from NLP results and filters
   */
  buildMongoQuery(nlpResult, filters, language) {
    const query = {
      isActive: true,
      deletedAt: null
    };
    const andConditions = [];
    
    // Text search using MongoDB text index ★
    if (nlpResult.partType || nlpResult.originalQuery) {
      const searchText = nlpResult.partType || nlpResult.originalQuery;
      query.$text = {
        $search: searchText,
        $language: language === 'ar' ? 'arabic' : 'english'
      };
    }
    
    // Brand filter from NLP ★
    if (nlpResult.brand) {
      andConditions.push({
        'compatibility.brand': nlpResult.brand
      });
    }
    
    // Model filter from NLP ★
    if (nlpResult.model) {
      andConditions.push({
        'compatibility.model': {
          $regex: new RegExp(nlpResult.model, 'i')
        }
      });
    }
    
    // Year filter from NLP ★
    if (nlpResult.year) {
      andConditions.push({
        'compatibility': {
          $elemMatch: {
            yearFrom: { $lte: nlpResult.year },
            yearTo: { $gte: nlpResult.year }
          }
        }
      });
    }
    
    // Additional user-applied filters
    
    // Price range filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) {
        query.price.$gte = parseFloat(filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        query.price.$lte = parseFloat(filters.maxPrice);
      }
    }
    
    // Stock availability filter
    if (filters.inStock === 'true' || filters.inStock === true) {
      query.stock = { $gt: 0 };
    }
    
    // Minimum rating filter
    if (filters.minRating) {
      query.averageRating = { $gte: parseFloat(filters.minRating) };
    }
    
    // Category filter
    if (filters.category) {
      query.category = filters.category;
    }
    
    // Brand filter (overrides NLP if user explicitly selects)
    if (filters.brand && !nlpResult.brand) {
      andConditions.push({
        'compatibility.brand': filters.brand
      });
    }
    
    // Featured products filter
    if (filters.featured === 'true' || filters.featured === true) {
      query.isFeatured = true;
    }
    
    // Combine all $and conditions
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }
    
    return query;
  }
  
  /**
   * Execute search query with aggregation pipeline
   */
  async executeSearchQuery(query, options) {
    const { skip, limit, language, includeTextScore } = options;
    
    const pipeline = [];
    
    // Match stage
    pipeline.push({ $match: query });
    
    // Add text score if text search is used
    if (query.$text && includeTextScore) {
      pipeline.push({
        $addFields: {
          textScore: { $meta: 'textScore' }
        }
      });
    }
    
    // Lookup category
    pipeline.push({
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category'
      }
    });
    
    // Unwind category (convert from array to object)
    pipeline.push({
      $unwind: {
        path: '$category',
        preserveNullAndEmptyArrays: true
      }
    });
    
    // Lookup supplier
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'supplier',
        foreignField: '_id',
        as: 'supplier'
      }
    });
    
    // Unwind supplier
    pipeline.push({
      $unwind: {
        path: '$supplier',
        preserveNullAndEmptyArrays: true
      }
    });
    
    // Project only needed fields
    pipeline.push({
      $project: {
        name: 1,
        description: 1,
        partNumber: 1,
        price: 1,
        currency: 1,
        stock: 1,
        images: 1,
        compatibility: 1,
        averageRating: 1,
        totalReviews: 1,
        warranty: 1,
        installationDifficulty: 1,
        viewCount: 1,
        purchaseCount: 1,
        isFeatured: 1,
        textScore: 1,
        'category._id': 1,
        'category.name': 1,
        'supplier._id': 1,
        'supplier.businessName': 1,
        'supplier.name': 1,
        createdAt: 1
      }
    });
    
    // Skip and limit for pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });
    
    const products = await Product.aggregate(pipeline);
    
    return products;
  }
  
  /**
   * Add compatibility information to products ★★
   */
  async addCompatibilityInfo(products, userVehicles) {
    return await Promise.all(
      products.map(async (product) => {
        // Check compatibility with each user vehicle
        const compatibilityResults = await Promise.all(
          userVehicles.map(vehicle =>
            compatibilityService.checkCompatibility(product, vehicle)
          )
        );
        
        // Determine overall compatibility
        const isCompatible = compatibilityResults.some(r => r.isCompatible);
        const compatibleVehicles = compatibilityResults
          .filter(r => r.isCompatible)
          .map(r => r.vehicle);
        
        return {
          ...product,
          compatibilityStatus: {
            isCompatible,
            compatibleVehicles,
            details: compatibilityResults
          }
        };
      })
    );
  }
  
  /**
   * Sort search results
   */
  sortResults(products, sortBy) {
    switch (sortBy) {
      case 'relevance':
        // Already sorted by relevanceScore from ranking service
        return products.sort((a, b) => 
          (b.relevanceScore || 0) - (a.relevanceScore || 0)
        );
      
      case 'price_asc':
        return products.sort((a, b) => a.price - b.price);
      
      case 'price_desc':
        return products.sort((a, b) => b.price - a.price);
      
      case 'rating':
        return products.sort((a, b) => 
          (b.averageRating || 0) - (a.averageRating || 0)
        );
      
      case 'popularity':
        return products.sort((a, b) => 
          (b.purchaseCount || 0) - (a.purchaseCount || 0)
        );
      
      case 'newest':
        return products.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
      
      case 'stock':
        return products.sort((a, b) => b.stock - a.stock);
      
      default:
        return products;
    }
  }
  
  /**
   * Get search suggestions for autocomplete ★★
   */
  async getSearchSuggestions(partialQuery, language = 'en', limit = 10) {
    if (partialQuery.length < 2) return [];
    
    try {
      // Method 1: Get from product names
      const nameField = `name.${language}`;
      const regex = new RegExp(partialQuery, 'i');
      
      const productSuggestions = await Product.aggregate([
        {
          $match: {
            isActive: true,
            [nameField]: regex
          }
        },
        {
          $group: {
            _id: `$${nameField}`,
            count: { $sum: 1 },
            avgRating: { $avg: '$averageRating' }
          }
        },
        { $sort: { count: -1, avgRating: -1 } },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            suggestion: '$_id',
            count: 1
          }
        }
      ]);
      
      // Method 2: Get popular queries from cache
      const popularQueries = await nlpProcessor.getPopularQueries(language, 5);
      const matchingPopular = popularQueries.filter(q => 
        q.toLowerCase().includes(partialQuery.toLowerCase())
      );
      
      // Combine and deduplicate
      const suggestions = [
        ...matchingPopular,
        ...productSuggestions.map(s => s.suggestion)
      ];
      
      // Remove duplicates and limit
      return [...new Set(suggestions)].slice(0, limit);
      
    } catch (error) {
      console.error('[AI Search] Error getting suggestions:', error);
      return [];
    }
  }
  
  /**
   * Get related searches based on current query
   */
  async getRelatedSearches(query, language, limit = 5) {
    try {
      // Process current query to extract category
      const nlpResult = await nlpProcessor.processSearchQuery(query, language);
      
      // Return popular searches in the same category
      const popularQueries = await nlpProcessor.getPopularQueries(language, limit * 2);
      
      // Filter by similar part type or brand
      const related = popularQueries.filter(q => {
        if (nlpResult.brand) {
          return q.toLowerCase().includes(nlpResult.brand.toLowerCase());
        }
        if (nlpResult.partType) {
          return q.toLowerCase().includes(nlpResult.partType.toLowerCase());
        }
        return false;
      });
      
      return related.slice(0, limit);
      
    } catch (error) {
      console.error('[AI Search] Error getting related searches:', error);
      return [];
    }
  }
}

module.exports = new AISearchService();

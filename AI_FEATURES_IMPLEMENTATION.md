ؤي# المرحلة 2: البحث الذكي - الميزة الأساسية ★★★ (أسابيع 4-6)

هذه المرحلة هي **جوهر المشروع** وتتطلب أعلى تركيز وأكبر جهد تطويري.

---

## ★★★ 2.1 خدمة معالجة اللغة الطبيعية (NLP Processor Service)

### ملف: `backend/src/services/nlpProcessorService.js`

```javascript
const { openai, prompts, callGPT4 } = require('../config/openai');
const { cacheHelper, cacheKeys } = require('../config/redis');

class NLPProcessorService {
  
  /**
   * ★★★ CORE FUNCTION: Process natural language search query using GPT-4
   * 
   * This is the heart of the intelligent search feature.
   * It takes a raw user query and extracts structured data.
   * 
   * @param {string} query - Raw search query from user
   * @param {string} language - 'ar' or 'en'
   * @returns {Object} Structured search parameters
   */
  async processSearchQuery(query, language = 'en') {
    try {
      // Step 1: Check cache first (save API costs & improve speed)
      const cacheKey = cacheKeys.aiSearch(query, language);
      const cached = await cacheHelper.get(cacheKey);
      
      if (cached) {
        console.log(`[NLP] Cache hit for query: "${query}"`);
        return { ...cached, fromCache: true };
      }
      
      // Step 2: Call OpenAI GPT-4 for NLP processing
      console.log(`[NLP] Processing query with GPT-4: "${query}"`);
      const startTime = Date.now();
      
      const messages = [
        { role: 'system', content: prompts.searchNLP.system },
        { role: 'user', content: prompts.searchNLP.user(query) }
      ];
      
      const response = await callGPT4(messages, {
        temperature: 0.3, // Low temperature for consistency
        maxTokens: 300,
        responseFormat: { type: 'json_object' }
      });
      
      const processingTime = Date.now() - startTime;
      console.log(`[NLP] GPT-4 processing completed in ${processingTime}ms`);
      
      // Step 3: Parse and validate GPT-4 response
      let result;
      try {
        result = JSON.parse(response);
      } catch (parseError) {
        console.error('[NLP] Failed to parse GPT-4 response:', parseError);
        // Fallback to keyword extraction
        return this.fallbackKeywordExtraction(query, language);
      }
      
      // Step 4: Normalize and enhance the extracted data
      const processed = {
        partType: result.partType || null,
        brand: this.normalizeBrand(result.brand),
        model: result.model || null,
        year: result.year || null,
        attributes: Array.isArray(result.attributes) ? result.attributes : [],
        intent: result.intent || 'search',
        originalQuery: query,
        language,
        confidence: this.calculateConfidence(result),
        processingTime,
        fromCache: false
      };
      
      // Step 5: Cache the result (1 hour TTL)
      await cacheHelper.set(cacheKey, processed, 3600);
      
      // Step 6: Log for analytics
      this.logSearchQuery(query, processed);
      
      return processed;
      
    } catch (error) {
      console.error('[NLP] Error processing search query:', error);
      
      // Fallback to simple keyword extraction if OpenAI fails
      return this.fallbackKeywordExtraction(query, language);
    }
  }
  
  /**
   * Normalize brand names to standardized values
   * Maps Arabic and English variations to canonical names
   */
  normalizeBrand(brand) {
    if (!brand) return null;
    
    const brandMap = {
      // Chery variations
      'chery': 'Chery',
      'شيري': 'Chery',
      'شيرى': 'Chery',
      
      // Geely variations
      'geely': 'Geely',
      'جيلي': 'Geely',
      'جيلى': 'Geely',
      
      // MG variations
      'mg': 'MG',
      'ام جي': 'MG',
      'ام جى': 'MG',
      'إم جي': 'MG',
      
      // Haval variations
      'haval': 'Haval',
      'هافال': 'Haval',
      'هافل': 'Haval',
      'هفال': 'Haval',
      
      // Great Wall variations
      'great wall': 'Great Wall',
      'greatwall': 'Great Wall',
      'جريت وول': 'Great Wall',
      'جريت ول': 'Great Wall',
      
      // Changan variations
      'changan': 'Changan',
      'chang an': 'Changan',
      'شانجان': 'Changan',
      'شانغان': 'Changan',
      'تشانجان': 'Changan',
      
      // BYD variations
      'byd': 'BYD',
      'بي واي دي': 'BYD',
      'بى واى دى': 'BYD'
    };
    
    const normalized = brandMap[brand.toLowerCase()];
    return normalized || brand;
  }
  
  /**
   * Normalize model names
   */
  normalizeModel(model, brand) {
    if (!model) return null;
    
    // Common model name mappings
    const modelMaps = {
      'Chery': {
        'tiggo': 'Tiggo',
        'تيجو': 'Tiggo',
        'arrizo': 'Arrizo',
        'اريزو': 'Arrizo'
      },
      'Geely': {
        'coolray': 'Coolray',
        'كول راي': 'Coolray',
        'emgrand': 'Emgrand',
        'امجراند': 'Emgrand'
      },
      'MG': {
        'hs': 'HS',
        'اتش اس': 'HS',
        'zs': 'ZS',
        'زد اس': 'ZS'
      },
      'Haval': {
        'jolion': 'Jolion',
        'جوليون': 'Jolion',
        'h6': 'H6',
        'اتش 6': 'H6'
      }
    };
    
    if (brand && modelMaps[brand]) {
      const normalized = modelMaps[brand][model.toLowerCase()];
      return normalized || model;
    }
    
    return model;
  }
  
  /**
   * Calculate confidence score for extraction quality (0-100)
   * Higher score means better extraction
   */
  calculateConfidence(result) {
    let score = 0;
    
    // Part type is most important (40 points)
    if (result.partType && result.partType.length > 2) {
      score += 40;
    }
    
    // Brand identification (30 points)
    if (result.brand) {
      score += 30;
    }
    
    // Model specification (20 points)
    if (result.model) {
      score += 20;
    }
    
    // Year specification (10 points)
    if (result.year && result.year >= 2000) {
      score += 10;
    }
    
    return Math.min(score, 100);
  }
  
  /**
   * Fallback keyword extraction when OpenAI fails or is unavailable
   * Uses simple pattern matching and known keywords
   */
  fallbackKeywordExtraction(query, language) {
    console.log(`[NLP] Using fallback keyword extraction for: "${query}"`);
    
    const queryLower = query.toLowerCase();
    const words = queryLower.split(/\s+/);
    
    // Known brands (English and Arabic)
    const brandKeywords = [
      'chery', 'شيري',
      'geely', 'جيلي',
      'mg', 'ام جي',
      'haval', 'هافال', 'هافل',
      'great wall', 'جريت وول',
      'changan', 'شانجان',
      'byd', 'بي واي دي'
    ];
    
    // Known part types (English and Arabic)
    const partTypeKeywords = {
      'filter': ['filter', 'فلتر', 'فيلتر'],
      'brake': ['brake', 'فرامل', 'فرملة'],
      'oil': ['oil', 'زيت'],
      'pad': ['pad', 'فحمات', 'تيل'],
      'light': ['light', 'لمبة', 'إضاءة'],
      'spark plug': ['spark plug', 'بوجيه', 'بواجي'],
      'belt': ['belt', 'سير', 'حزام'],
      'battery': ['battery', 'بطارية'],
      'tire': ['tire', 'إطار', 'كفر', 'اطار'],
      'wiper': ['wiper', 'مساحة'],
      'mirror': ['mirror', 'مرآة', 'مراية']
    };
    
    // Extract brand
    let brand = null;
    for (const keyword of brandKeywords) {
      if (queryLower.includes(keyword)) {
        brand = this.normalizeBrand(keyword);
        break;
      }
    }
    
    // Extract part type
    let partType = null;
    for (const [type, keywords] of Object.entries(partTypeKeywords)) {
      for (const keyword of keywords) {
        if (queryLower.includes(keyword)) {
          partType = type;
          break;
        }
      }
      if (partType) break;
    }
    
    // Extract year (4-digit number between 2000-2030)
    let year = null;
    const yearMatch = query.match(/\b(20[0-2]\d|2030)\b/);
    if (yearMatch) {
      year = parseInt(yearMatch[0]);
    }
    
    // Extract model (simple heuristic: capitalized word after brand)
    let model = null;
    if (brand) {
      const brandIndex = words.findIndex(w => 
        brandKeywords.some(bk => bk === w)
      );
      if (brandIndex >= 0 && brandIndex < words.length - 1) {
        model = words[brandIndex + 1];
      }
    }
    
    return {
      partType,
      brand,
      model,
      year,
      attributes: [],
      intent: 'search',
      originalQuery: query,
      language,
      confidence: 30, // Low confidence for fallback
      fromCache: false,
      isFallback: true
    };
  }
  
  /**
   * Generate search keywords for product indexing
   * Called when adding/updating products
   */
  generateSearchKeywords(product, language) {
    const keywords = new Set();
    
    // Add words from product name
    const name = product.name[language] || '';
    const nameWords = name.toLowerCase().split(/\s+/);
    nameWords.forEach(word => {
      if (word.length > 2) {
        keywords.add(word);
      }
    });
    
    // Add part number and variations
    if (product.partNumber) {
      keywords.add(product.partNumber.toLowerCase());
      // Remove hyphens and spaces
      keywords.add(product.partNumber.replace(/[-\s]/g, '').toLowerCase());
    }
    
    // Add brand and model from compatibility
    if (product.compatibility && product.compatibility.length > 0) {
      product.compatibility.forEach(compat => {
        keywords.add(compat.brand.toLowerCase());
        keywords.add(compat.model.toLowerCase());
        
        // Add Arabic equivalents
        const arabicBrand = this.getArabicBrandName(compat.brand);
        if (arabicBrand) keywords.add(arabicBrand);
      });
    }
    
    // Add category name
    if (product.category && product.category.name) {
      const catName = product.category.name[language] || '';
      catName.toLowerCase().split(/\s+/).forEach(word => {
        if (word.length > 2) keywords.add(word);
      });
    }
    
    return Array.from(keywords);
  }
  
  /**
   * Get Arabic brand name for indexing
   */
  getArabicBrandName(brand) {
    const arabicNames = {
      'Chery': 'شيري',
      'Geely': 'جيلي',
      'MG': 'ام جي',
      'Haval': 'هافال',
      'Great Wall': 'جريت وول',
      'Changan': 'شانجان',
      'BYD': 'بي واي دي'
    };
    return arabicNames[brand];
  }
  
  /**
   * Log search query for analytics and improvement
   */
  async logSearchQuery(query, processed) {
    try {
      // Log to MongoDB for analytics (create SearchLog model if needed)
      // Or log to file for later analysis
      console.log(`[NLP Analytics] Query: "${query}" | Confidence: ${processed.confidence}%`);
      
      // Increment search counter in Redis for popular queries
      const counterKey = `analytics:search:${processed.language}:${query}`;
      await cacheHelper.incr(counterKey, 86400 * 30); // 30 days TTL
      
    } catch (error) {
      console.error('[NLP] Error logging search query:', error);
    }
  }
  
  /**
   * Get popular search queries (for suggestions)
   */
  async getPopularQueries(language, limit = 10) {
    try {
      const pattern = `analytics:search:${language}:*`;
      const keys = await redis.keys(pattern);
      
      const queries = await Promise.all(
        keys.map(async (key) => {
          const count = await redis.get(key);
          const query = key.replace(`analytics:search:${language}:`, '');
          return { query, count: parseInt(count) };
        })
      );
      
      return queries
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
        .map(q => q.query);
        
    } catch (error) {
      console.error('[NLP] Error getting popular queries:', error);
      return [];
    }
  }
}

module.exports = new NLPProcessorService();
```

---

## ★★★ 2.2 خدمة البحث الذكي الرئيسية (AI Search Service)

### ملف: `backend/src/services/aiSearchService.js`

```javascript
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
        userVehicles = await Vehicle.find({ user: userId, isPrimary: true })
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
            compatibilityService.checkCompatibility(product._id, vehicle)
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
      // This could use a more sophisticated algorithm
      // For now, return popular searches in the same category
      
      // Process current query to extract category
      const nlpResult = await nlpProcessor.processSearchQuery(query, language);
      
      if (nlpResult.partType) {
        // Find popular searches for this part type
        const pattern = `analytics:search:${language}:*${nlpResult.partType}*`;
        // Implementation similar to getSearchSuggestions
      }
      
      return [];
      
    } catch (error) {
      console.error('[AI Search] Error getting related searches:', error);
      return [];
    }
  }
}

module.exports = new AISearchService();
```

---

## ★★ 2.3 خدمة الترتيب الذكي (Search Ranking Service)

### ملف: `backend/src/services/searchRankingService.js`

```javascript
/**
 * Intelligent Search Ranking Service
 * 
 * Ranks search results using multiple signals:
 * - Text relevance (from MongoDB text score)
 * - Compatibility with user's vehicles ★★★
 * - Product popularity (views, purchases)
 * - Product quality (ratings, reviews)
 * - User preferences and history
 * - Stock availability
 * - Recency
 */

class SearchRankingService {
  
  /**
   * ★★★ Main ranking function
   * 
   * @param {Array} products - Products to rank
   * @param {Object} nlpResult - NLP analysis result
   * @param {Array} userVehicles - User's vehicles
   * @param {string} userId - User ID for personalization
   * @returns {Array} Ranked products
   */
  async rankSearchResults(products, nlpResult, userVehicles = [], userId = null) {
    console.log(`[Ranking] Ranking ${products.length} products`);
    
    // Calculate relevance score for each product
    const rankedProducts = products.map(product => {
      let score = 0;
      const scoreBreakdown = {};
      
      // 1. Text relevance score (from MongoDB) - Weight: 20%
      if (product.textScore) {
        const textScore = Math.min(product.textScore, 10) * 2; // Normalize to 0-20
        score += textScore;
        scoreBreakdown.textRelevance = textScore;
      }
      
      // 2. Exact brand match - Weight: 15%
      if (nlpResult.brand && product.compatibility) {
        const brandMatch = product.compatibility.some(
          c => c.brand === nlpResult.brand
        );
        if (brandMatch) {
          score += 15;
          scoreBreakdown.brandMatch = 15;
        }
      }
      
      // 3. Exact model match - Weight: 10%
      if (nlpResult.model && product.compatibility) {
        const modelMatch = product.compatibility.some(c =>
          c.model.toLowerCase().includes(nlpResult.model.toLowerCase())
        );
        if (modelMatch) {
          score += 10;
          scoreBreakdown.modelMatch = 10;
        }
      }
      
      // 4. Year match - Weight: 5%
      if (nlpResult.year && product.compatibility) {
        const yearMatch = product.compatibility.some(c =>
          c.yearFrom <= nlpResult.year && c.yearTo >= nlpResult.year
        );
        if (yearMatch) {
          score += 5;
          scoreBreakdown.yearMatch = 5;
        }
      }
      
      // 5. ★★★ Compatibility with user's vehicle - Weight: 30% (HIGHEST)
      if (product.compatibilityStatus && product.compatibilityStatus.isCompatible) {
        score += 30;
        scoreBreakdown.vehicleCompatibility = 30;
      }
      
      // 6. Product popularity - Weight: 10%
      const popularityScore = this.calculatePopularityScore(product);
      score += popularityScore;
      scoreBreakdown.popularity = popularityScore;
      
      // 7. Product quality (rating) - Weight: 5%
      if (product.averageRating) {
        const qualityScore = (product.averageRating / 5) * 5;
        score += qualityScore;
        scoreBreakdown.quality = qualityScore;
      }
      
      // 8. Stock availability - Weight: 3%
      if (product.stock > 0) {
        score += 3;
        scoreBreakdown.availability = 3;
      }
      
      // 9. Featured product - Weight: 2%
      if (product.isFeatured) {
        score += 2;
        scoreBreakdown.featured = 2;
      }
      
      // 10. Recency boost for new products (within 30 days) - Weight: 2%
      const daysSinceCreation = (Date.now() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation <= 30) {
        const recencyScore = 2 * (1 - daysSinceCreation / 30);
        score += recencyScore;
        scoreBreakdown.recency = recencyScore;
      }
      
      return {
        ...product,
        relevanceScore: Math.round(score * 100) / 100,
        scoreBreakdown // Useful for debugging and transparency
      };
    });
    
    // Sort by relevance score (descending)
    rankedProducts.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    console.log(`[Ranking] Top 3 scores:`, rankedProducts.slice(0, 3).map(p => ({
      name: p.name.en,
      score: p.relevanceScore,
      breakdown: p.scoreBreakdown
    })));
    
    return rankedProducts;
  }
  
  /**
   * Calculate popularity score based on views and purchases
   */
  calculatePopularityScore(product) {
    const viewWeight = 0.3;
    const purchaseWeight = 0.7;
    
    // Normalize views (assume max 10000 views)
    const normalizedViews = Math.min(product.viewCount || 0, 10000) / 10000;
    
    // Normalize purchases (assume max 1000 purchases)
    const normalizedPurchases = Math.min(product.purchaseCount || 0, 1000) / 1000;
    
    // Calculate weighted popularity score (max 10 points)
    const popularityScore = 
      (normalizedViews * viewWeight + normalizedPurchases * purchaseWeight) * 10;
    
    return popularityScore;
  }
  
  /**
   * Get personalized score based on user history
   * (Can be expanded with user purchase history, preferences, etc.)
   */
  async getPersonalizationScore(product, userId) {
    if (!userId) return 0;
    
    try {
      // Check if user has purchased from this supplier before
      // Check if user has viewed similar products
      // Check user's preferred brands from their vehicles
      
      // Placeholder for future implementation
      return 0;
      
    } catch (error) {
      console.error('[Ranking] Error calculating personalization score:', error);
      return 0;
    }
  }
}

module.exports = new SearchRankingService();
```

---

## ★★ 2.4 خدمة التحقق من التوافق (Compatibility Service)

### ملف: `backend/src/services/compatibilityService.js`

```javascript
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
}

module.exports = new CompatibilityService();
```

---

**سيتم متابعة باقي المراحل في ملفات إضافية...**

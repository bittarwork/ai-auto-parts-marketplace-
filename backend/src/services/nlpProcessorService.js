const { openai, prompts, callGPT4 } = require('../config/openai');
const { cacheHelper, cacheKeys } = require('../config/redis');
const { redis } = require('../config/redis');

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
        maxTokens: 300
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
        model: this.normalizeModel(result.model, result.brand),
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
      await this.logSearchQuery(query, processed);
      
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
      'oil filter': ['filter', 'فلتر', 'فيلتر', 'oil'],
      'brake pad': ['brake', 'فرامل', 'فرملة', 'pad', 'فحمات'],
      'spark plug': ['spark', 'plug', 'بوجيه', 'بواجي'],
      'belt': ['belt', 'سير', 'حزام'],
      'battery': ['battery', 'بطارية'],
      'tire': ['tire', 'إطار', 'كفر', 'اطار'],
      'wiper': ['wiper', 'مساحة'],
      'headlight': ['light', 'لمبة', 'إضاءة', 'headlight'],
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
    
    // Extract model (simple heuristic: word after brand)
    let model = null;
    if (brand) {
      const brandIndex = words.findIndex(w => 
        brandKeywords.some(bk => bk === w)
      );
      if (brandIndex >= 0 && brandIndex < words.length - 1) {
        const nextWord = words[brandIndex + 1];
        if (!['for', 'ل', 'لل'].includes(nextWord)) {
          model = nextWord;
        }
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
      
      if (!keys || keys.length === 0) {
        return [];
      }
      
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

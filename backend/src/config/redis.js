// Redis configuration for caching AI search results and improving performance
const Redis = require('ioredis');

// Create Redis client with retry strategy
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    // Stop retrying after 3 attempts to avoid infinite loops
    if (times > 3) {
      console.log('⚠️  Redis connection failed after 3 attempts. Running without cache.');
      return null; // Stop retrying
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 1,
  enableReadyCheck: true,
  lazyConnect: true,
  enableOfflineQueue: false, // Don't queue commands when disconnected
  db: 0 // Database index (0-15)
});

let redisConnected = false;

// Event handlers for monitoring
redis.on('connect', () => {
  redisConnected = true;
  console.log('✅ Redis connected');
});

redis.on('ready', () => {
  redisConnected = true;
  console.log('✅ Redis ready to accept commands');
});

redis.on('error', (err) => {
  redisConnected = false;
  // Only log critical errors, not connection resets during retry
  if (err.code !== 'ECONNRESET' && err.code !== 'ECONNREFUSED') {
    console.error('❌ Redis error:', err.message);
  }
});

redis.on('close', () => {
  redisConnected = false;
  // Silent - no console output for expected disconnections
});

redis.on('reconnecting', () => {
  // Silent during reconnection attempts
});

// Don't auto-connect to Redis - it will connect when first used
// This makes Redis completely optional
console.log('⚠️  Redis is configured as optional. Will connect on first use.');

/**
 * Cache key generators for different features
 * Provides consistent naming convention for cache keys
 */
const cacheKeys = {
  // ★★★ AI Search cache keys
  aiSearch: (query, lang, userId = 'guest') => 
    `ai:search:${lang}:${userId}:${Buffer.from(query).toString('base64').slice(0, 50)}`,
  
  // Recommendation cache keys  
  recommendations: (userId, vehicleId = '') => 
    `ai:rec:${userId}:${vehicleId}`,
  
  // Compatibility check cache
  compatibility: (productId, vehicleId) => 
    `compat:${productId}:${vehicleId}`,
  
  // Chatbot context cache
  chatContext: (sessionId) => 
    `chat:ctx:${sessionId}`,
  
  // Product cache
  product: (productId) => 
    `product:${productId}`,
  
  // Search suggestions
  suggestions: (query, lang) => 
    `suggest:${lang}:${query.toLowerCase().slice(0, 30)}`,
  
  // User session
  userSession: (userId) => 
    `user:session:${userId}`,
  
  // Popular products
  popularProducts: (category = 'all') => 
    `popular:${category}`,
  
  // Category cache
  categories: () => 
    `categories:all`
};

/**
 * Cache helper functions
 * Provides convenient methods for caching operations
 * All functions gracefully handle Redis unavailability
 */
const cacheHelper = {
  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} Cached data or null
   */
  async get(key) {
    if (!redisConnected) return null;
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error.message);
      return null;
    }
  },
  
  /**
   * Set data in cache with TTL (Time To Live)
   * @param {string} key - Cache key
   * @param {any} value - Data to cache
   * @param {number} ttl - TTL in seconds (default: 1 hour)
   * @returns {Promise<boolean>} Success status
   */
  async set(key, value, ttl = 3600) {
    if (!redisConnected) return false;
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error.message);
      return false;
    }
  },
  
  /**
   * Delete cached data
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Success status
   */
  async del(key) {
    if (!redisConnected) return false;
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error.message);
      return false;
    }
  },
  
  /**
   * Delete multiple keys matching a pattern
   * @param {string} pattern - Pattern to match (e.g., "ai:search:*")
   * @returns {Promise<boolean>} Success status
   */
  async clearPattern(pattern) {
    if (!redisConnected) return false;
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`🗑️  Cleared ${keys.length} keys matching pattern: ${pattern}`);
      }
      return true;
    } catch (error) {
      console.error('Cache clear pattern error:', error.message);
      return false;
    }
  },
  
  /**
   * Increment counter (for analytics)
   * @param {string} key - Cache key
   * @param {number|null} ttl - TTL in seconds (optional)
   * @returns {Promise<number|null>} New value or null
   */
  async incr(key, ttl = null) {
    if (!redisConnected) return null;
    try {
      const value = await redis.incr(key);
      if (ttl) {
        await redis.expire(key, ttl);
      }
      return value;
    } catch (error) {
      console.error('Cache incr error:', error.message);
      return null;
    }
  },
  
  /**
   * Check if key exists
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Existence status
   */
  async exists(key) {
    if (!redisConnected) return false;
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error.message);
      return false;
    }
  },
  
  /**
   * Set multiple values at once
   * @param {Object} keyValuePairs - Object with key-value pairs
   * @param {number} ttl - TTL in seconds
   * @returns {Promise<boolean>} Success status
   */
  async setMultiple(keyValuePairs, ttl = 3600) {
    if (!redisConnected) return false;
    try {
      const pipeline = redis.pipeline();
      for (const [key, value] of Object.entries(keyValuePairs)) {
        pipeline.setex(key, ttl, JSON.stringify(value));
      }
      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Cache setMultiple error:', error.message);
      return false;
    }
  },
  
  /**
   * Get multiple values at once
   * @param {Array<string>} keys - Array of cache keys
   * @returns {Promise<Object>} Object with key-value pairs
   */
  async getMultiple(keys) {
    if (!redisConnected) return {};
    try {
      const values = await redis.mget(...keys);
      const result = {};
      keys.forEach((key, index) => {
        result[key] = values[index] ? JSON.parse(values[index]) : null;
      });
      return result;
    } catch (error) {
      console.error('Cache getMultiple error:', error.message);
      return {};
    }
  },
  
  /**
   * Check if Redis is connected and available
   * @returns {boolean} Connection status
   */
  isConnected() {
    return redisConnected;
  }
};

module.exports = { redis, cacheKeys, cacheHelper };

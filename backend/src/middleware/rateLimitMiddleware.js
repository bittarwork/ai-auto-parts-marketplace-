const rateLimit = require('express-rate-limit');

// Detect development environment
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

/**
 * No-op middleware for development - skips rate limiting entirely
 */
const skipLimiter = (req, res, next) => next();

/**
 * General API rate limiter
 * Applied to all /api/* routes
 * In development: disabled to avoid 429 errors during hot-reload / React StrictMode double-invocation
 */
exports.apiLimiter = isDevelopment
  ? skipLimiter
  : rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 500, // 500 requests per window in production
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        res.status(429).json({
          success: false,
          message: 'Too many requests, please try again later.'
        });
      }
    });

/**
 * Strict rate limiter for authentication routes
 * Applied to login, register, password reset
 * In development: relaxed to 100 attempts to avoid blocking during testing
 */
exports.authLimiter = isDevelopment
  ? rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      skipSuccessfulRequests: true
    })
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // Strict limit in production
      message: {
        success: false,
        message: 'Too many authentication attempts, please try again after 15 minutes.'
      },
      skipSuccessfulRequests: true
    });

/**
 * AI search rate limiter
 * In development: disabled
 */
exports.searchLimiter = isDevelopment
  ? skipLimiter
  : rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 20,
      message: {
        success: false,
        message: 'Too many searches, please slow down.'
      }
    });

/**
 * Chatbot rate limiter
 * In development: disabled
 */
exports.chatbotLimiter = isDevelopment
  ? skipLimiter
  : rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 10,
      message: {
        success: false,
        message: 'Too many messages, please slow down.'
      }
    });

/**
 * File upload rate limiter
 * In development: disabled
 */
exports.uploadLimiter = isDevelopment
  ? skipLimiter
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10,
      message: {
        success: false,
        message: 'Too many file uploads, please try again later.'
      }
    });

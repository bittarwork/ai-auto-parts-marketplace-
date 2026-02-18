const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * Applied to all /api/* routes
 */
exports.apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
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
 */
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.'
  },
  skipSuccessfulRequests: true // Don't count successful requests
});

/**
 * AI search rate limiter
 * More lenient for search operations
 */
exports.searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 searches per minute
  message: {
    success: false,
    message: 'Too many searches, please slow down.'
  }
});

/**
 * Chatbot rate limiter
 */
exports.chatbotLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 messages per minute
  message: {
    success: false,
    message: 'Too many messages, please slow down.'
  }
});

/**
 * File upload rate limiter
 */
exports.uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 uploads per 15 minutes
  message: {
    success: false,
    message: 'Too many file uploads, please try again later.'
  }
});

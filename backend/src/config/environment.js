// Environment configuration and validation
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Environment configuration object
 * Centralizes all environment variables with defaults and validation
 */
const config = {
  // Server configuration
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  
  // Database
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/chinese-auto-parts',
  },
  
  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-this',
    expire: process.env.JWT_EXPIRE || '24h',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d'
  },
  
  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY
  },
  
  // Payment gateways
  payment: {
    moyasar: {
      apiKey: process.env.MOYASAR_API_KEY,
      secretKey: process.env.MOYASAR_SECRET_KEY
    },
    tap: {
      apiKey: process.env.TAP_API_KEY
    }
  },
  
  // Email
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  
  // SMS
  sms: {
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER
  },
  
  // ML Service
  mlService: {
    url: process.env.ML_SERVICE_URL || 'http://localhost:8000'
  },
  
  // CORS - Allow multiple origins in development
  cors: {
    origin: process.env.NODE_ENV === 'development' 
      ? [
          process.env.FRONTEND_URL || 'http://localhost:5173',
          'http://localhost:5174', // Alternative Vite port
          'http://localhost:5173',
          'http://localhost:3000'
        ]
      : process.env.FRONTEND_URL || 'http://localhost:5173'
  },
  
  // File upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880, // 5MB
    path: process.env.UPLOAD_PATH || './uploads'
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
  },
  
  // Logging
  log: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log'
  },
  
  // Session
  session: {
    secret: process.env.SESSION_SECRET || 'default-session-secret'
  }
};

/**
 * Validate required environment variables
 * @throws {Error} If required variables are missing
 */
function validateConfig() {
  const errors = [];
  
  // Check critical environment variables
  if (!config.jwt.secret || config.jwt.secret === 'default-secret-change-this') {
    errors.push('JWT_SECRET must be set to a secure random string');
  }
  
  if (!config.openai.apiKey && config.env === 'production') {
    errors.push('OPENAI_API_KEY is required for production');
  }
  
  if (!config.mongodb.uri) {
    errors.push('MONGODB_URI is required');
  }
  
  // Warning for development environment
  if (config.env === 'development') {
    console.log('⚠️  Running in DEVELOPMENT mode');
    
    if (!config.openai.apiKey) {
      console.log('⚠️  OpenAI API key not set - AI features will not work');
    }
  }
  
  // Throw error if there are validation errors
  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
  
  return true;
}

/**
 * Check if running in production
 * @returns {boolean}
 */
function isProduction() {
  return config.env === 'production';
}

/**
 * Check if running in development
 * @returns {boolean}
 */
function isDevelopment() {
  return config.env === 'development';
}

/**
 * Check if running in test mode
 * @returns {boolean}
 */
function isTest() {
  return config.env === 'test';
}

module.exports = {
  config,
  validateConfig,
  isProduction,
  isDevelopment,
  isTest
};

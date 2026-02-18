const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

// Load environment variables
dotenv.config();

// Import configurations
const connectDB = require('./config/database');
const { config, validateConfig } = require('./config/environment');
const { testConnection: testOpenAI } = require('./config/openai');
// Redis will auto-connect when needed by cache operations

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');

// Import routes
const aiRoutes = require('./routes/aiRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

// Validate configuration
try {
  validateConfig();
  console.log('✅ Configuration validated');
} catch (error) {
  console.error('❌ Configuration error:', error.message);
  process.exit(1);
}

// Create Express app
const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging (only in development)
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.env
  });
});

// API routes
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Chinese Auto Parts API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      health: '/health',
      ai: '/api/ai',
      // Add more endpoints as you create them
    }
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ============================================
// SERVER INITIALIZATION
// ============================================

const PORT = config.port || 5000;

// Initialize server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Test OpenAI connection (if API key is set)
    if (config.openai.apiKey) {
      await testOpenAI();
    } else {
      console.log('⚠️  OpenAI API key not configured - AI features will not work');
    }
    
    // Start Express server
    const server = app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`🚀 Server running in ${config.env} mode on port ${PORT}`);
      console.log(`📍 Server URL: http://localhost:${PORT}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log(`🤖 AI Endpoints: http://localhost:${PORT}/api/ai`);
      console.log('='.repeat(50));
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('❌ Unhandled Promise Rejection:', err);
      // Close server & exit process
      server.close(() => process.exit(1));
    });
    
    // Handle SIGTERM signal
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Process terminated');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;

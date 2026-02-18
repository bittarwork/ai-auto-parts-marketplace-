# خطة التنفيذ الكاملة - منصة قطع غيار السيارات الصينية (MERN Stack)

## نظرة عامة
منصة تجارة إلكترونية ذكية متخصصة في قطع غيار السيارات الصينية للسوق السعودي، مع تركيز قوي على **البحث الذكي** وميزات الذكاء الاصطناعي.

**المدة:** 18 أسبوعاً  
**التقنيات الأساسية:** MongoDB, Express.js, React (Vite), Node.js, OpenAI GPT-4, Python (FastAPI), Redis

---

## البنية المعمارية

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  React + Vite SPA | Redux Toolkit | i18next | Tailwind CSS  │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS/REST
┌────────────────────▼────────────────────────────────────────┐
│                    API GATEWAY LAYER                         │
│    Express.js | JWT Auth | RBAC | Rate Limiting | CORS      │
└────┬─────────┬─────────────┬──────────────┬────────────────┘
     │         │             │              │
┌────▼─────┐ ┌▼───────────┐ ┌▼──────────┐  ┌▼──────────────┐
│  User    │ │  Product   │ │   Order   │  │   AI Services │
│ Service  │ │  Service   │ │  Service  │  │   ★★★★★★★    │
└──┬───────┘ └──┬─────────┘ └──┬────────┘  └───┬───────────┘
   │            │               │               │
   └────────────┴───────────────┴───────────────┤
                                                 │
┌────────────────────────────────────────────────▼─────────────┐
│           DATA & EXTERNAL SERVICES LAYER                      │
│  MongoDB Atlas | Redis Cache | OpenAI API | Python ML Service│
└───────────────────────────────────────────────────────────────┘
```

---

## هيكل المشروع التفصيلي

```
Source Code/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js           # MongoDB configuration
│   │   │   ├── redis.js              # Redis client & helpers
│   │   │   ├── openai.js             # OpenAI GPT-4 setup
│   │   │   └── environment.js        # Environment variables
│   │   ├── models/
│   │   │   ├── User.js               # User schema (Customer/Supplier/Admin)
│   │   │   ├── Product.js            # Product with compatibility data
│   │   │   ├── Vehicle.js            # User vehicles for compatibility
│   │   │   ├── Order.js              # Order management
│   │   │   ├── Cart.js               # Shopping cart
│   │   │   ├── Review.js             # Product reviews
│   │   │   ├── ChatSession.js        # AI chatbot sessions
│   │   │   └── Category.js           # Product categories
│   │   ├── services/          ★ BUSINESS LOGIC - AI FOCUS
│   │   │   ├── aiSearchService.js         # ★★★ Main intelligent search
│   │   │   ├── nlpProcessorService.js     # ★★★ NLP with OpenAI
│   │   │   ├── compatibilityService.js    # ★★ Auto compatibility check
│   │   │   ├── recommendationService.js   # ★★ Personalized recommendations
│   │   │   ├── chatbotService.js          # ★★ AI customer support
│   │   │   ├── searchRankingService.js    # ★★ Intelligent ranking
│   │   │   ├── productService.js
│   │   │   ├── userService.js
│   │   │   ├── orderService.js
│   │   │   └── paymentService.js
│   │   ├── controllers/
│   │   │   ├── aiSearchController.js      # ★ AI search endpoints
│   │   │   ├── chatbotController.js       # ★ Chatbot endpoints
│   │   │   ├── recommendationController.js # ★ Recommendation endpoints
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── orderController.js
│   │   │   └── adminController.js
│   │   ├── routes/
│   │   │   ├── aiRoutes.js               # ★ /api/ai/* endpoints
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js         # JWT verification
│   │   │   ├── roleMiddleware.js         # RBAC (Customer/Supplier/Admin)
│   │   │   ├── validationMiddleware.js   # express-validator
│   │   │   ├── rateLimitMiddleware.js    # API rate limiting
│   │   │   └── errorHandler.js           # Global error handler
│   │   ├── utils/
│   │   │   ├── cacheHelper.js            # Redis caching utilities
│   │   │   ├── searchIndexer.js          # Search optimization
│   │   │   ├── logger.js                 # Winston logger
│   │   │   └── validators.js
│   │   └── server.js                     # Express app entry
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── aiSearch.test.js
│   │   │   ├── compatibility.test.js
│   │   │   └── nlpProcessor.test.js
│   │   └── integration/
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── LanguageSwitcher.jsx
│   │   │   │   └── Navbar.jsx
│   │   │   ├── search/           ★ INTELLIGENT SEARCH COMPONENTS
│   │   │   │   ├── IntelligentSearchBar.jsx   # ★★★ Main search interface
│   │   │   │   ├── SearchSuggestions.jsx      # ★★ Autocomplete dropdown
│   │   │   │   ├── VoiceSearchButton.jsx      # ★ Voice input
│   │   │   │   ├── SearchFilters.jsx          # Advanced filters
│   │   │   │   ├── NLPAnalysisCard.jsx        # ★ Shows AI understanding
│   │   │   │   └── SearchHistory.jsx          # User search history
│   │   │   ├── products/
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   ├── ProductDetails.jsx
│   │   │   │   ├── ProductGrid.jsx
│   │   │   │   ├── CompatibilityBadge.jsx     # ★ Compatibility indicator
│   │   │   │   ├── RecommendedProducts.jsx    # ★ AI recommendations
│   │   │   │   └── ProductComparison.jsx
│   │   │   ├── chatbot/          ★ AI CHATBOT COMPONENTS
│   │   │   │   ├── ChatWidget.jsx             # ★★ Floating chat interface
│   │   │   │   ├── ChatMessage.jsx
│   │   │   │   ├── ChatInput.jsx
│   │   │   │   ├── QuickActions.jsx           # Pre-defined questions
│   │   │   │   └── TypingIndicator.jsx
│   │   │   ├── cart/
│   │   │   │   ├── ShoppingCart.jsx
│   │   │   │   ├── CartItem.jsx
│   │   │   │   └── CartSummary.jsx
│   │   │   ├── checkout/
│   │   │   │   ├── CheckoutFlow.jsx
│   │   │   │   ├── AddressForm.jsx
│   │   │   │   └── PaymentForm.jsx
│   │   │   └── dashboard/
│   │   │       ├── CustomerDashboard.jsx
│   │   │       ├── SupplierDashboard.jsx
│   │   │       └── AdminDashboard.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── SearchResultsPage.jsx         # ★★ AI-powered search results
│   │   │   ├── ProductDetailsPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/             ★ API COMMUNICATION LAYER
│   │   │   ├── api.js                    # Axios instance with interceptors
│   │   │   ├── authService.js
│   │   │   ├── productService.js
│   │   │   ├── aiSearchService.js        # ★★★ AI search API calls
│   │   │   ├── chatbotService.js         # ★★ Chatbot API calls
│   │   │   ├── recommendationService.js  # ★ Recommendations API
│   │   │   ├── cartService.js
│   │   │   └── orderService.js
│   │   ├── store/                ★ STATE MANAGEMENT (Redux Toolkit)
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── cartSlice.js
│   │   │   │   ├── searchSlice.js        # ★ Search state
│   │   │   │   ├── chatSlice.js          # ★ Chatbot state
│   │   │   │   ├── recommendationSlice.js # ★ Recommendations state
│   │   │   │   └── productSlice.js
│   │   │   └── store.js
│   │   ├── hooks/                ★ CUSTOM REACT HOOKS
│   │   │   ├── useDebounce.js
│   │   │   ├── useIntelligentSearch.js   # ★★ AI search hook
│   │   │   ├── useChatbot.js             # ★★ Chatbot hook
│   │   │   ├── useRecommendations.js     # ★ Recommendations hook
│   │   │   ├── useAuth.js
│   │   │   └── useCart.js
│   │   ├── i18n/
│   │   │   ├── i18n.js                   # i18next configuration
│   │   │   └── locales/
│   │   │       ├── ar/
│   │   │       │   ├── common.json
│   │   │       │   ├── search.json       # ★ Search translations
│   │   │       │   └── products.json
│   │   │       └── en/
│   │   │           ├── common.json
│   │   │           ├── search.json
│   │   │           └── products.json
│   │   ├── styles/
│   │   │   ├── index.css                 # Tailwind imports
│   │   │   ├── rtl.css                   # RTL-specific styles
│   │   │   └── components.css
│   │   ├── utils/
│   │   │   ├── formatters.js
│   │   │   └── validators.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── Dockerfile
│
├── ml-service/                   ★ PYTHON ML SERVICE (FastAPI)
│   ├── app/
│   │   ├── main.py                       # FastAPI application
│   │   ├── models/
│   │   │   ├── demand_forecast.py        # Demand prediction model
│   │   │   ├── recommendation.py         # Collaborative filtering
│   │   │   └── inventory_optimizer.py    # Stock optimization
│   │   ├── services/
│   │   │   ├── forecast_service.py
│   │   │   ├── recommendation_service.py
│   │   │   └── data_processor.py
│   │   ├── schemas/
│   │   │   ├── predictions.py            # Pydantic models
│   │   │   └── recommendations.py
│   │   ├── utils/
│   │   │   └── helpers.py
│   │   └── config.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml
├── .gitignore
├── README.md
└── IMPLEMENTATION_PLAN.md       # This file
```

---

## المرحلة 1: البنية التحتية والإعداد الأساسي (أسابيع 1-3)

### الأسبوع 1: إعداد البيئة والمستودع

#### 1.1 إنشاء هيكل المشروع

```bash
# Create project structure
mkdir "Source Code" && cd "Source Code"
mkdir backend frontend ml-service
git init
```

#### 1.2 Backend - Express.js Setup

```bash
cd backend
npm init -y

# Core dependencies
npm install express mongoose dotenv cors helmet morgan

# Authentication & Security
npm install bcryptjs jsonwebtoken express-validator express-rate-limit

# AI & Caching
npm install redis ioredis openai axios

# Utilities
npm install multer compression

# Development dependencies
npm install -D nodemon jest supertest
```

**إنشاء `backend/src/config/database.js`:**

```javascript
// MongoDB connection configuration
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

**إنشاء `backend/src/config/redis.js`:**

```javascript
// Redis configuration for caching AI search results
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true
});

// Event handlers
redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

// Cache key generators for AI features
const cacheKeys = {
  // AI Search cache keys
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
    `suggest:${lang}:${query}`
};

// Cache helper functions
const cacheHelper = {
  // Get cached data
  async get(key) {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },
  
  // Set data in cache with TTL (seconds)
  async set(key, value, ttl = 3600) {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },
  
  // Delete cached data
  async del(key) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  },
  
  // Clear pattern (e.g., "ai:search:*")
  async clearPattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Cache clear pattern error:', error);
      return false;
    }
  },
  
  // Increment counter (for analytics)
  async incr(key, ttl = null) {
    try {
      await redis.incr(key);
      if (ttl) {
        await redis.expire(key, ttl);
      }
      return true;
    } catch (error) {
      console.error('Cache incr error:', error);
      return false;
    }
  }
};

module.exports = { redis, cacheKeys, cacheHelper };
```

**إنشاء `backend/src/config/openai.js`:**

```javascript
// OpenAI GPT-4 configuration for AI features
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000, // 30 seconds
  maxRetries: 2
});

// System prompts for different AI features
const prompts = {
  // ★★★ INTELLIGENT SEARCH - NLP Query Processing ★★★
  searchNLP: {
    system: `You are an intelligent auto parts search assistant for a Chinese car parts e-commerce platform in Saudi Arabia.

Your job is to extract structured information from natural language search queries in Arabic or English.

SUPPORTED BRANDS (normalize to these exact names):
- Chery (شيري)
- Geely (جيلي) 
- MG (ام جي)
- Haval (هافال، هافل)
- Great Wall (جريت وول)
- Changan (شانجان، شانغان)
- BYD (بي واي دي)

EXTRACT THE FOLLOWING:
1. partType: Type of auto part (e.g., "brake pad", "oil filter", "headlight", "spark plug")
2. brand: Car brand from the list above (use exact English name)
3. model: Specific car model if mentioned (e.g., "Tiggo", "Coolray", "HS")
4. year: Year or year range if mentioned
5. attributes: Additional attributes like:
   - "original" or "aftermarket"
   - "front" or "rear"
   - color specifications
   - material (ceramic, metallic, etc.)
6. intent: User's intent - one of:
   - "search": Regular product search
   - "compare": Wants to compare products
   - "price_check": Asking about price
   - "availability": Checking stock
   - "help": Needs assistance

RESPOND ONLY WITH VALID JSON. NO EXPLANATIONS OR MARKDOWN.

EXAMPLES:

Input: "محتاج فلتر زيت لشيري تيجو موديل 2020"
Output: {"partType": "oil filter", "brand": "Chery", "model": "Tiggo", "year": 2020, "attributes": [], "intent": "search"}

Input: "brake pads for Geely Coolray"  
Output: {"partType": "brake pad", "brand": "Geely", "model": "Coolray", "year": null, "attributes": [], "intent": "search"}

Input: "عايز فرامل خلفية اصلية لهافال جوليون 2022"
Output: {"partType": "brake pad", "brand": "Haval", "model": "Jolion", "year": 2022, "attributes": ["original", "rear"], "intent": "search"}

Input: "headlight MG HS 2021 price"
Output: {"partType": "headlight", "brand": "MG", "model": "HS", "year": 2021, "attributes": [], "intent": "price_check"}

Input: "قارن بين فلاتر الزيت لشانجان"
Output: {"partType": "oil filter", "brand": "Changan", "model": null, "year": null, "attributes": [], "intent": "compare"}`,
    
    user: (query) => `Query: "${query}"`
  },
  
  // ★★ CHATBOT - Customer Support ★★
  chatbot: {
    system: `You are a helpful and knowledgeable customer service assistant for a Chinese auto parts e-commerce platform in Saudi Arabia.

YOUR RESPONSIBILITIES:
- Help customers find the right auto parts
- Answer compatibility questions (check if parts fit specific vehicles)
- Provide installation guidance and difficulty estimates
- Explain warranty and return policies
- Guide users through the ordering process

GUIDELINES:
1. Be concise, friendly, and professional
2. ALWAYS respond in the SAME LANGUAGE as the user (Arabic or English)
3. If you don't know something specific, say so and offer to connect to human support
4. For technical specifications, refer to product details
5. Always consider vehicle compatibility when recommending parts
6. Use simple language - avoid overly technical jargon
7. If asked about pricing, availability, or specific products, use the context provided

AVAILABLE BRANDS: Chery, Geely, MG, Haval, Great Wall, Changan, BYD

COMMON TOPICS:
- Part compatibility: "Will this part fit my car?"
- Installation: "Is this easy to install?"  
- Shipping: "How long does delivery take?"
- Returns: "What's the return policy?"
- Payment: "What payment methods do you accept?"`,
    
    contextBuilder: (chatHistory, userVehicles, currentProduct) => {
      let context = '\n\nCONTEXT:\n';
      
      if (userVehicles && userVehicles.length > 0) {
        context += `User's vehicles: ${userVehicles.map(v => 
          `${v.brand} ${v.model} (${v.year})`
        ).join(', ')}\n`;
      }
      
      if (currentProduct) {
        context += `Current product viewing: ${currentProduct.name.en} (${currentProduct.partNumber})\n`;
        context += `Price: ${currentProduct.price} ${currentProduct.currency}\n`;
        context += `In stock: ${currentProduct.stock > 0 ? 'Yes' : 'No'}\n`;
      }
      
      if (chatHistory && chatHistory.length > 0) {
        context += `\nRecent conversation:\n`;
        chatHistory.slice(-5).forEach(msg => {
          context += `${msg.role}: ${msg.content}\n`;
        });
      }
      
      return context;
    }
  },
  
  // ★ PRODUCT RECOMMENDATIONS - Content Understanding ★
  productRecommendation: {
    system: `You analyze auto part product descriptions and user preferences to generate semantic matches for recommendations.

Given a product or user query, extract key features that would be relevant for finding similar or complementary products.

Output format: JSON with keys:
- category: Main product category
- features: Array of key features
- useCase: Primary use case
- complementary: Array of product types that complement this one

Example:
Input: "Ceramic brake pads for Chery Tiggo"
Output: {"category": "brake system", "features": ["ceramic material", "Chery compatible", "Tiggo model"], "useCase": "braking performance", "complementary": ["brake discs", "brake fluid", "brake cleaner"]}`
  }
};

// Helper function to call GPT-4 with error handling
async function callGPT4(messages, options = {}) {
  try {
    const response = await openai.chat.completions.create({
      model: options.model || 'gpt-4-turbo-preview',
      messages,
      temperature: options.temperature !== undefined ? options.temperature : 0.3,
      max_tokens: options.maxTokens || 500,
      response_format: options.responseFormat || { type: 'text' }
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

// Helper to check API key validity
function checkAPIKey() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }
  return true;
}

module.exports = { openai, prompts, callGPT4, checkAPIKey };
```

**إنشاء `backend/.env.example`:**

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/chinese-auto-parts
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chinese-auto-parts

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# OpenAI (★★★ REQUIRED FOR AI FEATURES)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Payment Gateways
MOYASAR_API_KEY=
MOYASAR_SECRET_KEY=
TAP_API_KEY=

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# SMS (Optional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# ML Service
ML_SERVICE_URL=http://localhost:8000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### 1.3 Frontend - React + Vite Setup

```bash
cd ../frontend
npm create vite@latest . -- --template react
npm install

# Core dependencies
npm install react-router-dom@6 axios

# State management
npm install @reduxjs/toolkit react-redux

# Internationalization
npm install i18next react-i18next i18next-browser-languagedetector

# UI & Styling
npm install tailwindcss postcss autoprefixer
npm install @headlessui/react @heroicons/react
npm install clsx

# Form handling
npm install react-hook-form

# Development
npm install -D @vitejs/plugin-react
```

**إعداد Tailwind CSS:**

```bash
npx tailwindcss init -p
```

**تعديل `frontend/tailwind.config.js`:**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Tajawal', 'system-ui', 'sans-serif'],
        arabic: ['Tajawal', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

**إعداد i18next - `frontend/src/i18n/i18n.js`:**

```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import commonAr from './locales/ar/common.json';
import commonEn from './locales/en/common.json';
import searchAr from './locales/ar/search.json';
import searchEn from './locales/en/search.json';
import productsAr from './locales/ar/products.json';
import productsEn from './locales/en/products.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: {
        common: commonAr,
        search: searchAr,
        products: productsAr
      },
      en: {
        common: commonEn,
        search: searchEn,
        products: productsEn
      }
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
```

**إنشاء ملف ترجمة للبحث - `frontend/src/i18n/locales/ar/search.json`:**

```json
{
  "intelligentPlaceholder": "ابحث بذكاء... مثال: فلتر زيت لشيري تيجو 2020",
  "voiceSearch": "البحث الصوتي",
  "voiceSearchNotSupported": "البحث الصوتي غير مدعوم في هذا المتصفح",
  "searching": "جاري البحث...",
  "noResults": "لم يتم العثور على نتائج",
  "resultsFor": "نتائج البحث عن: {{query}}",
  "aiHint": "جرب البحث بلغة طبيعية، مثل: 'محتاج فرامل لهافال جوليون'",
  "nlpAnalysis": {
    "title": "فهمنا بحثك على أنه:",
    "partType": "نوع القطعة",
    "brand": "الماركة",
    "model": "الموديل",
    "year": "السنة",
    "intent": "الغرض"
  },
  "filters": {
    "title": "الفلاتر",
    "brand": "الماركة",
    "priceRange": "نطاق السعر",
    "inStock": "متوفر فقط",
    "rating": "التقييم",
    "clear": "مسح الفلاتر"
  },
  "sort": {
    "relevance": "الأكثر صلة",
    "priceLowHigh": "السعر: من الأقل للأعلى",
    "priceHighLow": "السعر: من الأعلى للأقل",
    "rating": "التقييم",
    "popularity": "الأكثر شعبية",
    "newest": "الأحدث"
  }
}
```

### الأسبوع 2-3: Mongoose Models والبنية الأساسية

#### 2.1 Product Model مع بيانات التوافق

**`backend/src/models/Product.js`:**

```javascript
const mongoose = require('mongoose');

// Product compatibility sub-schema - CRITICAL FOR AI FEATURES ★
const compatibilitySchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true,
    index: true,
    enum: ['Chery', 'Geely', 'MG', 'Haval', 'Great Wall', 'Changan', 'BYD']
  },
  model: {
    type: String,
    required: true,
    index: true,
    // Examples: Tiggo, Coolray, HS, Jolion, Wingle, etc.
  },
  yearFrom: {
    type: Number,
    required: true,
    min: 2000,
    max: 2030
  },
  yearTo: {
    type: Number,
    required: true,
    min: 2000,
    max: 2030
  },
  engineType: {
    type: String,
    // e.g., "1.5L Turbo", "2.0L", "Electric"
  },
  transmission: {
    type: String,
    enum: ['Manual', 'Automatic', 'CVT', 'Both']
  },
  notes: {
    ar: String,
    en: String
  }
});

// Main product schema
const productSchema = new mongoose.Schema({
  // Multi-language name and description
  name: {
    ar: {
      type: String,
      required: true,
      trim: true
    },
    en: {
      type: String,
      required: true,
      trim: true
    }
  },
  
  description: {
    ar: {
      type: String,
      trim: true
    },
    en: {
      type: String,
      trim: true
    }
  },
  
  // Unique part number
  partNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true
  },
  
  // Category reference
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true
  },
  
  // Pricing
  price: {
    type: Number,
    required: true,
    min: 0
  },
  
  currency: {
    type: String,
    enum: ['SAR', 'EUR'],
    default: 'SAR'
  },
  
  // Stock management
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  
  // Images array
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      ar: String,
      en: String
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Specifications as key-value pairs
  specifications: [{
    key: {
      ar: String,
      en: String
    },
    value: {
      ar: String,
      en: String
    }
  }],
  
  // ★★★ COMPATIBILITY DATA - Essential for AI search ★★★
  compatibility: [compatibilitySchema],
  
  // AI Search optimization keywords
  searchKeywords: {
    ar: [String],
    en: [String]
  },
  
  // For future vector search implementation
  semanticEmbedding: [Number],
  
  // Ratings and reviews aggregation
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Supplier reference
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Warranty information
  warranty: {
    months: {
      type: Number,
      min: 0
    },
    details: {
      ar: String,
      en: String
    }
  },
  
  // Installation difficulty
  installationDifficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  
  // Physical dimensions
  weight: Number, // in kg
  dimensions: {
    length: Number, // in cm
    width: Number,
    height: Number
  },
  
  // Analytics counters
  viewCount: {
    type: Number,
    default: 0
  },
  
  purchaseCount: {
    type: Number,
    default: 0
  },
  
  // Status flags
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Soft delete
  deletedAt: {
    type: Date,
    default: null
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ★★★ TEXT SEARCH INDEXES for AI-powered search ★★★
productSchema.index({
  'name.ar': 'text',
  'name.en': 'text',
  'description.ar': 'text',
  'description.en': 'text',
  'searchKeywords.ar': 'text',
  'searchKeywords.en': 'text',
  partNumber: 'text'
}, {
  weights: {
    'name.ar': 10,
    'name.en': 10,
    partNumber: 8,
    'searchKeywords.ar': 5,
    'searchKeywords.en': 5,
    'description.ar': 3,
    'description.en': 3
  },
  name: 'product_text_search'
});

// Compound indexes for performance
productSchema.index({ 'compatibility.brand': 1, 'compatibility.model': 1 });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ category: 1, averageRating: -1 });
productSchema.index({ isActive: 1, isFeatured: -1, createdAt: -1 });
productSchema.index({ supplier: 1, isActive: 1 });
productSchema.index({ purchaseCount: -1, averageRating: -1 });

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock <= this.lowStockThreshold) return 'low_stock';
  return 'in_stock';
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0] || null;
});

// Method to check compatibility with a vehicle
productSchema.methods.isCompatibleWith = function(vehicle) {
  return this.compatibility.some(compat => 
    compat.brand === vehicle.brand &&
    compat.model === vehicle.model &&
    compat.yearFrom <= vehicle.year &&
    compat.yearTo >= vehicle.year
  );
};

// Static method to find products compatible with vehicle
productSchema.statics.findCompatible = function(vehicle) {
  return this.find({
    isActive: true,
    'compatibility': {
      $elemMatch: {
        brand: vehicle.brand,
        model: vehicle.model,
        yearFrom: { $lte: vehicle.year },
        yearTo: { $gte: vehicle.year }
      }
    }
  });
};

// Pre-save middleware to ensure at least one primary image
productSchema.pre('save', function(next) {
  if (this.images && this.images.length > 0) {
    const hasPrimary = this.images.some(img => img.isPrimary);
    if (!hasPrimary) {
      this.images[0].isPrimary = true;
    }
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
```

#### 2.2 Vehicle Model للتحقق من التوافق

**`backend/src/models/Vehicle.js`:**

```javascript
const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  brand: {
    type: String,
    required: true,
    enum: ['Chery', 'Geely', 'MG', 'Haval', 'Great Wall', 'Changan', 'BYD']
  },
  
  model: {
    type: String,
    required: true
    // Examples: Tiggo, Tiggo 7, Tiggo 8, Coolray, HS, Jolion, etc.
  },
  
  year: {
    type: Number,
    required: true,
    min: 2000,
    max: new Date().getFullYear() + 1
  },
  
  engineType: {
    type: String
    // e.g., "1.5L Turbo", "2.0L", "Electric"
  },
  
  transmission: {
    type: String,
    enum: ['Manual', 'Automatic', 'CVT']
  },
  
  vin: {
    type: String,
    uppercase: true,
    trim: true
    // Vehicle Identification Number (optional)
  },
  
  nickname: {
    type: String,
    trim: true
    // User-friendly name like "My Tiggo" or "Family Car"
  },
  
  isPrimary: {
    type: Boolean,
    default: false
    // Mark one vehicle as primary for quick compatibility checks
  },
  
  mileage: {
    type: Number,
    min: 0
    // Current mileage in km
  },
  
  lastServiceDate: {
    type: Date
  },
  
  notes: {
    type: String
  }
  
}, {
  timestamps: true
});

// Index for finding user's vehicles
vehicleSchema.index({ user: 1, isPrimary: -1 });

// Ensure only one primary vehicle per user
vehicleSchema.pre('save', async function(next) {
  if (this.isPrimary && this.isModified('isPrimary')) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isPrimary: false } }
    );
  }
  next();
});

// Virtual for full vehicle name
vehicleSchema.virtual('fullName').get(function() {
  return `${this.brand} ${this.model} (${this.year})`;
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
```

#### 2.3 User Model مع الأدوار

**`backend/src/models/User.js`:**

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic info
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Don't return password by default
  },
  
  phone: {
    type: String,
    required: true
  },
  
  // Role-based access control
  role: {
    type: String,
    enum: ['customer', 'supplier', 'administrator'],
    default: 'customer',
    index: true
  },
  
  // Email verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Password reset
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Addresses
  addresses: [{
    label: String, // e.g., "Home", "Work"
    street: String,
    city: String,
    district: String,
    postalCode: String,
    country: { type: String, default: 'Saudi Arabia' },
    isDefault: { type: Boolean, default: false },
    phone: String
  }],
  
  // Supplier-specific fields
  businessName: String,
  businessLicense: String,
  taxNumber: String,
  
  // Preferences
  language: {
    type: String,
    enum: ['ar', 'en'],
    default: 'ar'
  },
  
  // JWT tokens (for refresh token rotation)
  tokens: [{
    token: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 604800 // 7 days
    }
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastLogin: Date,
  
  // Soft delete
  deletedAt: Date
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user's vehicles
userSchema.virtual('vehicles', {
  ref: 'Vehicle',
  localField: '_id',
  foreignField: 'user'
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate auth token
userSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    { userId: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
  return token;
};

module.exports = mongoose.model('User', userSchema);
```

**سيتم متابعة المراحل الأخرى في الملف التالي بسبب الطول...**

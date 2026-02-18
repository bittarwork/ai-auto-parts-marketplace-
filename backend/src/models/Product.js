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
    index: true
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
    type: String
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

// Pre-save middleware to ensure at least one primary image (async for Mongoose)
productSchema.pre('save', async function() {
  if (this.images && this.images.length > 0) {
    const hasPrimary = this.images.some(img => img.isPrimary);
    if (!hasPrimary) {
      this.images[0].isPrimary = true;
    }
  }
});

module.exports = mongoose.model('Product', productSchema);

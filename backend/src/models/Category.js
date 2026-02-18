const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  // Multi-language category name
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
  
  // Multi-language description
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
  
  // URL-friendly slug
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  // Category image/icon
  image: {
    url: String,
    alt: {
      ar: String,
      en: String
    }
  },
  
  // Hierarchical structure support
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  
  // Display order
  order: {
    type: Number,
    default: 0
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // SEO metadata
  seo: {
    title: {
      ar: String,
      en: String
    },
    description: {
      ar: String,
      en: String
    },
    keywords: {
      ar: [String],
      en: [String]
    }
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Virtual for products count
categorySchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Index for hierarchical queries
categorySchema.index({ parent: 1, order: 1 });

// Static method to get root categories
categorySchema.statics.getRootCategories = function() {
  return this.find({ parent: null, isActive: true }).sort({ order: 1 });
};

// Static method to get category with subcategories
categorySchema.statics.getWithSubcategories = async function(categoryId) {
  const category = await this.findById(categoryId).populate('subcategories');
  return category;
};

// Method to get full category path
categorySchema.methods.getPath = async function() {
  const path = [this];
  let current = this;
  
  while (current.parent) {
    current = await this.constructor.findById(current.parent);
    if (current) {
      path.unshift(current);
    }
  }
  
  return path;
};

module.exports = mongoose.model('Category', categorySchema);

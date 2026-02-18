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
    phone: String,
    latitude: Number,
    longitude: Number
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
      expires: 604800 // 7 days in seconds
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

// Hash password before saving (async hooks don't receive next - use return/throw)
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Ensure only one default address (async for consistency with Mongoose middleware)
userSchema.pre('save', async function() {
  if (this.addresses && this.addresses.length > 0) {
    const defaultAddresses = this.addresses.filter(addr => addr.isDefault);
    if (defaultAddresses.length > 1) {
      // Keep only the first one as default
      this.addresses.forEach((addr, index) => {
        addr.isDefault = (index === 0);
      });
    } else if (defaultAddresses.length === 0) {
      // Set first address as default
      this.addresses[0].isDefault = true;
    }
  }
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

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function() {
  const jwt = require('jsonwebtoken');
  const refreshToken = jwt.sign(
    { userId: this._id, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
  return refreshToken;
};

// Method to remove sensitive data
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.tokens;
  delete user.emailVerificationToken;
  delete user.passwordResetToken;
  return user;
};

module.exports = mongoose.model('User', userSchema);

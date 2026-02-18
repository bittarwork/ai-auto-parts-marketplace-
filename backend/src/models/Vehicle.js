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

  isActive: {
    type: Boolean,
    default: true
    // Soft delete: false when vehicle is deleted
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

// Ensure only one primary vehicle per user (async - no next in Mongoose)
vehicleSchema.pre('save', async function() {
  if (this.isPrimary && this.isModified('isPrimary')) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isPrimary: false } }
    );
  }
});

// Virtual for full vehicle name
vehicleSchema.virtual('fullName').get(function() {
  return `${this.brand} ${this.model} (${this.year})`;
});

// Static method to get user's primary vehicle
vehicleSchema.statics.getPrimaryVehicle = function(userId) {
  return this.findOne({ user: userId, isPrimary: true });
};

// Static method to get all user's vehicles
vehicleSchema.statics.getUserVehicles = function(userId) {
  return this.find({ user: userId }).sort({ isPrimary: -1, createdAt: -1 });
};

module.exports = mongoose.model('Vehicle', vehicleSchema);

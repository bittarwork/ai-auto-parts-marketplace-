const mongoose = require('mongoose');
const {
  EV_BRANDS,
  TRANSMISSIONS,
  DRIVETRAINS,
  CONNECTOR_TYPES,
  VOLTAGE_CLASSES
} = require('../config/evCatalog');

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
    enum: EV_BRANDS
  },
  
  model: {
    type: String,
    required: true
  },
  
  year: {
    type: Number,
    required: true,
    min: 2000,
    max: new Date().getFullYear() + 1
  },
  
  drivetrain: {
    type: String,
    enum: DRIVETRAINS
  },
  
  batteryCapacityKwh: {
    type: Number,
    min: 0
  },
  
  connectorType: {
    type: String,
    enum: CONNECTOR_TYPES
  },
  
  voltageClass: {
    type: String,
    enum: VOLTAGE_CLASSES
  },
  
  engineType: {
    type: String
  },
  
  transmission: {
    type: String,
    enum: TRANSMISSIONS
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
    // User-friendly name like "My Tesla" or "Family EV"
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

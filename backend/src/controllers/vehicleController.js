const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

/**
 * ★★★ VEHICLE CONTROLLER ★★★
 * User vehicle management for compatibility checking
 */

/**
 * Get all vehicles for current user
 * GET /api/vehicles
 * @access Private
 */
exports.getUserVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ 
      user: req.user._id,
      isActive: true
    }).sort({ isPrimary: -1, createdAt: -1 }).lean();
    
    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length
    });
    
  } catch (error) {
    console.error('[Vehicle Controller] GetUserVehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicles',
      error: error.message
    });
  }
};

/**
 * Get single vehicle by ID
 * GET /api/vehicles/:id
 * @access Private
 */
exports.getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vehicle = await Vehicle.findOne({
      _id: id,
      user: req.user._id
    }).lean();
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    res.json({
      success: true,
      data: vehicle
    });
    
  } catch (error) {
    console.error('[Vehicle Controller] GetById error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle',
      error: error.message
    });
  }
};

/**
 * Add new vehicle
 * POST /api/vehicles
 * @access Private
 */
exports.addVehicle = async (req, res) => {
  try {
    const vehicleData = {
      ...req.body,
      user: req.user._id
    };
    
    // Check if this is the first vehicle
    const existingCount = await Vehicle.countDocuments({ 
      user: req.user._id,
      isActive: true
    });
    
    // If first vehicle, make it primary
    if (existingCount === 0) {
      vehicleData.isPrimary = true;
    }
    
    // If setting as primary, remove primary from other vehicles
    if (vehicleData.isPrimary) {
      await Vehicle.updateMany(
        { user: req.user._id },
        { isPrimary: false }
      );
    }
    
    const vehicle = await Vehicle.create(vehicleData);
    
    // Update user's vehicles array
    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { vehicles: vehicle._id } }
    );
    
    res.status(201).json({
      success: true,
      message: 'Vehicle added successfully',
      data: vehicle
    });
    
  } catch (error) {
    console.error('[Vehicle Controller] Add error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding vehicle',
      error: error.message
    });
  }
};

/**
 * Update vehicle
 * PUT /api/vehicles/:id
 * @access Private
 */
exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Find vehicle
    const vehicle = await Vehicle.findOne({
      _id: id,
      user: req.user._id
    });
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    // If setting as primary, remove primary from other vehicles
    if (updates.isPrimary && !vehicle.isPrimary) {
      await Vehicle.updateMany(
        { user: req.user._id, _id: { $ne: id } },
        { isPrimary: false }
      );
    }
    
    // Update vehicle
    Object.assign(vehicle, updates);
    await vehicle.save();
    
    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle
    });
    
  } catch (error) {
    console.error('[Vehicle Controller] Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating vehicle',
      error: error.message
    });
  }
};

/**
 * Delete vehicle (soft delete)
 * DELETE /api/vehicles/:id
 * @access Private
 */
exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vehicle = await Vehicle.findOne({
      _id: id,
      user: req.user._id
    });
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    // Soft delete
    vehicle.isActive = false;
    await vehicle.save();
    
    // If was primary, set another vehicle as primary
    if (vehicle.isPrimary) {
      const nextVehicle = await Vehicle.findOne({
        user: req.user._id,
        isActive: true,
        _id: { $ne: id }
      });
      
      if (nextVehicle) {
        nextVehicle.isPrimary = true;
        await nextVehicle.save();
      }
    }
    
    // Remove from user's vehicles array
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { vehicles: id } }
    );
    
    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
    
  } catch (error) {
    console.error('[Vehicle Controller] Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting vehicle',
      error: error.message
    });
  }
};

/**
 * Set vehicle as primary
 * PATCH /api/vehicles/:id/primary
 * @access Private
 */
exports.setPrimaryVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vehicle = await Vehicle.findOne({
      _id: id,
      user: req.user._id,
      isActive: true
    });
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    // Remove primary from all other vehicles
    await Vehicle.updateMany(
      { user: req.user._id },
      { isPrimary: false }
    );
    
    // Set this vehicle as primary
    vehicle.isPrimary = true;
    await vehicle.save();
    
    res.json({
      success: true,
      message: 'Primary vehicle updated successfully',
      data: vehicle
    });
    
  } catch (error) {
    console.error('[Vehicle Controller] SetPrimary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting primary vehicle',
      error: error.message
    });
  }
};

/**
 * Get primary vehicle
 * GET /api/vehicles/primary
 * @access Private
 */
exports.getPrimaryVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      user: req.user._id,
      isPrimary: true,
      isActive: true
    }).lean();
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'No primary vehicle set'
      });
    }
    
    res.json({
      success: true,
      data: vehicle
    });
    
  } catch (error) {
    console.error('[Vehicle Controller] GetPrimary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching primary vehicle',
      error: error.message
    });
  }
};

module.exports = exports;

const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');
const { validate, vehicleRules } = require('../middleware/validationMiddleware');

/**
 * ★★★ VEHICLE ROUTES ★★★
 * User vehicle management endpoints
 */

// All vehicle routes require authentication

/**
 * @route   GET /api/vehicles
 * @desc    Get all vehicles for current user
 * @access  Private
 */
router.get('/', protect, vehicleController.getUserVehicles);

/**
 * @route   GET /api/vehicles/primary
 * @desc    Get primary vehicle
 * @access  Private
 */
router.get('/primary', protect, vehicleController.getPrimaryVehicle);

/**
 * @route   GET /api/vehicles/:id
 * @desc    Get single vehicle by ID
 * @access  Private
 */
router.get('/:id', protect, vehicleController.getVehicleById);

/**
 * @route   POST /api/vehicles
 * @desc    Add new vehicle
 * @access  Private
 */
router.post(
  '/',
  protect,
  vehicleRules,
  validate,
  vehicleController.addVehicle
);

/**
 * @route   PUT /api/vehicles/:id
 * @desc    Update vehicle
 * @access  Private
 */
router.put(
  '/:id',
  protect,
  vehicleRules,
  validate,
  vehicleController.updateVehicle
);

/**
 * @route   DELETE /api/vehicles/:id
 * @desc    Delete vehicle (soft delete)
 * @access  Private
 */
router.delete('/:id', protect, vehicleController.deleteVehicle);

/**
 * @route   PATCH /api/vehicles/:id/primary
 * @desc    Set vehicle as primary
 * @access  Private
 */
router.patch('/:id/primary', protect, vehicleController.setPrimaryVehicle);

module.exports = router;

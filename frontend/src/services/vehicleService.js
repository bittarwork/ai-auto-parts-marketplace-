import api from './api';

/**
 * Vehicle Service
 * Handles all vehicle CRUD operations for the current user
 */
const vehicleService = {
  /**
   * Get all vehicles for the logged-in user
   * @returns {Promise<Object>} List of vehicles
   */
  getVehicles() {
    return api.get('/vehicles');
  },

  /**
   * Get the primary vehicle
   * @returns {Promise<Object>} Primary vehicle data
   */
  getPrimaryVehicle() {
    return api.get('/vehicles/primary');
  },

  /**
   * Get a single vehicle by ID
   * @param {string} id - Vehicle ID
   * @returns {Promise<Object>} Vehicle data
   */
  getVehicleById(id) {
    return api.get(`/vehicles/${id}`);
  },

  /**
   * Add a new vehicle
   * @param {Object} vehicleData - Vehicle details (brand, model, year, etc.)
   * @returns {Promise<Object>} Created vehicle
   */
  addVehicle(vehicleData) {
    return api.post('/vehicles', vehicleData);
  },

  /**
   * Update an existing vehicle
   * @param {string} id - Vehicle ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated vehicle
   */
  updateVehicle(id, updates) {
    return api.put(`/vehicles/${id}`, updates);
  },

  /**
   * Delete a vehicle (soft delete)
   * @param {string} id - Vehicle ID
   * @returns {Promise<Object>} Success response
   */
  deleteVehicle(id) {
    return api.delete(`/vehicles/${id}`);
  },

  /**
   * Set a vehicle as the primary vehicle
   * @param {string} id - Vehicle ID
   * @returns {Promise<Object>} Updated vehicle
   */
  setPrimary(id) {
    return api.patch(`/vehicles/${id}/primary`, {});
  }
};

export default vehicleService;

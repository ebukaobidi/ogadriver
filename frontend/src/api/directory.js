import api from './axios';

export const directoryService = {
  /**
   * Fetch the list of verified drivers available in the directory.
   * Can accept filters like category, license_class, etc.
   */
  getDrivers: async (params = {}) => {
    const response = await api.get('/marketplace/drivers', { params });
    return response.data;
  },

  /**
   * Fetch a specific driver's public profile and safety clearance.
   */
  getDriverProfile: async (id) => {
    const response = await api.get(`/marketplace/drivers/${id}`);
    return response.data;
  },

  /**
   * Favorite a driver for easy access later.
   */
  addFavorite: async (driverId) => {
    const response = await api.post(`/favorites/${driverId}`);
    return response.data;
  },

  /**
   * Get the employer's favorited drivers.
   */
  getFavorites: async () => {
    const response = await api.get('/favorites');
    return response.data;
  },

  /**
   * Initiate a hire contract request to a driver.
   * Consumes a Platform Access Fee (handled by OPay/Moniepoint on the frontend).
   */
  initiateHire: async (driverId, contractData) => {
    // Reusing the bookings endpoint conceptually for the hire request
    const response = await api.post('/bookings', {
      driver_id: driverId,
      ...contractData
    });
    return response.data;
  }
};

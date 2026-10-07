import api from './axios';

export const directoryService = {
  /**
   * Fetch the list of verified drivers available in the directory.
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
   * Initiate an employment hire contract request to a driver.
   */
  initiateHire: async (driverId, contractData = {}) => {
    const salary = Number(contractData.proposed_salary || contractData.agreed_rate || 0);
    const payload = {
      booking_mode: 'employment',
      driver_id: driverId,
      contract_type: contractData.contract_type || 'monthly',
      start_date: contractData.start_date,
      end_date: contractData.end_date || null,
      proposed_salary: salary,
      agreed_rate: salary,
      pricing_type: contractData.contract_type === 'hourly' ? 'hourly' : 'daily',
      route_description: contractData.route_description || '',
      description: contractData.route_description || contractData.description || 'Employment hire proposal',
      title: contractData.title || 'Employment hire proposal',
      shift_preference: contractData.shift_preference || 'full_day',
      accommodation_required: !!contractData.accommodation_required,
      vehicle_required: !!contractData.vehicle_required,
      payment_cycle: contractData.payment_cycle || 'Monthly',
      vehicle_type: contractData.vehicle_type || 'van',
      pickup_location: contractData.pickup_location || 'Employer location',
      dropoff_location: contractData.dropoff_location || 'Employer location',
      pickup_time: contractData.start_date
        ? `${contractData.start_date} 08:00:00`
        : new Date().toISOString(),
    };

    const response = await api.post('/bookings', payload);
    return response.data;
  },
};

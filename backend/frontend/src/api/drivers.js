import api from './axios';

export const driverService = {
  getDrivers: async (params = {}) => {
    const response = await api.get('/drivers', { params });
    return response.data;
  },

  getDriver: async (id) => {
    const response = await api.get(`/drivers/${id}`);
    return response.data;
  },

  updateLocation: async (driverId, locationData) => {
    const response = await api.post(`/drivers/${driverId}/location`, locationData);
    return response.data;
  },

  toggleOnline: async (driverId) => {
    const response = await api.post(`/drivers/${driverId}/toggle-online`);
    return response.data;
  },

  getEarningsSummary: async (driverId) => {
    const response = await api.get(`/drivers/${driverId}/earnings-summary`);
    return response.data;
  },

  updateVehicle: async (vehicleData) => {
    const response = await api.post('/drivers/update-vehicle', vehicleData);
    return response.data;
  },

  getDocuments: async (driverId) => {
    const response = await api.get(`/drivers/${driverId}/documents`);
    return response.data;
  },

  uploadDocument: async (driverId, documentData) => {
    // Do not set Content-Type manually — axios/browser must add the multipart boundary
    const response = await api.post(`/drivers/${driverId}/documents`, documentData);
    return response.data;
  },

  getWallet: async (driverId) => {
    const response = await api.get(`/drivers/${driverId}/wallet`);
    return response.data;
  },

  deposit: async (driverId, amount) => {
    const response = await api.post(`/drivers/${driverId}/wallet/deposit`, { amount });
    return response.data;
  },

  withdraw: async (driverId, amount) => {
    const response = await api.post(`/drivers/${driverId}/wallet/withdraw`, { amount });
    return response.data;
  },

  getTransactions: async (driverId) => {
    const response = await api.get(`/drivers/${driverId}/wallet/transactions`);
    return response.data;
  },

  getProposals: async (driverId) => {
    // We use the booking endpoint but could create a specialized one. For now we fetch my-bookings and frontend filters.
    // Actually we can pass a status filter if the API supports it.
    const response = await api.get(`/my-bookings`);
    return response.data;
  },

  acceptProposal: async (proposalId) => {
    const response = await api.post(`/bookings/${proposalId}/accept`);
    return response.data;
  },

  rejectProposal: async (proposalId) => {
    const response = await api.post(`/bookings/${proposalId}/decline`);
    return response.data;
  },

  getActiveContracts: async (driverId) => {
    const response = await api.get(`/my-bookings`);
    return response.data;
  },

  getReviews: async (driverId) => {
    const response = await api.get(`/drivers/${driverId}/reviews`);
    return response.data;
  },

  updateProfile: async (driverId, data) => {
    const response = await api.put(`/drivers/${driverId}`, data);
    return response.data;
  },

  generateGuarantorCode: async (driverId, type) => {
    const response = await api.post(`/drivers/${driverId}/guarantor/generate`, { guarantor_type: type });
    return response.data;
  },

  verifyGuarantorCode: async (driverId, type, code) => {
    const response = await api.post(`/drivers/${driverId}/guarantor/verify`, { guarantor_type: type, code: code });
    return response.data;
  },

  getReferral: async (driverId) => {
    const response = await api.get(`/drivers/${driverId}/referral`);
    return response.data;
  },

  claimReferralBonus: async (driverId) => {
    const response = await api.post(`/drivers/${driverId}/referral/claim`);
    return response.data;
  }
};

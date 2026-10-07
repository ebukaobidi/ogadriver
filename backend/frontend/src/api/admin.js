import api from './axios';

// Create a configured axios helper for admin using the centralized API client
const adminAxios = {
  get: (url, config = {}) => api.get(`/admin${url.startsWith('/') ? url : `/${url}`}`, config),
  post: (url, data, config = {}) => api.post(`/admin${url.startsWith('/') ? url : `/${url}`}`, data, config),
  put: (url, data, config = {}) => api.put(`/admin${url.startsWith('/') ? url : `/${url}`}`, data, config),
  delete: (url, config = {}) => api.delete(`/admin${url.startsWith('/') ? url : `/${url}`}`, config),
};

export const adminApi = adminAxios;

export const adminService = {
  // User Management
  getUsers: async (params) => {
    const response = await adminAxios.get('/users', { params });
    return response.data;
  },
  getUserDetails: async (id) => {
    const response = await adminAxios.get(`/users/${id}`);
    return response.data;
  },
  suspendUser: async (id) => {
    const response = await adminAxios.post(`/users/${id}/suspend`);
    return response.data;
  },
  updateUser: async (id, data) => {
    const response = await adminAxios.put(`/users/${id}`, data);
    return response.data;
  },
  permabanUser: async (id) => {
    const response = await adminAxios.post(`/users/${id}/permaban`);
    return response.data;
  },
  resetUserPassword: async (id, payload = {}) => {
    const response = await adminAxios.post(`/users/${id}/reset-password`, payload);
    return response.data;
  },
  creditUserWallet: async (id, amount) => {
    const response = await adminAxios.post(`/users/${id}/credit`, { amount });
    return response.data;
  },
  updateUserRole: async (id, role_id) => {
    const response = await adminAxios.post(`/users/${id}/role`, { role_id });
    return response.data;
  },
  sendUserMessage: async (id, payload) => {
    const response = await adminAxios.post(`/users/${id}/message`, payload);
    return response.data;
  },
  manualVerifyUser: async (id) => {
    const response = await adminAxios.post(`/users/${id}/manual-verify`);
    return response.data;
  },
  resendVerificationCode: async (id, channels = ['sms', 'email']) => {
    const response = await adminAxios.post(`/users/${id}/resend-code`, { channels });
    return response.data;
  },


  // Hirer Management
  getHirers: async (params) => {
    const response = await adminAxios.get('/hirers', { params });
    return response.data;
  },
  getHirerDetails: async (id) => {
    const response = await adminAxios.get(`/hirers/${id}`);
    return response.data;
  },
  suspendHirer: async (id) => {
    const response = await adminAxios.post(`/hirers/${id}/suspend`);
    return response.data;
  },

  // Admin Management
  getAdmins: async () => {
    const response = await adminAxios.get('/admins');
    return response.data;
  },

  // Driver Management
  getDrivers: async (params) => {
    const response = await adminAxios.get('/drivers', { params });
    return response.data;
  },
  getDriverDetails: async (id) => {
    const response = await adminAxios.get(`/drivers/${id}`);
    return response.data;
  },
  updateDriver: async (id, data) => {
    const response = await adminAxios.put(`/drivers/${id}`, data);
    return response.data;
  },
  getDriverPerformance: async () => {
    const response = await adminAxios.get('/drivers-performance');
    return response.data;
  },
  getDriverVerifications: async () => {
    const response = await adminAxios.get('/drivers-verifications');
    return response.data;
  },
  approveDriver: async (id) => {
    const response = await adminAxios.post(`/drivers/${id}/approve`);
    return response.data;
  },
  rejectDriver: async (id) => {
    const response = await adminAxios.post(`/drivers/${id}/reject`);
    return response.data;
  },
  approveDocument: async (driverId, documentId) => {
    const response = await adminAxios.post(`/drivers/${driverId}/documents/${documentId}/approve`);
    return response.data;
  },
  rejectDocument: async (driverId, documentId, reason = '') => {
    const response = await adminAxios.post(`/drivers/${driverId}/documents/${documentId}/reject`, { reason });
    return response.data;
  },
  remindMissingDocuments: async (id) => {
    const response = await adminAxios.post(`/drivers/${id}/remind`);
    return response.data;
  },

  // Driver Management
  getDrivers: async () => {
    const response = await adminAxios.get('/drivers');
    return response.data;
  },

  // Job Management
  getJobs: async () => {
    const response = await adminAxios.get('/jobs');
    return response.data;
  },
  getActiveJobs: async () => {
    const response = await adminAxios.get('/jobs/active');
    return response.data;
  },
  getCompletedJobs: async () => {
    const response = await adminAxios.get('/jobs/completed');
    return response.data;
  },
  getJobDisputes: async () => {
    const response = await adminAxios.get('/jobs/disputes');
    return response.data;
  },

  // Financial Management
  getFinancials: async () => {
    const response = await adminAxios.get('/financials');
    return response.data;
  },
  getTransactions: async () => {
    const response = await adminAxios.get('/financials/transactions');
    return response.data;
  },
  getRevenueAnalytics: async () => {
    const response = await adminAxios.get('/financials/revenue');
    return response.data;
  },

  // Telemetry
  getTelemetry: async () => {
    const response = await adminAxios.get('/telemetry');
    return response.data;
  },
  getTelemetryIncidents: async () => {
    const response = await adminAxios.get('/telemetry/incidents');
    return response.data;
  },

  // Subscriptions
  getSubscriptions: async () => {
    const response = await adminAxios.get('/subscriptions');
    return response.data;
  },
  getSubscriptionPayments: async () => {
    const response = await adminAxios.get('/subscriptions/payments');
    return response.data;
  },
  getSubscriptionPlans: async (role = 'employer') => {
    const response = await adminAxios.get(`/subscriptions/plans?role=${role}`);
    return response.data;
  },
  createSubscriptionPlan: async (data) => {
    const response = await adminAxios.post('/subscriptions/plans', data);
    return response.data;
  },
  updateSubscriptionPlan: async (id, data) => {
    const response = await adminAxios.put(`/subscriptions/plans/${id}`, data);
    return response.data;
  },
  deleteSubscriptionPlan: async (id) => {
    const response = await adminAxios.delete(`/subscriptions/plans/${id}`);
    return response.data;
  },

  // Settings
  getGeneralSettings: async () => {
    const response = await adminAxios.get('/settings/general');
    return response.data;
  },
  updateGeneralSettings: async (data) => {
    const response = await adminAxios.put('/settings/general', data);
    return response.data;
  },
  getApiSettings: async () => {
    const response = await adminAxios.get('/settings/api');
    return response.data;
  },
  updateApiSettings: async (data) => {
    const response = await adminAxios.put('/settings/api', data);
    return response.data;
  },
  getNotificationSettings: async () => {
    const response = await adminAxios.get('/settings/notifications');
    return response.data;
  },
  updateNotificationSettings: async (data) => {
    const response = await adminAxios.put('/settings/notifications', data);
    return response.data;
  },

  // Cache Management
  clearCache: async (cacheType) => {
    const response = await adminAxios.post('/settings/cache/clear', { cache_type: cacheType });
    return response.data;
  },
  getCacheStatus: async () => {
    const response = await adminAxios.get('/settings/cache/status');
    return response.data;
  },

  // Content Management
  getBlogPosts: async () => {
    const response = await adminAxios.get('/content/blog');
    return response.data;
  },
  updateBlogPosts: async (data) => {
    const response = await adminAxios.put('/content/blog', data);
    return response.data;
  },
  getSiteContent: async () => {
    const response = await adminAxios.get('/content/site');
    return response.data;
  },
  updateSiteContent: async (data) => {
    const response = await adminAxios.put('/content/site', data);
    return response.data;
  },

  // Security & Audit
  getAuditLogs: async () => {
    const response = await adminAxios.get('/security/logs');
    return response.data;
  },
  getSecuritySettings: async () => {
    const response = await adminAxios.get('/security/settings');
    return response.data;
  },
  updateSecuritySettings: async (data) => {
    const response = await adminAxios.put('/security/settings', data);
    return response.data;
  },
  getBlacklist: async () => {
    const response = await adminAxios.get('/security/blacklist');
    return response.data;
  },
  addToBlacklist: async (data) => {
    const response = await adminAxios.post('/security/blacklist', data);
    return response.data;
  },
  removeFromBlacklist: async (id) => {
    const response = await adminAxios.delete(`/security/blacklist/${id}`);
    return response.data;
  }
};


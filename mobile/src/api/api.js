import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform, Alert } from 'react-native';

const Storage = {
  getItemAsync: async (key) => {
    try {
      if (Platform.OS === 'web') return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      return null;
    }
  },
  setItemAsync: async (key, value) => {
    try {
      if (Platform.OS === 'web') return typeof localStorage !== 'undefined' ? localStorage.setItem(key, value) : null;
      return await SecureStore.setItemAsync(key, value);
    } catch (e) {}
  },
  deleteItemAsync: async (key) => {
    try {
      if (Platform.OS === 'web') return typeof localStorage !== 'undefined' ? localStorage.removeItem(key) : null;
      return await SecureStore.deleteItemAsync(key);
    } catch (e) {}
  }
};

// Intelligent baseURL resolution for web/localhost vs production
const resolveBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost/ogadriver.ng/public/api';
    }
  }
  return 'https://ogadriver.ng/api';
};

const baseURL = resolveBaseUrl();

const api = axios.create({
  baseURL,
  headers: {
    'Accept': 'application/json',
  },
});

// Interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await Storage.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle 403 IP Whitelist blocks globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      // Check if it's our specific IP whitelist block or a generic 403
      const isIpBlocked = error.response.headers['x-ip-whitelist-failed'] || 
                          (error.response.data && error.response.data.error === 'Access denied');
      if (isIpBlocked) {
        import('react-native').then(({ Alert }) => {
           Alert.alert('Access Denied', 'Access from your current IP address is not permitted.');
        });
      }
    }
    return Promise.reject(error);
  }
);

// Extract array helper for Axios responses, Laravel paginators, and nested data
export const extractArray = (res) => {
  if (!res) return [];
  const d = res.data !== undefined ? res.data : res;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d.data)) return d.data;
  if (d && d.data && Array.isArray(d.data.data)) return d.data.data;
  if (d && Array.isArray(d.items)) return d.items;
  if (d && Array.isArray(d.bookings)) return d.bookings;
  if (d && Array.isArray(d.drivers)) return d.drivers;
  if (d && Array.isArray(d.jobs)) return d.jobs;
  if (d && Array.isArray(d.vehicles)) return d.vehicles;
  if (d && Array.isArray(d.transactions)) return d.transactions;
  return [];
};

export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.token) {
      await Storage.setItemAsync('auth_token', res.data.token);
      await Storage.setItemAsync('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  requestOtp: async (phone) => {
    const res = await api.post('/auth/request-otp', { phone });
    return res.data;
  },

  loginWithOtp: async (phone, code) => {
    const res = await api.post('/auth/login-otp', { phone, code });
    if (res.data.token) {
      await Storage.setItemAsync('auth_token', res.data.token);
      await Storage.setItemAsync('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  googleTokenLogin: async (idTokenOrPayload) => {
    const payload = typeof idTokenOrPayload === 'string' ? { id_token: idTokenOrPayload } : idTokenOrPayload;
    const res = await api.post('/auth/google-token', payload);
    if (res.data.token) {
      await Storage.setItemAsync('auth_token', res.data.token);
      await Storage.setItemAsync('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  completeOnboarding: async (data) => {
    const res = await api.post('/auth/onboarding', data);
    if (res.data.success && res.data.user) {
      await Storage.setItemAsync('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.log('Logout API error', e);
    }
    await Storage.deleteItemAsync('auth_token');
    await Storage.deleteItemAsync('user');
  },

  getUser: async () => {
    const userStr = await Storage.getItemAsync('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  updateUser: async (userData) => {
    try {
      await Storage.setItemAsync('user', JSON.stringify(userData));
      const res = await api.put('/user/profile', userData).catch(() => null);
      return res?.data || userData;
    } catch (e) {
      return userData;
    }
  },

  deleteAccount: async () => {
    try {
      const res = await api.delete('/user/account');
      await Storage.deleteItemAsync('auth_token');
      await Storage.deleteItemAsync('user');
      return res.data;
    } catch (e) {
      await Storage.deleteItemAsync('auth_token');
      await Storage.deleteItemAsync('user');
      throw e;
    }
  }
};

export const driverService = {
  getProfile: async (driverId) => {
    const res = await api.get(`/drivers/${driverId}`);
    return res.data;
  },

  updateProfile: async (driverId, data) => {
    const res = await api.put(`/drivers/${driverId}`, data);
    return res.data;
  },

  updateLocation: async (driverId, latitude, longitude, status = 'online') => {
    const res = await api.post(`/drivers/${driverId}/location`, {
      latitude,
      longitude,
      status,
    });
    return res.data;
  },

  toggleOnline: async (driverId) => {
    const res = await api.post(`/drivers/${driverId}/toggle-online`);
    return res.data;
  },

  getDocuments: async (driverId) => {
    const res = await api.get(`/drivers/${driverId}/documents`);
    return res.data;
  },

  getMissingDocuments: async (driverId) => {
    const res = await api.get(`/drivers/${driverId}/documents/missing`);
    return res.data;
  },

  getExpiringDocuments: async (driverId, days = 30) => {
    const res = await api.get(`/drivers/${driverId}/documents/expiring`, { params: { days } });
    return res.data;
  },

  uploadDocument: async (driverId, formData) => {
    const res = await api.post(`/drivers/${driverId}/documents`, formData);
    return res.data;
  },

  validateDocument: async (driverId, documentId) => {
    const res = await api.post(`/drivers/${driverId}/documents/${documentId}/validate`);
    return res.data;
  },

  getDocumentAlerts: async () => {
    const res = await api.get('/notifications/document-alerts');
    return res.data;
  },

  getReviews: async (driverId) => {
    const res = await api.get(`/drivers/${driverId}/reviews`);
    return res.data;
  },

  updateVehicleProfile: async (data) => {
    const res = await api.post('/drivers/update-vehicle', data);
    return res.data;
  },

  getBoostStatus: async () => {
    const res = await api.get('/drivers/boost-status');
    return res.data;
  },

  activateBoost: async (planId) => {
    const res = await api.post('/drivers/boost', { plan_id: planId });
    return res.data;
  },

  verifyNIN: async (data) => {
    const res = await api.post('/v1/verify/nin', data);
    return res.data;
  },

  verifyBankAccount: async (accountNumber, bankCode, country = 'nigeria') => {
    const res = await api.post('/v1/verify/bank-account', {
      account_number: accountNumber,
      bank_code: bankCode,
      country,
    });
    return res.data;
  },

  getNearbyActivities: async (lat, lng, radius = 25) => {
    try {
      const res = await api.get('/drivers/nearby-activities', {
        params: { lat, lng, radius_km: radius }
      });
      return res.data;
    } catch (e) {
      return { success: false, activities: [] };
    }
  },

  getJobs: async (filters = {}) => {
    const res = await api.get('/jobs', { params: filters });
    return res.data;
  },

  getAvailability: async () => {
    const res = await api.get('/driver/availability');
    return res.data;
  },

  saveAvailability: async (data) => {
    const res = await api.post('/driver/availability', data);
    return res.data;
  },

  getEarnings: async (driverId) => {
    const res = await api.get(`/drivers/${driverId}/earnings`);
    return res.data;
  },

  getEarningsSummary: async (driverId) => {
    const res = await api.get(`/drivers/${driverId}/earnings-summary`);
    return res.data;
  },
};

export const verificationService = {
  verifyNIN: async (data) => {
    const res = await api.post('/v1/verify/nin', data);
    return res.data;
  },
  verifyBankAccount: async (accountNumber, bankCode, country = 'nigeria') => {
    const res = await api.post('/v1/verify/bank-account', {
      account_number: accountNumber,
      bank_code: bankCode,
      country,
    });
    return res.data;
  },
};

export const radioService = {
  getChannels: async () => {
    const res = await api.get('/drivers/radio/channels');
    return res.data;
  },
  getStatus: async (channel = 'lagos_mainland') => {
    const res = await api.get('/drivers/radio/status', { params: { channel } });
    return res.data;
  },
  requestFloor: async (channel = 'lagos_mainland') => {
    const res = await api.post('/drivers/radio/floor/request', { channel });
    return res.data;
  },
  releaseFloor: async (channel = 'lagos_mainland') => {
    const res = await api.post('/drivers/radio/floor/release', { channel });
    return res.data;
  },
};

export const walletService = {
  getWallet: async () => {
    const res = await api.get('/wallet');
    return res.data;
  },

  topUp: async (amount) => {
    const res = await api.post('/wallet/topup', { amount });
    return res.data;
  },

  deposit: async (data) => {
    const res = await api.post('/wallet/deposit', data);
    return res.data;
  },

  withdraw: async (data) => {
    const res = await api.post('/wallet/withdraw', data);
    return res.data;
  },

  transfer: async (data) => {
    const res = await api.post('/wallet/transfer', data);
    return res.data;
  },

  lookupRecipient: async (query) => {
    const res = await api.get('/wallet/lookup', { params: { query } });
    return res.data;
  },

  getTransactions: async () => {
    const res = await api.get('/wallet');
    return res.data?.transactions || [];
  },

  verifyPayment: async (reference) => {
    const res = await api.post('/payments/verify', { reference });
    return res.data;
  },
};

export const jobService = {
  getJobs: async (filters = {}) => {
    const res = await api.get('/jobs', { params: filters });
    return res.data;
  },

  getJob: async (jobId) => {
    const res = await api.get(`/jobs/${jobId}`);
    return res.data;
  },

  applyForJob: async (jobId, data) => {
    const res = await api.post(`/jobs/${jobId}/apply`, data);
    return res.data;
  },

  getMyApplications: async () => {
    const res = await api.get('/driver/proposals');
    return res.data;
  },

  createJob: async (data) => {
    const res = await api.post('/jobs', data);
    return res.data;
  },

  signNda: async (jobId, signatureData) => {
    const res = await api.post(`/jobs/${jobId}/sign-nda`, signatureData);
    return res.data;
  },
};

export const corporateFleetService = {
  getVipFleet: async () => {
    const res = await api.get('/corporate/vip-fleet');
    return res.data;
  },

  bookVipFleet: async (data) => {
    const res = await api.post('/corporate/vip-book', data);
    return res.data;
  },
};

export const bookingService = {
  acceptProposal: async (bookingId) => {
    const res = await api.post(`/bookings/${bookingId}/accept`);
    return res.data;
  },
  rejectProposal: async (bookingId, reason) => {
    const res = await api.post(`/bookings/${bookingId}/decline`, { reason });
    return res.data;
  },
  getMyBookings: async () => {
    const res = await api.get('/bookings/my');
    return res.data;
  },

  searchDrivers: async (filters) => {
    const res = await api.post('/bookings/search-drivers', filters);
    return res.data;
  },

  createBooking: async (data) => {
    const res = await api.post('/bookings', data);
    return res.data;
  },

  acceptBooking: async (bookingId) => {
    const res = await api.post(`/bookings/${bookingId}/accept`);
    return res.data;
  },

  declineBooking: async (bookingId, reason) => {
    const res = await api.post(`/bookings/${bookingId}/decline`, { reason });
    return res.data;
  },

  startBooking: async (bookingId) => {
    const res = await api.post(`/bookings/${bookingId}/start`);
    return res.data;
  },

  completeBooking: async (bookingId) => {
    const res = await api.post(`/bookings/${bookingId}/complete`);
    return res.data;
  },

  cancelBooking: async (bookingId, reason) => {
    const res = await api.post(`/bookings/${bookingId}/cancel`, { reason });
    return res.data;
  },

  generateSecurityPin: async (bookingId) => {
    const res = await api.post(`/bookings/${bookingId}/security-pin`);
    return res.data;
  },

  verifySecurityPin: async (bookingId, pin) => {
    const res = await api.post(`/bookings/${bookingId}/verify-pin`, { pin });
    return res.data;
  },
};

export const referralService = {
  getReferral: async () => {
    const res = await api.get('/referral');
    return res.data;
  },
  claimBonus: async () => {
    const res = await api.post('/referral/claim');
    return res.data;
  },
  withdraw: async () => {
    const res = await api.post('/referral/withdraw');
    return res.data;
  },
};

export const simulatorService = {
  getModules: async () => {
    try {
      const res = await api.get('/drivers/simulator/modules');
      return res.data;
    } catch (e) {
      try {
        const fallback = await api.get('/driver/simulator/modules');
        return fallback.data;
      } catch (err) {
        return null;
      }
    }
  },
  getQuestions: async (moduleId = 1) => {
    try {
      const res = await api.get(`/drivers/simulator/questions?module_id=${moduleId}`);
      return res.data;
    } catch (e) {
      try {
        const fallback = await api.get(`/driver/simulator/questions?module_id=${moduleId}`);
        return fallback.data;
      } catch (err) {
        return null;
      }
    }
  },
  saveResult: async (score, difficulty = 'beginner') => {
    const payload = {
      score: parseInt(score, 10),
      difficulty: String(difficulty).toLowerCase(),
    };
    try {
      const res = await api.post('/drivers/simulator/result', payload);
      return res.data;
    } catch (e) {
      try {
        const fallback = await api.post('/driver/simulator/result', payload);
        return fallback.data;
      } catch (err) {
        return null;
      }
    }
  },
  getLeaderboard: async (difficulty = 'all') => {
    try {
      const res = await api.get(`/drivers/simulator/leaderboard?difficulty=${difficulty}`);
      return res.data;
    } catch (e) {
      try {
        const fallback = await api.get(`/driver/simulator/leaderboard?difficulty=${difficulty}`);
        return fallback.data;
      } catch (err) {
        return null;
      }
    }
  },
  getCertificate: async () => {
    try {
      const res = await api.get('/drivers/simulator/certificate');
      return res.data;
    } catch (e) {
      try {
        const fallback = await api.get('/driver/simulator/certificate');
        return fallback.data;
      } catch (err) {
        return null;
      }
    }
  },
};

export { api };
export default api;



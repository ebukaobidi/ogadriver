import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// For Android emulator, localhost is 10.0.2.2. For iOS it's localhost or your machine's IP.
const baseURL = 'https://ogadriver.ng/api';

const api = axios.create({
  baseURL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.token) {
      await SecureStore.setItemAsync('auth_token', res.data.token);
      await SecureStore.setItemAsync('user', JSON.stringify(res.data.user));
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
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user');
  },

  getUser: async () => {
    const userStr = await SecureStore.getItemAsync('user');
    return userStr ? JSON.parse(userStr) : null;
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

  uploadDocument: async (driverId, formData) => {
    const res = await api.post(`/drivers/${driverId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getReviews: async (driverId) => {
    const res = await api.get(`/drivers/${driverId}/reviews`);
    return res.data;
  },
};

export const walletService = {
  getWallet: async () => {
    const res = await api.get('/wallet');
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

  getTransactions: async () => {
    const res = await api.get('/wallet/transactions');
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
    const res = await api.get('/my-applications');
    return res.data;
  },
};

export const bookingService = {
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

export default api;

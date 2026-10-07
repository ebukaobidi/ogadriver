import api from './axios';
import axios from 'axios';

export const authService = {
  getCsrfCookie: async () => {
    let baseUrl = api.defaults.baseURL || '';
    let csrfUrl = '/sanctum/csrf-cookie';
    if (baseUrl.startsWith('http')) {
      const rootUrl = baseUrl.replace(/\/api$/, '');
      await axios.get(`${rootUrl}${csrfUrl}`, { withCredentials: true });
    } else {
      await axios.get(csrfUrl, { withCredentials: true });
    }
  },

  login: async (email, password) => {
    try {
      await authService.getCsrfCookie();
      console.log('Attempting login to:', '/auth/login');
      console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        if (response.data.token) {
          localStorage.setItem('auth_token', response.data.token);
        }
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  requestOtp: async (phone) => {
    await authService.getCsrfCookie();
    const response = await api.post('/auth/request-otp', { phone });
    return response.data;
  },

  loginWithOtp: async (phone, code) => {
    await authService.getCsrfCookie();
    const response = await api.post('/auth/login-otp', { phone, code });
    if (response.data.success && response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
    }
    return response.data;
  },

  register: async (userData) => {
    await authService.getCsrfCookie();
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  verify: async (identity, code) => {
    await authService.getCsrfCookie();
    const response = await api.post('/auth/verify', { identity, code });
    if (response.data.success && response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
    }
    return response.data;
  },

  // Apply default subscription (trial or pre‑pay) based on role
  applyDefaultPlan: async (role) => {
    await authService.getCsrfCookie();
    const response = await api.post('/auth/default-plan', { role });
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    sessionStorage.clear();
    // Force full page reload to /login to avoid blank screen from stale React state
    window.location.href = '/login';
  },

  getUser: () => {
    try {
      const user = localStorage.getItem('user');
      if (!user || user === 'undefined' || user === 'null') return null;
      const parsed = JSON.parse(user);
      if (parsed && typeof parsed.role === 'object' && parsed.role !== null) {
        parsed.role = parsed.role.slug || parsed.role.name || '';
      }
      return parsed;
    } catch (e) {
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem('auth_token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('user') || !!localStorage.getItem('auth_token');
  },

  googleLogin: () => {
    // Determine the root backend URL from the API base URL
    let rootUrl = (api.defaults.baseURL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '');
    if (rootUrl && rootUrl.startsWith('http')) {
      window.location.href = `${rootUrl}/auth/google`;
    } else {
      window.location.href = `${window.location.origin}/auth/google`;
    }
  },

  completeOnboarding: async (data) => {
    const response = await api.post('/auth/onboarding', data);
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  uploadAvatar: async (formData) => {
    // Let browser set multipart boundary automatically
    const response = await api.post('/auth/avatar', formData);
    // Update local storage user if successful
    if (response.data.success && response.data.url) {
      const user = authService.getUser();
      if (user) {
        const type = formData.get('type') || 'primary';
        if (type === 'primary') user.avatar = response.data.url;
        else if (type === 'secondary') user.avatar_secondary = response.data.url;
        else if (type === 'tertiary') user.avatar_tertiary = response.data.url;
        localStorage.setItem('user', JSON.stringify(user));
      }
    }
    return response.data;
  },
};

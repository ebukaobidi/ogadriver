import axios from 'axios';

// Resolve API base URL - fall back to same-origin /api for production safety
const envUrl = import.meta.env.VITE_API_BASE_URL;
let API_BASE_URL = (envUrl && envUrl !== 'undefined') ? envUrl : '/api';

// If running in browser and NOT on the production domain (e.g. localhost, 127.0.0.1),
// prioritize relative '/api' to avoid cross-origin and local/prod mismatch issues.
if (typeof window !== 'undefined' && window.location.hostname !== 'ogadriver.ng' && window.location.hostname !== 'www.ogadriver.ng') {
  API_BASE_URL = '/api';
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Try to get token from localStorage (for Google OAuth)
    let token = localStorage.getItem('auth_token');
    
    // If no token in auth_token, try to get it from user object (for regular login)
    if (!token) {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          // Note: Sanctum tokens are stored differently, this is a fallback
        } catch (e) {
          // Invalid user data
        }
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Let the browser set multipart boundary for FormData uploads.
    // A hardcoded Content-Type: multipart/form-data without boundary breaks file parsing.
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (config.headers && typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type');
      } else if (config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const isAuthRoute = currentPath.startsWith('/login') || currentPath.startsWith('/admin/login');
        
        if (!isAuthRoute && !window._isAuthRedirecting) {
          window._isAuthRedirecting = true;
          const target = currentPath.startsWith('/admin') ? '/admin/login' : '/login';
          window.location.href = target;
        }
      }
    } else if (error.response?.status === 403) {
      const respData = error.response?.data;
      const isImunifyBlocked = 
        (typeof respData === 'string' && respData.includes('Imunify360')) ||
        error.response?.headers['x-imunify360-bot-protection'] ||
        (respData?.message && respData.message.includes('Imunify360'));

      if (isImunifyBlocked) {
        console.warn('Imunify360 WAF Bot Protection triggered:', error.response);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

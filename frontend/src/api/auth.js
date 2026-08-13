import api from './axios';

export const authService = {
  login: async (email, password) => {
    try {
      console.log('Attempting login to:', '/auth/login');
      console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      if (response.data.success) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.success) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  getUser: () => {
    try {
      const user = localStorage.getItem('user');
      if (user === 'undefined' || user === 'null') return null;
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token') && !!localStorage.getItem('user');
  },

  googleLogin: () => {
    let apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl || apiUrl === 'undefined') {
      let baseUrl = import.meta.env.VITE_API_BASE_URL;
      if (baseUrl && baseUrl !== 'undefined') {
        apiUrl = baseUrl.replace('/api', '');
      } else {
        apiUrl = 'http://localhost:8000';
      }
    }
    window.location.href = `${apiUrl}/auth/google`;
  },

  completeOnboarding: async (data) => {
    const response = await api.post('/auth/onboarding', data);
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  uploadAvatar: async (formData) => {
    const response = await api.post('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
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

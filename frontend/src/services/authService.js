import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async logout() {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } finally {
      localStorage.removeItem('farmlink_token');
      localStorage.removeItem('farmlink_user');
    }
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

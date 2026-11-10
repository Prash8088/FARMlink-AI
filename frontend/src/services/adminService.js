import api from './api';

export const adminService = {
  async getDashboard() {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  async getUsers(params = {}) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async updateUserStatus(userId, isActive) {
    const response = await api.patch(`/admin/users/${userId}/status`, { isActive });
    return response.data;
  },

  async getStatistics() {
    const response = await api.get('/admin/statistics');
    return response.data;
  }
};

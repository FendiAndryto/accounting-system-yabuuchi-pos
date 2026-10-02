import { request, API_BASE } from './apiClient';

export const userService = {
  async getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await request(`${API_BASE}/users${query ? `?${query}` : ''}`);
  },

  async createUser(data) {
    return await request(`${API_BASE}/users`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateUser(id, data) {
    return await request(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async resetPassword(id, password) {
    return await request(`${API_BASE}/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },

  async toggleStatus(id) {
    return await request(`${API_BASE}/users/${id}/toggle-status`, {
      method: 'PATCH',
    });
  },
};

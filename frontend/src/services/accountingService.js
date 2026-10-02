import { request, API_BASE } from './apiClient';

export const accountingService = {
  // Accounts
  async getAccounts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await request(`${API_BASE}/accounts${query ? `?${query}` : ''}`);
  },

  async createAccount(data) {
    return await request(`${API_BASE}/accounts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateAccount(id, data) {
    return await request(`${API_BASE}/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async toggleAccountStatus(id) {
    return await request(`${API_BASE}/accounts/${id}/toggle-status`, {
      method: 'PATCH',
    });
  },

  async deleteAccount(id) {
    return await request(`${API_BASE}/accounts/${id}`, {
      method: 'DELETE',
    });
  },

  // Categories
  async getCategories(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await request(`${API_BASE}/categories${query ? `?${query}` : ''}`);
  },

  async createCategory(data) {
    return await request(`${API_BASE}/categories`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCategory(id, data) {
    return await request(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async toggleCategoryStatus(id) {
    return await request(`${API_BASE}/categories/${id}/toggle-status`, {
      method: 'PATCH',
    });
  },

  async deleteCategory(id) {
    return await request(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
    });
  },

  // Transactions
  async getTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await request(`${API_BASE}/transactions${query ? `?${query}` : ''}`);
    const txList = Array.isArray(res?.transactions)
      ? res.transactions
      : Array.isArray(res?.transactions?.data)
      ? res.transactions.data
      : [];
    return {
      ...res,
      transactions: txList,
    };
  },

  async createTransaction(data) {
    return await request(`${API_BASE}/transactions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTransaction(id, data) {
    return await request(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTransaction(id) {
    return await request(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE',
    });
  },

  // Financial Overview
  async getFinancialOverview() {
    return await request(`${API_BASE}/financial-overview`);
  },
};

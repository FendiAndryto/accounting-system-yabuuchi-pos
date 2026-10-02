import { request, API_AUTH, storage, STORAGE_TOKEN_KEY, STORAGE_USER_KEY } from './apiClient';

export const authService = {
  async login(email, password) {
    const data = await request(`${API_AUTH}/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data?.token && data?.user) {
      storage.set(STORAGE_TOKEN_KEY, data.token);
      storage.set(STORAGE_USER_KEY, JSON.stringify(data.user));
    }

    return data;
  },

  async me() {
    return await request(`${API_AUTH}/me`, { method: 'GET' });
  },

  async logout() {
    try {
      await request(`${API_AUTH}/logout`, { method: 'POST' });
    } catch (e) {
      console.warn('Logout API failed, continuing with local cleanup:', e);
    } finally {
      storage.remove(STORAGE_TOKEN_KEY);
      storage.remove(STORAGE_USER_KEY);
    }
  },

  getStoredToken() {
    return storage.get(STORAGE_TOKEN_KEY);
  },

  getStoredUser() {
    const raw = storage.get(STORAGE_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
};

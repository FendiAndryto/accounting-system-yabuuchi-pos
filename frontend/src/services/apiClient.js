const API_HOST = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';
export const API_AUTH = `${API_HOST}/api/auth`;
export const API_BASE = `${API_HOST}/api/v1`;

export const STORAGE_TOKEN_KEY = 'aube_accounting_token';
export const STORAGE_USER_KEY = 'aube_accounting_user';

export const storage = {
  get(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    return null;
  },
  set(key, value) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  },
  remove(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('Storage remove error:', e);
    }
  },
};

export async function request(url, options = {}) {
  const token = storage.get(STORAGE_TOKEN_KEY);
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg =
      data?.message ||
      (data?.errors ? Object.values(data.errors).flat().join('\n') : `Permintaan gagal (Status ${response.status})`);
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  const checkAuth = async () => {
    try {
      const storedToken = authService.getStoredToken();
      const storedUser = authService.getStoredUser();

      if (storedToken && storedUser) {
        setAuthToken(storedToken);
        setUser(storedUser);

        // Verify with server in background
        try {
          const res = await authService.me();
          if (res?.user) {
            setUser(res.user);
          }
        } catch (e) {
          // If 401 or token invalid, clear
          if (e.status === 401) {
            await authService.logout();
            setUser(null);
            setAuthToken(null);
          }
        }
      }
    } catch (e) {
      console.warn('Auth check error:', e);
    } finally {
      setAuthChecking(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res?.token && res?.user) {
      setAuthToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setAuthToken(null);
  };

  const value = {
    user,
    authToken,
    isAuthenticated: !!user && !!authToken,
    isAdmin: user?.role === 'admin',
    authChecking,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

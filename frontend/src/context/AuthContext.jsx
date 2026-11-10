import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('farmlink_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('farmlink_token') || null);
  const [loading, setLoading] = useState(true);

  // Synchronize authentication status with server on initial mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('farmlink_token');
        if (storedToken) {
          const res = await authService.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('farmlink_user', JSON.stringify(res.data));
          }
        }
      } catch (err) {
        console.warn('[Auth] Session validation failed or expired:', err.message);
        setUser(null);
        setToken(null);
        localStorage.removeItem('farmlink_token');
        localStorage.removeItem('farmlink_user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('farmlink_token', res.token);
      localStorage.setItem('farmlink_user', JSON.stringify(res.user));
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('farmlink_token', res.token);
      localStorage.setItem('farmlink_user', JSON.stringify(res.user));
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('[Auth] Error while logging out:', err.message);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('farmlink_token');
      localStorage.removeItem('farmlink_user');
    }
  };

  const updateUser = useCallback((updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('farmlink_user', JSON.stringify(updatedUserData));
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('farmlink_user', JSON.stringify(res.data));
        return res.data;
      }
    } catch (err) {
      console.error('[Auth] Failed to refresh user profile:', err);
    }
    return null;
  }, []);

  const getRoleDashboardPath = (role = user?.role) => {
    switch (role) {
      case 'farmer':
        return '/dashboard/farmer';
      case 'buyer':
        return '/dashboard/buyer';
      case 'transporter':
        return '/dashboard/transporter';
      case 'admin':
        return '/dashboard/admin';
      default:
        return '/login';
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    isFarmer: user?.role === 'farmer',
    isBuyer: user?.role === 'buyer',
    isTransporter: user?.role === 'transporter',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    getRoleDashboardPath
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

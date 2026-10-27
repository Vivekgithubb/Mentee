import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

// Specific legacy application-owned storage keys that previously stored plaintext credentials or tokens
const INSECURE_APPLICATION_STORAGE_KEYS = [
  'mentee_jwt_token',
  'SignupForm',
  'token',
  'user',
  'dealroom_session_id'
];

/**
 * Safe cleanup of legacy sensitive keys.
 * Removes only known application keys without clearing unrelated origin keys.
 */
const purgeLegacyInsecureStorage = () => {
  try {
    INSECURE_APPLICATION_STORAGE_KEYS.forEach((key) => {
      if (typeof window !== 'undefined') {
        if (window.localStorage && window.localStorage.getItem(key) !== null) {
          window.localStorage.removeItem(key);
        }
        if (window.sessionStorage && window.sessionStorage.getItem(key) !== null) {
          window.sessionStorage.removeItem(key);
        }
      }
    });
  } catch (err) {
    console.warn('Storage migration notice:', err);
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from HttpOnly cookie via GET /api/auth/me
  const checkAuthStatus = useCallback(async () => {
    // 1. Purge legacy insecure storage keys on application startup
    purgeLegacyInsecureStorage();

    try {
      const res = await api.auth.getMe();
      if (res.success && res.user) {
        setCurrentUser(res.user);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      // Session expired or no valid HttpOnly cookie
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    if (res.success && res.user) {
      // Clear any legacy keys that might have been created
      purgeLegacyInsecureStorage();
      setCurrentUser(res.user);
      return res.user;
    }
    throw new Error(res.error || 'Authentication failed');
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    if (res.success && res.user) {
      purgeLegacyInsecureStorage();
      setCurrentUser(res.user);
      return res.user;
    }
    throw new Error(res.error || 'Registration failed');
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      console.warn('Logout notification error:', e);
    } finally {
      purgeLegacyInsecureStorage();
      setCurrentUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        register,
        logout,
        refreshSession: checkAuthStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

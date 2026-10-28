import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  api,
  setStoredToken,
  clearStoredToken,
  getStoredToken,
  getStoredUser,
  setStoredUser,
  clearStoredUser
} from '../services/api';

const AuthContext = createContext(null);

// Specific legacy application-owned storage keys that previously stored plaintext credentials or tokens
const INSECURE_APPLICATION_STORAGE_KEYS = [
  'SignupForm',
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
  // Synchronously initialize user identity from persistent storage so F5/refresh never kicks to /login
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(() => !getStoredUser());

  // Restore & re-validate session via GET /api/auth/me (supports Authorization Bearer + HttpOnly cookies)
  const checkAuthStatus = useCallback(async () => {
    // 1. Purge legacy insecure storage keys on application startup
    purgeLegacyInsecureStorage();

    const token = getStoredToken();
    if (!token && !getStoredUser()) {
      clearStoredToken();
      clearStoredUser();
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.auth.getMe();
      if (res.success && res.user) {
        setStoredUser(res.user);
        setCurrentUser(res.user);
      } else {
        clearStoredToken();
        clearStoredUser();
        setCurrentUser(null);
      }
    } catch (err) {
      const msg = String(err?.message || '');
      // Only clear session if explicitly unauthenticated (401 / expired session)
      if (msg.includes('401') || msg.includes('Not authenticated') || msg.includes('Session expired')) {
        clearStoredToken();
        clearStoredUser();
        setCurrentUser(null);
      }
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
      purgeLegacyInsecureStorage();
      setStoredUser(res.user);
      setCurrentUser(res.user);
      return res.user;
    }
    throw new Error(res.error || 'Authentication failed');
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    if (res.success && res.user) {
      purgeLegacyInsecureStorage();
      setStoredUser(res.user);
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
      clearStoredToken();
      clearStoredUser();
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

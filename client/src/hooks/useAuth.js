import { useCallback } from 'react';

/**
 * useAuth Hook
 * Manages authentication token and user state
 */
export function useAuth() {
  const getToken = useCallback(() => {
    return localStorage.getItem('eztutor_token');
  }, []);

  const getUser = useCallback(() => {
    const userStr = localStorage.getItem('eztutor_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }, []);

  const isAuthenticated = useCallback(() => {
    return !!getToken();
  }, [getToken]);

  const setAuth = useCallback((token, user = null) => {
    localStorage.setItem('eztutor_token', token);
    if (user) {
      localStorage.setItem('eztutor_user', JSON.stringify(user));
    }
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('eztutor_token');
    localStorage.removeItem('eztutor_user');
    localStorage.removeItem('pendingExport');
  }, []);

  return {
    getToken,
    getUser,
    isAuthenticated,
    setAuth,
    clearAuth,
    token: getToken(),
  };
}

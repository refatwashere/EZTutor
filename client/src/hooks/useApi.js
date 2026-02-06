import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

/**
 * useApi Hook
 * Handles data fetching with built-in token management and error handling
 */
export function useApi(url, options = {}) {
  const { getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        baseURL: process.env.REACT_APP_API_BASE || '',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [url, options, getToken]);

  useEffect(() => {
    if (options.skip) return;
    fetchData();
  }, [url, fetchData, options.skip]);

  return { data, loading, error, refetch: fetchData };
}

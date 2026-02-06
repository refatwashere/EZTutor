/**
 * Server-side helper utilities
 */

/**
 * Normalize email to lowercase and trim whitespace
 */
export const normalizeEmail = (email) => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

/**
 * Format error response for consistency
 */
export const formatErrorResponse = (message, statusCode = 500, details = null) => {
  return {
    error: message,
    ...(details && { details }),
    statusCode,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Format success response for consistency
 */
export const formatSuccessResponse = (data, meta = null) => {
  return {
    success: true,
    data,
    ...(meta && { meta }),
    timestamp: new Date().toISOString(),
  };
};

/**
 * Safe JSON parse with fallback
 */
export const safeJsonParse = (json, fallback = null) => {
  try {
    return JSON.parse(json);
  } catch (err) {
    console.warn('JSON parse error:', err);
    return fallback;
  }
};

/**
 * Safe JSON stringify
 */
export const safeJsonStringify = (obj, replacer = null, space = 2) => {
  try {
    return JSON.stringify(obj, replacer, space);
  } catch (err) {
    console.warn('JSON stringify error:', err);
    return null;
  }
};

/**
 * Generate random string for tokens/ids
 */
export const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Delay execution (for testing/debugging)
 */
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Merge arrays without duplicates
 */
export const mergeDedupArrays = (arr1, arr2, key = 'id') => {
  const map = new Map();
  [...arr1, ...arr2].forEach((item) => {
    map.set(item[key], item);
  });
  return Array.from(map.values());
};

/**
 * Group array by key
 */
export const groupBy = (array, keyFn) => {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
    return result;
  }, {});
};

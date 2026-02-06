/**
 * Server-side constants and configuration
 */

// Server Configuration
export const SERVER = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_PREFIX: '/api',
};

// Database
export const DB = {
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Authentication
export const AUTH = {
  JWT_EXPIRES_IN: '24h',
  PASSWORD_MIN_LENGTH: 8,
  BCRYPT_ROUNDS: 10,
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes
};

// Rate Limiting
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  AUTH_MAX_REQUESTS: 5,
  AUTH_WINDOW_MS: 15 * 60 * 1000,
};

// Groq API
export const GROQ = {
  API_KEY: process.env.GROQ_API_KEY,
  MODEL: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
  TIMEOUT_MS: parseInt(process.env.GROQ_TIMEOUT_MS || '20000'),
  MAX_RETRIES: parseInt(process.env.GROQ_MAX_RETRIES || '2'),
};

// Google Drive Integration
export const GOOGLE = {
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback',
  SCOPES: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
  ],
};

// Export Queue
export const EXPORT_QUEUE = {
  WORKER_INTERVAL: 30000, // 30 seconds
  MAX_RETRIES: 144, // ~24 hours with exponential backoff
  INITIAL_DELAY: 60000, // 1 minute
  MAX_DELAY: 3600000, // 1 hour
};

// Encryption
export const ENCRYPTION = {
  KEY: process.env.ENCRYPTION_KEY,
  ALGORITHM: 'aes-256-cbc',
};

// API Response
export const API = {
  SUCCESS_CODE: 200,
  CREATED_CODE: 201,
  BAD_REQUEST_CODE: 400,
  UNAUTHORIZED_CODE: 401,
  FORBIDDEN_CODE: 403,
  NOT_FOUND_CODE: 404,
  CONFLICT_CODE: 409,
  SERVER_ERROR_CODE: 500,
};

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'User already exists',
  USER_NOT_FOUND: 'User not found',
  INVALID_TOKEN: 'Invalid or expired token',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  SERVER_ERROR: 'Internal server error',
  DATABASE_ERROR: 'Database error',
  GROQ_ERROR: 'AI service error',
  GOOGLE_ERROR: 'Google API error',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PASSWORD_UPDATED: 'Password updated successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  ITEM_CREATED: 'Item created successfully',
  ITEM_UPDATED: 'Item updated successfully',
  ITEM_DELETED: 'Item deleted successfully',
};

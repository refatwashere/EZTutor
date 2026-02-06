/**
 * Client-side constants and configuration
 */

// API Configuration
export const API_BASE = process.env.REACT_APP_API_BASE || '';
export const API_TIMEOUT = 30000;

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'eztutor_token',
  USER: 'eztutor_user',
  PENDING_EXPORT: 'pendingExport',
  THEME: 'eztutor_theme',
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  LESSON_PLAN: '/lesson-plan',
  QUIZ: '/quiz',
  MY_LESSONS: '/my-lessons',
  MY_QUIZZES: '/my-quizzes',
  RESOURCES: '/resources',
  SUPPORT: '/support',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  COOKIES: '/cookies',
};

// Toast Types
export const TOAST_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

// Toast Durations (ms)
export const TOAST_DURATION = {
  SHORT: 2000,
  DEFAULT: 4000,
  LONG: 6000,
  PERMANENT: 0,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to server. Check your connection.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  AUTH_REQUIRED: 'Please sign in to continue.',
  FETCH_FAILED: 'Failed to load data. Please try again.',
  SAVE_FAILED: 'Failed to save changes. Please try again.',
  DELETE_FAILED: 'Failed to delete. Please try again.',
  UNEXPECTED_ERROR: 'An unexpected error occurred. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully!',
  DELETED: 'Item deleted successfully!',
  EXPORTED: 'Exported to Google Drive successfully!',
  CREATED: 'Created successfully!',
  UPDATED: 'Updated successfully!',
};

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  SUBJECT_MAX_LENGTH: 100,
  TOPIC_MAX_LENGTH: 200,
  TITLE_MAX_LENGTH: 150,
  DESCRIPTION_MAX_LENGTH: 1000,
};

// Difficulty Levels
export const DIFFICULTY_LEVELS = ['basic', 'intermediate', 'advanced'];

// Grade Levels
export const GRADE_LEVELS = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

// Export Status
export const EXPORT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  SUCCESS: 'success',
  FAILED: 'failed',
};

// Content Types
export const CONTENT_TYPES = {
  LESSON: 'lesson',
  QUIZ: 'quiz',
  RESOURCE: 'resource',
};

// Default Timeouts
export const TIMEOUTS = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 10000,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_PAGE: 1,
};

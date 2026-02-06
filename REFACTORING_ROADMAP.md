# EZTutor - Refactoring Roadmap & Implementation Guide

---

## 🚀 Quick Start Refactoring (30 Minutes)

### 1. Delete Empty Folder
```powershell
# Windows PowerShell
Remove-Item -Path "server\controller" -Recurse -Force
```

### 2. Update Root package.json
**Remove these lines** (keep only workspace/build scripts):

```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",      // ❌ REMOVE
    "cors": "^2.8.6",          // ❌ REMOVE
    "dotenv": "^17.2.3",       // ❌ REMOVE
    "express": "^5.2.1",       // ❌ REMOVE
    "express-rate-limit": "^7.5.1", // ❌ REMOVE
    "groq-sdk": "^0.7.0",      // ❌ REMOVE
    "jsonwebtoken": "^9.0.2",  // ❌ REMOVE
    "mysql2": "^3.11.0"        // ❌ REMOVE
  }
}
```

**Keep this structure**:
```json
{
  "name": "eztutor",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["client", "server"],
  "scripts": {
    "start-server": "cd server && npm start",
    "start-client": "cd client && npm start",
    "start": "concurrently \"npm run start-server\" \"npm run start-client\"",
    "install-all": "npm install && npm --workspace=client install && npm --workspace=server install",
    "test": "npm --workspace=server test"
  }
}
```

### 3. Create .env.example
```bash
# Copy .env to .env.example and commit it
cp .env .env.example

# Remove .env from git tracking
git rm --cached .env
git commit -m "Remove .env from version control"
```

### 4. Rename openaiService.js
```powershell
Rename-Item -Path "server\services\openaiService.js" -NewName "groqService.js"
```

**Update the import in lessonController.js**:
```javascript
// OLD
const openaiService = require('../services/openaiService');

// NEW
const groqService = require('../services/groqService');
```

---

## 📁 Folder Structure Improvements

### Current Problematic Structure
```
server/
├── controller/        🔴 EMPTY - DELETE
├── controllers/       ✅ Actual code
├── routes/
├── services/
├── middleware/
├── tests/
└── index.js
```

### After Refactoring
```
server/
├── controllers/       (authController, lessonController, etc.)
├── routes/           (api.js)
├── services/         (groqService.js)
├── middleware/       (authRequired.js, errorHandler.js)
├── utils/            ✨ NEW - helper functions
├── constants.js      ✨ NEW - magic numbers
├── db.js
├── index.js
├── tests/
└── .env.example
```

---

## 🔧 Phase 2: High Priority Refactoring

### A. Create server/constants.js

**File**: `server/constants.js`

```javascript
/**
 * Global constants for EZTutor server
 */

// Authentication
exports.MIN_PASSWORD_LENGTH = 8;
exports.JWT_EXPIRATION = '7d';
exports.BCRYPT_ROUNDS = 10;

// Validation
exports.MAX_SUBJECT_LENGTH = 100;
exports.MAX_TOPIC_LENGTH = 200;
exports.MAX_RECENT_ITEMS = 50;
exports.EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Rate Limiting
exports.RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
exports.RATE_LIMIT_MAX_REQUESTS = 100;

// API
exports.GROQ_TIMEOUT_MS = 20000;
exports.GROQ_MAX_RETRIES = 2;

// Response Messages
exports.MESSAGES = {
  MISSING_REQUIRED_FIELD: (field) => `${field} is required`,
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_USED: 'Email is already in use',
  INVALID_AUTH_TOKEN: 'Invalid or missing authentication token',
  JWT_SECRET_NOT_CONFIGURED: 'JWT_SECRET not configured on server',
  GROQ_API_KEY_MISSING: 'Groq API key is not configured',
};
```

**Update authController.js**:
```javascript
const { MIN_PASSWORD_LENGTH, JWT_EXPIRATION, BCRYPT_ROUNDS } = require('../constants');

// Replace hardcoded values:
const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);  // was: 10
return jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: JWT_EXPIRATION });  // was: '7d'
if (password.length < MIN_PASSWORD_LENGTH) { ... }  // was: 8
```

**Update lessonController.js**:
```javascript
const { MAX_SUBJECT_LENGTH, MAX_TOPIC_LENGTH } = require('../constants');

if (subject.length > MAX_SUBJECT_LENGTH || topic.length > MAX_TOPIC_LENGTH) { ... }
```

**Update index.js**:
```javascript
const { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS } = require('./constants');

const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
});
```

---

### B. Create client/src/services/api.js

**File**: `client/src/services/api.js`

```javascript
/**
 * Centralized API client for EZTutor
 * Handles authentication, error responses, and request/response interceptors
 */

import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE || '/api';

// Create axios instance
export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle token expiration
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  signup: (email, password) =>
    api.post('/auth/signup', { email, password }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  me: () => api.get('/auth/me'),
  
  logout: () => {
    localStorage.removeItem('authToken');
  },
};

// Lesson Plan endpoints
export const lessonAPI = {
  generate: (subject, topic) =>
    api.post('/generate-lesson', { subject, topic }),
};

// Quiz endpoints
export const quizAPI = {
  generate: (topic, difficulty, gradeLevel, questionMix) =>
    api.post('/generate-quiz', { topic, difficulty, gradeLevel, questionMix }),
};

// Recents endpoints
export const recentsAPI = {
  list: () => api.get('/recents'),
  
  add: (recent) => api.post('/recents', recent),
  
  clear: () => api.delete('/recents'),
};

// Support endpoints
export const supportAPI = {
  submit: (name, email, message) =>
    api.post('/support', { name, email, message }),
};

export default api;
```

---

### C. Create client/src/hooks/useAuth.js

**File**: `client/src/hooks/useAuth.js`

```javascript
/**
 * Custom hook for authentication state management
 * Handles user login/logout and token persistence
 */

import { useEffect, useState } from 'react';
import { authAPI } from '../services/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      authAPI
        .me()
        .then((data) => {
          setUser(data);
          setError(null);
        })
        .catch((err) => {
          console.error('Failed to fetch user:', err);
          localStorage.removeItem('authToken');
          setError(err.message);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Signup function
  const signup = async (email, password) => {
    try {
      setLoading(true);
      const data = await authAPI.signup(email, password);
      localStorage.setItem('authToken', data.token);
      const userData = await authAPI.me();
      setUser(userData);
      setError(null);
      return userData;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      const data = await authAPI.login(email, password);
      localStorage.setItem('authToken', data.token);
      const userData = await authAPI.me();
      setUser(userData);
      setError(null);
      return userData;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setError(null);
  };

  return { user, loading, error, signup, login, logout };
}
```

---

### D. Create client/src/components/ErrorBoundary.js

**File**: `client/src/components/ErrorBoundary.js`

```javascript
/**
 * Error Boundary component to catch and display errors gracefully
 * Prevents entire app from crashing
 */

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h1>⚠️ Something went wrong</h1>
          <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Return to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**Update App.js to use it**:
```javascript
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        {/* ... rest of app */}
      </BrowserRouter>
    </ErrorBoundary>
  );
}
```

---

### E. Create server/middleware/validate.js

**File**: `server/middleware/validate.js`

```javascript
/**
 * Input validation middleware using express-validator
 * Centralizes validation logic for common endpoints
 */

const { body, validationResult } = require('express-validator');
const { MAX_SUBJECT_LENGTH, MAX_TOPIC_LENGTH, EMAIL_REGEX } = require('../constants');

// Middleware to handle validation errors
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(e => ({ field: e.param, message: e.msg })),
    });
  }
  next();
}

// Lesson plan validation
const validateLessonPlan = [
  body('subject')
    .trim()
    .notEmpty().withMessage('subject is required')
    .isLength({ max: MAX_SUBJECT_LENGTH }).withMessage(`subject must be <= ${MAX_SUBJECT_LENGTH} chars`),
  body('topic')
    .trim()
    .notEmpty().withMessage('topic is required')
    .isLength({ max: MAX_TOPIC_LENGTH }).withMessage(`topic must be <= ${MAX_TOPIC_LENGTH} chars`),
  handleValidationErrors,
];

// Quiz validation
const validateQuiz = [
  body('topic')
    .trim()
    .notEmpty().withMessage('topic is required')
    .isLength({ max: MAX_TOPIC_LENGTH }).withMessage(`topic must be <= ${MAX_TOPIC_LENGTH} chars`),
  body('difficulty')
    .trim()
    .notEmpty().withMessage('difficulty is required')
    .isIn(['easy', 'medium', 'hard']).withMessage('difficulty must be easy, medium, or hard'),
  handleValidationErrors,
];

// Auth validation
const validateSignup = [
  body('email')
    .trim()
    .notEmpty().withMessage('email is required')
    .matches(EMAIL_REGEX).withMessage('email must be a valid email address'),
  body('password')
    .notEmpty().withMessage('password is required')
    .isLength({ min: 8 }).withMessage('password must be at least 8 characters'),
  handleValidationErrors,
];

module.exports = {
  validateLessonPlan,
  validateQuiz,
  validateSignup,
};
```

**Update routes/api.js to use validators**:
```javascript
const { validateLessonPlan, validateQuiz, validateSignup } = require('../middleware/validate');

router.post('/generate-lesson', validateLessonPlan, lessonController.generateLesson);
router.post('/generate-quiz', validateQuiz, quizController.generateQuiz);
router.post('/auth/signup', validateSignup, authController.signup);
```

---

## 🧪 Phase 2: Testing Setup

### A. Install Test Dependencies

```bash
cd server
npm install --save-dev jest supertest
```

### B. Create server/tests/auth.test.js

```javascript
const request = require('supertest');
const app = require('../index');

describe('Authentication', () => {
  describe('POST /api/auth/signup', () => {
    test('should create new user and return token', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'validPassword123',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    test('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'existing@example.com',
          password: 'validPassword123',
        });

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should return token for valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'correctPassword',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
  });
});
```

---

## 🗂️ File Organization Best Practices

### Don't Do This ❌
```
server/
├── authController.js        (File in wrong place)
├── quizService.js          (Not organized)
└── middleware/             (Mixed concerns)
```

### Do This ✅
```
server/
├── controllers/
│   ├── authController.js
│   ├── lessonController.js
│   └── quizController.js
├── services/
│   └── groqService.js
├── middleware/
│   ├── authRequired.js
│   └── errorHandler.js
├── routes/
│   └── api.js
├── utils/
│   ├── validators.js
│   └── helpers.js
├── constants.js
├── db.js
└── index.js
```

---

## 📋 Implementation Checklist

### Week 1: Critical Fixes
- [ ] Delete `server/controller/` folder
- [ ] Fix root `package.json` (remove server deps)
- [ ] Rename `openaiService.js` → `groqService.js`
- [ ] Create `.env.example`
- [ ] Commit changes to git

### Week 2: Core Refactoring
- [ ] Create `server/constants.js`
- [ ] Create `client/src/services/api.js`
- [ ] Create `client/src/hooks/useAuth.js`
- [ ] Create `client/src/components/ErrorBoundary.js`
- [ ] Update imports in all affected files

### Week 3: Validation & Testing
- [ ] Create `server/middleware/validate.js`
- [ ] Install test dependencies
- [ ] Create basic auth tests
- [ ] Update routes to use validators
- [ ] Create component tests

### Week 4: Documentation
- [ ] Add inline code comments
- [ ] Create `docs/DEVELOPMENT.md`
- [ ] Create `docs/DATABASE.md`
- [ ] Update main README.md with new structure

---

## ✅ Verification Steps

After each phase, verify:

```bash
# Check folder structure
ls -la server/
ls -la client/src/

# Run linter (if available)
npm run lint

# Run tests
npm test

# Build frontend
cd client && npm run build

# Start server (in test mode)
cd server && npm start
```

---

## 🆘 Common Issues & Solutions

### Issue: "Cannot find module 'groqService'"
**Solution**: Update import paths in all controllers after renaming

### Issue: "API calls still not working"
**Solution**: Ensure REACT_APP_API_BASE env var is set in client/.env.production

### Issue: "Tests failing due to missing database"
**Solution**: Use test database or mock the db module in tests

### Issue: "TypeScript errors after refactoring"
**Solution**: Update .eslintrc if using ESLint, or add JSDoc comments

---

## 📚 Resources

- Express.js best practices: https://expressjs.com/en/advanced/best-practice-performance.html
- React hooks guide: https://react.dev/reference/react/hooks
- Express-validator: https://express-validator.github.io/docs/
- Jest testing: https://jestjs.io/docs/getting-started

---

**Last Updated**: February 6, 2026

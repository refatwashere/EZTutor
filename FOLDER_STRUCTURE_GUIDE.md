# EZTutor - Project Structure & Organization Guide

---

## 📊 Current State vs. Target State

### Previous Issues (Resolved) ⚠️

```
PREVIOUS STRUCTURE (Resolved)
├── ROOT PACKAGE.JSON
│   └── Simple scripts, no workspace orchestration
│
├── SERVER
│   ├── controller/          🔴 EMPTY FOLDER - DELETE
│   ├── controllers/         ✅ (contains actual code)
│   ├── data/               🟡 (unused)
│   ├── middleware/         ✅
│   ├── routes/             ✅
│   ├── services/           🟡 (only 1 file)
│   └── tests/              🟡 (empty test setup)
│
├── CLIENT
│   └── src/
│       ├── components/     ✅ (2 files)
│       ├── pages/          ✅ (9 files)
│       └── (no services, hooks, utils folders)
│
└── DOCS
    ├── api-schema.md       ✅
    ├── architecture.md     ✅
    ├── DEPLOYMENT.md       ✅
    └── SECURITY.md         ✅
```

### Target Structure 🎯

```
IMPROVED STRUCTURE
├── ROOT PACKAGE.JSON
│   └── Only workspace/meta scripts (NO server deps)
│
├── SERVER
│   ├── controllers/        (5 controllers)
│   ├── middleware/         (auth, validation, error handler)
│   ├── routes/             (api routes)
│   ├── services/           (groqService, etc.)
│   ├── utils/              ✨ NEW (helpers, validators)
│   ├── constants.js        ✨ NEW
│   ├── db.js
│   ├── index.js
│   ├── .env.example        ✨ NEW
│   └── tests/
│
├── CLIENT
│   └── src/
│       ├── components/     (AppLayout, AuthModal, ErrorBoundary)
│       ├── pages/          (9 pages)
│       ├── hooks/          ✨ NEW (useAuth, useApi)
│       ├── services/       ✨ NEW (api.js)
│       ├── utils/          ✨ NEW (helpers, validators)
│       ├── constants.js    ✨ NEW
│       ├── App.js
│       └── index.js
│
└── DOCS
    ├── api-schema.md
    ├── architecture.md
    ├── DEPLOYMENT.md
    ├── SECURITY.md
    ├── DEVELOPMENT.md      ✨ NEW
    └── CONTRIBUTING.md     ✨ NEW
```

---

## 🚨 Critical Issues & Fixes

### Issue #1: Duplicate `controller/` Folder

**Location**: `server/controller/`  
**Status**: Empty, confusing  
**Impact**: New developers don't know which folder to use  
**Fix**: Delete immediately

```powershell
# Windows PowerShell
Remove-Item -Path "server\controller" -Recurse -Force
git add -A
git commit -m "Remove empty controller folder, use controllers/ instead"
```

**Before**:
```
server/
├── controller/    🔴 Confusing
├── controllers/   ✅ Actual code
```

**After**:
```
server/
├── controllers/   ✅ Only one, crystal clear
```

---

### Issue #2: Root Scripts Don't Match Workspace Template

**Location**: Root `package.json`  
**Problem**: Guide shows a workspace/concurrently setup, but repo uses simple scripts  
**Impact**: Documentation drift and onboarding confusion  

**Current (Correct)**:
```json
{
  "name": "eztutor",
  "version": "1.0.0",
  "description": "AI-powered teacher productivity suite",
  "main": "server/index.js",
  "private": true,
  "scripts": {
    "start": "npm run start-server",
    "start-server": "cd server && npm start",
    "start-client": "cd client && npm start",
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm start",
    "test": "cd server && npm test",
    "test:client": "cd client && npm test",
    "install-all": "npm install && cd server && npm install && cd ../client && npm install"
  }
}
```

**Why**:
- Root stays dependency‑free and delegates to client/server
- Scripts are explicit and easy to follow
- Works without workspace tooling

---

### Issue #3: Service Naming Confusion

**File**: `server/services/groqService.js` (RESOLVED ✅)  
**Problem**: Named "openai" but uses Groq API  
**Impact**: Confuses developers about which service is being used  
**Status**: File renamed from `openaiService.js`. All imports updated in:
  - `server/controllers/lessonController.js`
  - `server/controllers/quizController.js`
**Tests**: All 6 tests pass after refactoring

---

### Issue #4: Missing Environment File Template

**Location**: `.env` is in version control  
**Problem**: Sensitive data exposed; new devs don't know what vars are needed  
**Impact**: Security risk, onboarding friction  
**Fix**: Create `.env.example` and remove `.env` from git

```bash
# Copy .env to .env.example
cp .env .env.example

# Remove .env from git
git rm --cached .env
git commit -m "Remove .env from version control, add .env.example template"

# Update .gitignore to ensure .env is never committed
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

**Example `.env.example`**:
```bash
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/eztutor_dev
DB_SSL=false

# Authentication
JWT_SECRET=your-secret-key-here-change-in-production
BCRYPT_ROUNDS=10

# Groq API
GROQ_API_KEY=gsk_xxxxx
GROQ_MODEL=llama-3.1-8b-instant
GROQ_TIMEOUT_MS=20000
GROQ_MAX_RETRIES=2

# API Security (optional)
EZTUTOR_API_KEY=optional-api-key-for-clients
EZTUTOR_MODE=live

# Frontend
REACT_APP_API_BASE=http://localhost:5000
```

---

## 📂 Detailed Folder Reorganization

### Server: Add Missing Folders

#### 1. Create `server/utils/` Folder

**Purpose**: Helper functions, validators, formatters  
**Files to create**:

**server/utils/validators.js**
```javascript
/**
 * Standalone validators for common data types
 * Can be used in middleware or services
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
  return EMAIL_REGEX.test(email);
}

function validatePassword(password) {
  if (typeof password !== 'string') return false;
  if (password.length < 8) return false;
  return true;
}

function validateSubject(subject) {
  if (typeof subject !== 'string') return false;
  if (subject.trim().length === 0) return false;
  if (subject.length > 100) return false;
  return true;
}

function validateTopic(topic) {
  if (typeof topic !== 'string') return false;
  if (topic.trim().length === 0) return false;
  if (topic.length > 200) return false;
  return true;
}

module.exports = {
  validateEmail,
  validatePassword,
  validateSubject,
  validateTopic,
};
```

**server/utils/helpers.js**
```javascript
/**
 * General utility helper functions
 */

function normalizeEmail(email) {
  return email.toLowerCase().trim();
}

function formatErrorResponse(message, details = null) {
  return {
    error: message,
    ...(details && { details }),
    timestamp: new Date().toISOString(),
  };
}

function formatSuccessResponse(data, meta = null) {
  return {
    data,
    ...(meta && { meta }),
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  normalizeEmail,
  formatErrorResponse,
  formatSuccessResponse,
};
```

**File tree after addition**:
```
server/
├── utils/
│   ├── validators.js
│   └── helpers.js
└── [other folders]
```

#### 2. Rename & Reorganize Services

**Before**:
```
server/services/
└── openaiService.js    🟡 Wrong name
```

**After**:
```
server/services/
├── groqService.js      ✅ Correct name
└── (future: cacheService.js, storageService.js)
```

**Update references**:
```javascript
// In lessonController.js
// OLD: const openaiService = require('../services/openaiService');
// NEW:
const groqService = require('../services/groqService');

// In quizController.js
// OLD: const openaiService = require('../services/openaiService');
// NEW:
const groqService = require('../services/groqService');
```

### Client: Add Missing Folders

#### 1. Create `client/src/services/` Folder

```
client/src/services/
└── api.js          (Centralized API client with interceptors)
```

**See REFACTORING_ROADMAP.md for implementation**

#### 2. Create `client/src/hooks/` Folder

```
client/src/hooks/
├── useAuth.js       (Auth state management)
├── useApi.js        (Data fetching hook)
└── useLocalStorage.js (Local storage hook)
```

**Example useApi hook**:
```javascript
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function useApi(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(url, options)
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}
```

#### 3. Create `client/src/utils/` Folder

```
client/src/utils/
├── validators.js    (Frontend validation)
├── formatters.js    (Data formatting)
└── helpers.js       (Utility functions)
```

#### 4. Create `client/src/constants.js` File

```javascript
// Frontend constants
export const API_BASE = process.env.REACT_APP_API_BASE || '/api';
export const AUTH_TOKEN_KEY = 'authToken';
export const ROUTES = {
  HOME: '/',
  LESSON: '/lesson',
  QUIZ: '/quiz',
  RESOURCES: '/resources',
  LOGIN: '/login',
};
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to server. Check your connection.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
};
```

---

## 🗂️ Complete Reorganized Structure

### Final Server Structure

```
server/
├── controllers/
│   ├── authController.js
│   ├── lessonController.js
│   ├── quizController.js
│   ├── recentsController.js
│   └── supportController.js
│
├── middleware/
│   ├── authRequired.js
│   ├── errorHandler.js
│   └── validate.js (NEW)
│
├── routes/
│   └── api.js
│
├── services/
│   └── groqService.js (RENAMED from openaiService)
│
├── utils/
│   ├── validators.js (NEW)
│   └── helpers.js (NEW)
│
├── tests/
│   ├── api.test.js
│   ├── auth.test.js (NEW)
│   └── lesson.test.js (NEW)
│
├── constants.js (NEW)
├── db.js
├── index.js
├── package.json
├── .env (IGNORED in git)
├── .env.example (NEW)
└── .gitignore
```

### Final Client Structure

```
client/src/
├── components/
│   ├── AppLayout.js
│   ├── AuthModal.js
│   └── ErrorBoundary.js (NEW)
│
├── pages/
│   ├── Dashboard.js
│   ├── LessonPlan.js
│   ├── QuizGenerator.js
│   ├── ResourceHub.js
│   ├── Support.js
│   ├── Contact.js
│   ├── PrivacyPolicy.js
│   ├── Terms.js
│   └── CookiePolicy.js
│
├── hooks/ (NEW)
│   ├── useAuth.js
│   ├── useApi.js
│   └── useLocalStorage.js
│
├── services/ (NEW)
│   └── api.js
│
├── utils/ (NEW)
│   ├── validators.js
│   ├── formatters.js
│   └── helpers.js
│
├── constants.js (NEW)
├── App.js
├── App.css
├── index.js
├── index.css
├── setupTests.js
└── reportWebVitals.js
```

### Final Root Structure

```
EZTutor/
├── client/
│   ├── src/
│   ├── public/
│   ├── build/
│   ├── package.json
│   └── [other config files]
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── tests/
│   ├── constants.js
│   ├── db.js
│   ├── index.js
│   ├── package.json
│   └── .env.example
│
├── docs/
│   ├── api-schema.md
│   ├── architecture.md
│   ├── DEPLOYMENT.md
│   ├── SECURITY.md
│   ├── DEVELOPMENT.md (NEW)
│   └── CONTRIBUTING.md (NEW)
│
├── package.json (UPDATED - workspace only)
├── .env (IGNORED)
├── .env.example (NEW)
├── .gitignore (UPDATED)
├── .git/
├── .gitmodules
│
├── README.md
├── CHANGELOG.md
├── RELEASE_CHECKLIST.md
├── CODE_REVIEW.md (NEW)
├── REFACTORING_ROADMAP.md (NEW)
└── render.yaml
```

---

## 🔄 Migration Checklist

### Phase 1: Cleanup (1 hour)
- [ ] Delete `server/controller/` folder
- [ ] Rename `server/services/openaiService.js` → `groqService.js`
- [ ] Update all imports referencing openaiService
- [ ] Remove server dependencies from root package.json
- [ ] Create `.env.example` and remove `.env` from git
- [ ] Commit changes

### Phase 2: New Folders & Files (2 hours)
- [ ] Create `server/utils/` with validators.js and helpers.js
- [ ] Create `server/constants.js`
- [ ] Create `server/middleware/validate.js`
- [ ] Create `client/src/services/api.js`
- [ ] Create `client/src/hooks/useAuth.js`, useApi.js, useLocalStorage.js
- [ ] Create `client/src/utils/` with validators, formatters, helpers
- [ ] Create `client/src/constants.js`
- [ ] Create `client/src/components/ErrorBoundary.js`
- [ ] Commit changes

### Phase 3: Update Imports (1 hour)
- [ ] Update all `require()` paths to new locations
- [ ] Update all `import` paths in React components
- [ ] Verify no broken imports with build test

### Phase 4: Documentation (1 hour)
- [ ] Update README.md with new structure
- [ ] Create `docs/DEVELOPMENT.md`
- [ ] Create `docs/CONTRIBUTING.md`
- [ ] Commit changes

### Phase 5: Testing (1-2 hours)
- [ ] Install test dependencies
- [ ] Create basic test files
- [ ] Verify all tests pass
- [ ] Commit changes

---

## ✅ Verification Commands

After reorganization, run these commands to verify everything is working:

```bash
# Root
npm install
npm run start-server &
npm run start-client

# Server validation
cd server
npm start --loglevel=verbose

# Client validation
cd client
npm run build

# Check folder structure
# Windows PowerShell:
Get-ChildItem -Path ".\server\" -Directory | Select-Object Name
Get-ChildItem -Path ".\client\src\" -Directory | Select-Object Name

# Verify git status
git status
git log --oneline -10
```

---

## 📝 File Organization Best Practices

### ✅ DO
- Use plural folder names: `components/`, `pages/`, `controllers/`
- Keep related files together: API calls in `services/`, not in pages
- Use index files for exports: `services/index.js` exports all services
- Organize by feature when possible: `features/lesson/`, `features/quiz/`
- Keep utilities separate: `utils/`, `helpers/`, `constants.js`

### ❌ DON'T
- Mix concerns in files (API + UI + state management)
- Scatter related code across folders
- Use singular folder names: `controller/` instead of `controllers/`
- Create deep nesting: `src/utils/helpers/formatters/strings.js`
- Leave empty folders in version control
- Commit sensitive files: `.env`, `node_modules/`, `build/`

---

## 🚀 Impact of Reorganization

### Developer Experience (DX) Improvements
- **Clarity**: New developers know exactly where code lives
- **Discoverability**: Easy to find utilities, hooks, services
- **Consistency**: Everyone follows same structure
- **Onboarding**: Reduced time to understand codebase

### Code Quality Improvements
- **Reusability**: Shared utilities in dedicated folders
- **Maintainability**: Clear separation of concerns
- **Testability**: Easy to isolate and test modules
- **Scalability**: Structure supports growth without refactoring

### Estimated Time to Complete
- **Quick fixes (delete, rename)**: 30 minutes
- **Create new files**: 1-2 hours
- **Update imports**: 1 hour
- **Testing & verification**: 1-2 hours
- **Total**: 4-5 hours (or can be spread over 1-2 days)

---

**Last Updated**: February 6, 2026  
**Total Pages**: 6 documents generated

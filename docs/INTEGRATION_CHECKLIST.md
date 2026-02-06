# Google Integration - Setup Verification & Architecture

## 📊 Architecture Overview

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (React App)                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Pages: LessonPlan.js, QuizGenerator.js, etc.                         │  │
│  │ - Import useNotification hook for toast messages                     │  │
│  │ - Click "Export to Google Drive" button                             │  │
│  │ - addToast('Authenticating...', 'info')                           │  │
│  └──────────────────────┬───────────────────────────────────────────────┘  │
│                         │                                                   │
│                    fetch('/api/auth/google')                               │
│                         │                                                   │
│                    Receive: { url: 'https://accounts.google.com/...' }    │
│                         │                                                   │
│                    window.location = url (redirect to Google)              │
│                         │                                                   │
│                    User signs in at Google                                 │
│                         │                                                   │
└─────────────────────────┼─────────────────────────────────────────────────┘
                          │
                          │ (Google OAuth Redirect)
                          │
┌─────────────────────────▼─────────────────────────────────────────────────┐
│                        BACKEND API (Express.js)                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ routes/api.js:                                                       │  │
│  │                                                                      │  │
│  │ GET /api/auth/google - generates OAuth auth URL                     │  │
│  │   Input: req.user.id (from JWT), Authorization header              │  │
│  │   Output: { url: 'https://accounts.google.com/...' }               │  │
│  │                                                                      │  │
│  │ GET /api/auth/google/callback - handles OAuth redirect              │  │
│  │   Input: code (from Google), state (our JWT)                       │  │
│  │   Process:                                                          │  │
│  │     1. Verify state JWT matches user                               │  │
│  │     2. Exchange code for tokens via googleDriveService              │  │
│  │     3. Decrypt tokens before storing (if ENCRYPTION_KEY set)       │  │
│  │     4. UPDATE users table with encrypted tokens                    │  │
│  │     5. Redirect to frontend with ?google_connected=1               │  │
│  │   Output: Redirect to frontend URL                                 │  │
│  │                                                                      │  │
│  │ POST /api/export-to-drive - exports lesson/quiz to Google Drive    │  │
│  │   Input: { contentType: 'lesson'|'quiz', contentId: X }            │  │
│  │   Process:                                                          │  │
│  │     1. Fetch user's tokens from DB                                 │  │
│  │     2. If tokens missing → return 401 with auth URL                │  │
│  │     3. If access token expired → refresh via refreshAccessToken()  │  │
│  │     4. UPDATE user with new tokens after refresh                   │  │
│  │     5. Fetch lesson/quiz content from DB                           │  │
│  │     6. Call googleDriveService.exportToDrive()                     │  │
│  │     7. INSERT into google_drive_exports table (success)            │  │
│  │     8. On error → INSERT into export_retry_queue (auto-retry)      │  │
│  │   Output: { success: true, googleDriveUrl: '...', fileName: '...' }│  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ services/googleDriveService.js:                                      │  │
│  │                                                                      │  │
│  │ getAuthUrl(state) - generates OAuth auth URL                        │  │
│  │   Returns: 'https://accounts.google.com/o/oauth2/v2/auth?...'      │  │
│  │                                                                      │  │
│  │ exchangeCodeForTokens(code) - exchanges auth code for tokens       │  │
│  │   Calls Google API: https://oauth2.googleapis.com/token             │  │
│  │   Returns: { access_token, refresh_token, expiry_date }            │  │
│  │                                                                      │  │
│  │ refreshAccessToken(refreshToken) - refreshes expired access token  │  │
│  │   Calls Google API (refresh flow)                                 │  │
│  │   Returns: { access_token, expiry_date }                           │  │
│  │                                                                      │  │
│  │ exportToDrive(options) - creates file in Google Drive               │  │
│  │   Input: { accessToken, contentType, content }                     │  │
│  │   Calls: Google Drive API v3 to create file                        │  │
│  │   Returns: { id, url, name, docxId, docxUrl }                      │  │
│  │                                                                      │  │
│  │ encryptToken(token) / decryptToken(token) - secure token storage   │  │
│  │   Uses ENCRYPTION_KEY from .env                                    │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ services/exportQueue.js (background worker):                        │  │
│  │                                                                      │  │
│  │ enqueue(options) - adds failed export to retry queue               │  │
│  │   Calls: db.run('INSERT INTO export_retry_queue...')               │  │
│  │                                                                      │  │
│  │ processPending() - runs every 30 seconds (if not in test env)      │  │
│  │   1. Fetch items from export_retry_queue with status='pending'     │  │
│  │   2. Check if next_attempt_at has passed                           │  │
│  │   3. Attempt export again                                          │  │
│  │   4. On success: INSERT into google_drive_exports, DELETE from queue│  │
│  │   5. On failure: UPDATE queue with incremented attempts            │  │
│  │   6. Calculate exponential backoff: 60 * 2^(attempts-1) seconds    │  │
│  │                                                                      │  │
│  │ Backoff Schedule:                                                   │  │
│  │   Attempt 1: immediately                                            │  │
│  │   Attempt 2: wait 60 seconds                                        │  │
│  │   Attempt 3: wait 120 seconds                                       │  │
│  │   Attempt 4: wait 240 seconds                                       │  │
│  │   ...up to 24 hours                                                 │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │
                    ┌────────▼───────────┐
       ┌────────────┤  Google APIs       ├────────────┐
       │            └────────────────────┘            │
       │                                               │
       ▼                                               ▼
  ┌────────────────────────┐          ┌──────────────────────┐
  │  Google OAuth 2.0      │          │  Google Drive API    │
  │  (accounts.google.com) │          │  (content.googleapis │
  │                        │          │   .com/drive/v3)     │
  │ - Authenticate user    │          │                      │
  │ - Issue access token   │          │ - Create files       │
  │ - Issue refresh token  │          │ - Manage folders     │
  │ - Refresh tokens       │          │ - Set permissions    │
  └────────────────────────┘          └──────────────────────┘
       │                                               │
       └───────────────────────┬───────────────────────┘
                               │
         ┌─────────────────────▼────────────────────┐
         │   User's Google Drive                   │
         │  ┌────────────────────────────────────┐ │
         │  │ /EZTutor Exports (folder)         │ │
         │  │  - Lesson Plan - Math Chapter 5   │ │
         │  │  - Quiz - Biology Review Quiz 1   │ │
         │  │  - ... (more exported files)      │ │
         │  └────────────────────────────────────┘ │
         └─────────────────────────────────────────┘


       ┌────────────────────────────────────────────┐
       │   PostgreSQL Database                      │
       │  ┌─────────────────────────────────────┐  │
       │  │ users table:                        │  │
       │  │ - id, email, password               │  │
       │  │ - google_access_token (encrypted)   │  │
       │  │ - google_refresh_token (encrypted)  │  │
       │  │ - google_token_expires_at           │  │
       │  └─────────────────────────────────────┘  │
       │                                            │
       │  ┌─────────────────────────────────────┐  │
       │  │ google_drive_exports table:         │  │
       │  │ - id, user_id, content_type        │  │
       │  │ - content_id, google_file_id        │  │
       │  │ - google_file_url, created_at       │  │
       │  └─────────────────────────────────────┘  │
       │                                            │
       │  ┌─────────────────────────────────────┐  │
       │  │ export_retry_queue table:           │  │
       │  │ - id, user_id, content_type, ...    │  │
       │  │ - attempts, next_attempt_at         │  │
       │  │ - status, error_message             │  │
       │  └─────────────────────────────────────┘  │
       └────────────────────────────────────────────┘
```

---

## ✅ Integration Checklist

### Part 1: Google Cloud Setup
- [ ] Created Google Cloud project (name: EZTutor)
- [ ] Navigated to APIs & Services
- [ ] Enabled **Google Drive API**
- [ ] Created **OAuth consent screen** (External user type)
- [ ] Created **OAuth 2.0 Client ID** (Web application type)
- [ ] Added redirect URIs (localhost + production domain)
- [ ] Downloaded credentials JSON file
- [ ] Saved credentials securely (outside version control)

### Part 2: Backend Configuration
- [ ] Created/updated `server/.env` file
- [ ] Added `GOOGLE_CLIENT_ID` (from Google Cloud)
- [ ] Added `GOOGLE_CLIENT_SECRET` (from Google Cloud)
- [ ] Added `GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback`
- [ ] Generated `ENCRYPTION_KEY` and added to `.env`
- [ ] Added `.env` to `.gitignore`
- [ ] Added `credentials/` folder to `.gitignore`
- [ ] Verified `server/services/googleDriveService.js` exists
- [ ] Verified `server/routes/api.js` has OAuth endpoints
- [ ] Verified `server/services/exportQueue.js` exists (for retry logic)

### Part 3: Database Schema
- [ ] `users` table has columns:
  - [ ] `google_access_token` (TEXT, nullable)
  - [ ] `google_refresh_token` (TEXT, nullable)
  - [ ] `google_token_expires_at` (TIMESTAMP, nullable)
- [ ] `google_drive_exports` table exists with columns:
  - [ ] `id` (BIGSERIAL PRIMARY KEY)
  - [ ] `user_id` (INT, foreign key to users)
  - [ ] `content_type` (VARCHAR: 'lesson' or 'quiz')
  - [ ] `content_id` (INT)
  - [ ] `google_file_id` (TEXT)
  - [ ] `google_file_url` (TEXT)
  - [ ] `created_at` (TIMESTAMP DEFAULT now())
- [ ] `export_retry_queue` table exists with columns:
  - [ ] `id` (BIGSERIAL PRIMARY KEY)
  - [ ] `user_id` (INT)
  - [ ] `content_type` (VARCHAR)
  - [ ] `content_id` (INT)
  - [ ] `attempts` (INT DEFAULT 0)
  - [ ] `next_attempt_at` (TIMESTAMP)
  - [ ] `error_message` (TEXT)

### Part 4: Client-Side Integration
- [ ] **NotificationContext** exists at `client/src/context/NotificationContext.js`
  - [ ] Exports `NotificationProvider` component
  - [ ] Exports `useNotification` hook
  - [ ] Auto-dismisses toasts after 4 seconds
- [ ] **Toast component** exists at `client/src/components/Toast.js`
  - [ ] Renders toast stack (multiple toasts)
  - [ ] Shows success/error/warning/info styles
- [ ] **Toast styling** exists at `client/src/styles/Toast.css`
  - [ ] Has animations (slideIn/slideOut)
  - [ ] Responsive on mobile
- [ ] **App.js** updated:
  - [ ] Wrapped with `<NotificationProvider>`
  - [ ] Includes `<Toast />` component for rendering
- [ ] Export pages use `useNotification` hook:
  - [ ] `LessonPlan.js` - calls `addToast()` on export
  - [ ] `QuizGenerator.js` - calls `addToast()` on export
  - [ ] (Any other pages with export functionality)

### Part 5: Testing Locally
- [ ] Started server: `npm start` (in `server/` directory)
- [ ] Started client: `npm start` (in `client/` directory)
- [ ] Navigated to `http://localhost:3000`
- [ ] Clicked "Export to Google Drive" button
- [ ] Got redirected to Google login (or was already logged in)
- [ ] Granted permission to EZTutor
- [ ] Got redirected back to app
- [ ] Saw success toast notification
- [ ] Checked Google Drive for new file in `/EZTutor Exports` folder
- [ ] Verified tokens are encrypted in database (not plain text)

### Part 6: Error Handling & Recovery
- [ ] Tested token refresh:
  - [ ] Waited for token to "expire" (modify `google_token_expires_at` in DB)
  - [ ] Attempted export
  - [ ] Verified token was refreshed automatically
- [ ] Tested invalid refresh token:
  - [ ] Revoked app access in Google account settings
  - [ ] Attempted export
  - [ ] Got 401 error with re-auth prompt
  - [ ] Successfully re-authenticated
- [ ] Tested export retry queue:
  - [ ] Modified database to simulate export failure
  - [ ] Checked `export_retry_queue` table
  - [ ] Waited for background worker to retry (30 seconds)
  - [ ] Verified retry succeeded or logged error

### Part 7: Production Deployment
- [ ] Updated `.env` variables for production:
  - [ ] Set `GOOGLE_REDIRECT_URI=https://your-domain.com/api/auth/google/callback`
  - [ ] Updated `DATABASE_URL` to production database
  - [ ] Updated `JWT_SECRET` (unique value)
  - [ ] Updated `ENCRYPTION_KEY` (unique value)
- [ ] Added to hosting platform (Render, Vercel, Heroku, etc.):
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
  - [ ] `GOOGLE_REDIRECT_URI`
  - [ ] `ENCRYPTION_KEY`
  - [ ] `DATABASE_URL`
  - [ ] `JWT_SECRET`
- [ ] Updated Google Cloud OAuth settings:
  - [ ] Added production domain to **Authorized redirect URIs**
  - [ ] Format: `https://your-domain.com/api/auth/google/callback`
- [ ] Deployed to production
- [ ] Tested OAuth flow on production domain
- [ ] Verified export works end-to-end
- [ ] Checked production database for tokens and exports

### Part 8: Monitoring & Maintenance
- [ ] Set up monitoring/logging for:
  - [ ] Failed exports (query `export_retry_queue`)
  - [ ] Token refresh failures (check logs)
  - [ ] API rate limit errors (Google Drive)
- [ ] Created backup strategy for database
- [ ] Documented token expiry handling (auto-refresh)
- [ ] Scheduled credential rotation (every 6 months)
- [ ] Set up alerts for:
  - [ ] High failure rate in export queue
  - [ ] DB connection errors
  - [ ] Google API errors

---

## 🔍 Key File Locations Reference

```
EZTutor/
├── server/
│   ├── .env                           ← Add GOOGLE_CLIENT_ID, SECRET, etc.
│   ├── db.js                          ← Database connection
│   ├── routes/api.js                  ← OAuth endpoints & export route
│   ├── services/
│   │   ├── googleDriveService.js      ← Google API integration
│   │   ├── exportQueue.js             ← Retry queue worker
│   │   └── metrics.js                 ← Track export events
│   ├── middleware/authRequired.js     ← JWT verification
│   └── tests/
│       ├── export.test.js
│       ├── export-success.test.js
│       ├── export-edge-cases.test.js
│       └── export-token-refresh.test.js
│
├── client/
│   ├── src/
│   │   ├── App.js                     ← Wrapped with NotificationProvider
│   │   ├── context/
│   │   │   └── NotificationContext.js ← Toast state & hooks
│   │   ├── components/
│   │   │   └── Toast.js               ← Toast UI component
│   │   ├── styles/
│   │   │   └── Toast.css              ← Toast styling & animations
│   │   └── pages/
│   │       ├── LessonPlan.js          ← Uses useNotification
│   │       ├── QuizGenerator.js       ← Uses useNotification
│   │       └── ... (other export pages)
│   └── public/
│
└── docs/
    ├── GOOGLE_CLOUD_SETUP.md          ← Full step-by-step guide
    ├── GOOGLE_CLOUD_QUICK_REF.md      ← Quick reference
    ├── GOOGLE_DRIVE_INTEGRATION.md    ← Technical details
    └── DEPLOYMENT.md                  ← Deployment guide
```

---

## 📈 Expected Test Coverage After Setup

After completing the integration, you should see these tests passing:

```
✔ GET /api returns status payload
✔ POST /api/generate-lesson validates input
✔ POST /api/generate-quiz validates input
✔ POST /api/generate-quiz rejects invalid difficulty
✔ POST /api/support validates input
✔ GET /health returns uptime and timestamp
✔ export handles Google API 403 (quota exceeded) as retryable
✔ export handles malformed Google API response gracefully
✔ export handles network timeout as retryable
✔ export handles permanent Google API error (400) without retry
✔ POST /api/export-to-drive with missing content returns 404
✔ POST /api/export-to-drive with quiz content works correctly
✔ POST /api/export-to-drive with DB error during insert queues for retry
✔ POST /api/export-to-drive failure enqueues retry
✔ exportQueue enqueues and dequeues items
✔ exportQueue retry processing with exponential backoff
✔ exportQueue skips items with missing user tokens
✔ POST /api/export-to-drive success path stores export and returns url
✔ POST /api/export-to-drive with expired token refreshes and exports
✔ POST /api/export-to-drive with invalid refresh token returns 401 re-auth
✔ POST /api/export-to-drive returns 401 + redirectUrl when user has no Google tokens
✔ googleDriveService should throw when Google env not configured

ℹ tests 23
ℹ pass 22
ℹ fail 0
ℹ skipped 1
```

---

## 🎓 Learning Resources

- **OAuth 2.0 Flow**: https://developers.google.com/identity/protocols/oauth2
- **Google Drive API**: https://developers.google.com/drive/api/guides/about-sdk
- **Token Refresh**: https://developers.google.com/identity/protocols/oauth2#expiration
- **Error Codes**: https://developers.google.com/drive/api/guides/handle-errors
- **Rate Limits**: https://developers.google.com/drive/api/guides/limits-and-quotas

---

Created: February 2026 | Last Updated: February 2026

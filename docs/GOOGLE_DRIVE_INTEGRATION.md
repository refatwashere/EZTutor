# Google Drive Integration Roadmap

## Overview

EZTutor is implementing Google Drive integration to allow teachers to export, backup, and collaborate on lesson plans and quizzes. This document outlines the phased approach, timeline, technical architecture, and implementation details.

---

## Google Drive Integration — Phase 1 (Implemented)

This document explains the Phase 1 Google Drive export implementation that is now present in the codebase. It covers the user flow, server API surface, required environment variables, database changes, security considerations, client UX, tests, and recommended next steps.

Status: Phase 1 implemented (export-only). Last updated: 2026-02-06

---

## What is implemented
- Server-side service: `server/services/googleDriveService.js` — OAuth helpers, token encryption wrappers, folder ensure, create Google Doc, optional DOCX export & upload.
- API endpoints: added in `server/routes/api.js` —
  - `GET /api/auth/google` — returns an auth URL for the currently-authenticated user.
  - `GET /api/auth/google/callback` — OAuth callback that exchanges code for tokens and stores them on the user record.
  - `POST /api/export-to-drive` — performs export for a saved lesson or quiz; returns `redirectUrl` when the user needs to connect Google.
- Database updates (see `server/db.js`):
  - Added columns on `users`: `google_access_token`, `google_refresh_token`, `google_token_expires_at`.
  - Added table `google_drive_exports` to record exports (`user_id`, `content_type`, `content_id`, `google_file_id`, `google_file_url`).
- Frontend changes (client pages/components):
  - Export UI wired into: `client/src/pages/LessonPlan.js`, `client/src/pages/QuizGenerator.js`, `client/src/pages/MyLessonPlans.js`, `client/src/pages/MyQuizzes.js`, `client/src/pages/EditLessonPlan.js`, `client/src/pages/EditQuiz.js`.
  - New shared components: `client/src/components/ConfirmModal.js` and `client/src/components/LoadingSpinner.js` used to confirm export and show progress.
- Tests: added unit/integration tests under `server/tests/` that mock Google behavior: `googleDriveService.test.js`, `export.test.js`.

---

## User flow (runtime)
1. User clicks **Export to Google Drive** on a lesson/quiz view or card.
2. Client shows a confirmation modal (`ConfirmModal`).
3. On confirm, client calls `POST /api/export-to-drive` with `{ contentType, contentId }`.
4. Server checks for stored tokens on the authenticated user. If missing, it returns 401 with `{ redirectUrl }` where `redirectUrl` points to Google OAuth; the client redirects the browser to that URL.
5. After Google OAuth, Google redirects to `/api/auth/google/callback?code=...&state=<JWT>`; the server exchanges code for tokens and stores them encrypted on the user record.
6. Export proceeds (server uses `googleDriveService.exportToDrive`) — creates a Google Doc and (when possible) a DOCX and uploads it.
7. Server records the export in `google_drive_exports` and returns `{ success: true, googleDriveUrl, fileName, folderPath, docx: true|false }`.
8. Client shows success and optionally opens the Drive link.

---

## API Reference (actual behavior)

- GET `/api/auth/google` (auth required)
  - Returns: `{ url: '<google-auth-url>' }` where the `state` parameter is the user's JWT.

- GET `/api/auth/google/callback`
  - Google redirects here after user consent; server exchanges the `code`, encrypts tokens, stores them on the user, and redirects back to `FRONTEND_BASE_URL`.

- POST `/api/export-to-drive` (auth required)
  - Request body: `{ contentType: 'lesson' | 'quiz', contentId: number }`
  - 401 response when user has no Google refresh token: `{ error: 'Google authentication required', redirectUrl }` where `redirectUrl` is the OAuth consent URL.
  - 200 response on success: `{ success: true, googleDriveUrl, fileName, folderPath, docx: boolean }`.
  - 401 response when token refresh fails: `{ error: 'Unable to refresh Google token, re-auth required' }`.

Files to inspect: [server/routes/api.js](server/routes/api.js#L1)

---

## Environment variables (required / recommended)
- `GOOGLE_CLIENT_ID` — OAuth client ID
- `GOOGLE_CLIENT_SECRET` — OAuth client secret
- `GOOGLE_REDIRECT_URI` — OAuth redirect URI (must match Google Cloud console)
- `ENCRYPTION_KEY` — symmetric key used to encrypt tokens before storing in DB (required for production)
- `FRONTEND_BASE_URL` — frontend base URL used for redirects after callback
- `JWT_SECRET` — used to sign/verify `state` JWTs for the OAuth dance

Add these to your `.env` (see `.env.example`) before enabling Drive exports in production.

---

## Database schema notes
- `users` table: three added columns (all nullable): `google_access_token TEXT`, `google_refresh_token TEXT`, `google_token_expires_at TIMESTAMPTZ`.
- `google_drive_exports` table records each export with `google_file_id` and `google_file_url` for auditing and UX (open link).

Files: [server/db.js](server/db.js#L1)

---

## Security & token handling
- Scope: we request only `https://www.googleapis.com/auth/drive.file` (least privilege) so the app can create and manage the files it creates.
- Tokens are encrypted (if `ENCRYPTION_KEY` is set) using the helpers in `googleDriveService` before being persisted in `users`.
- The server uses a refresh-token flow: when the access token is expired/missing, `googleDriveService.refreshAccessToken` is called; refreshed tokens are stored back to the DB.
- If refresh fails, the API returns 401 so the client can initiate a fresh OAuth consent.

Security files to inspect: [server/services/googleDriveService.js](server/services/googleDriveService.js#L1)

---

## Client UX changes
- All export entry points now show a confirmation modal, then a spinner during export. Implementations are in:
  - [client/src/components/ConfirmModal.js](client/src/components/ConfirmModal.js#L1)
  - [client/src/components/LoadingSpinner.js](client/src/components/LoadingSpinner.js#L1)
  - Pages wired to the export flow: [client/src/pages/LessonPlan.js](client/src/pages/LessonPlan.js#L1), [client/src/pages/QuizGenerator.js](client/src/pages/QuizGenerator.js#L1), [client/src/pages/MyLessonPlans.js](client/src/pages/MyLessonPlans.js#L1), [client/src/pages/MyQuizzes.js](client/src/pages/MyQuizzes.js#L1), [client/src/pages/EditLessonPlan.js](client/src/pages/EditLessonPlan.js#L1), [client/src/pages/EditQuiz.js](client/src/pages/EditQuiz.js#L1).

Behavioral notes:
- If the `POST /api/export-to-drive` response is 401 with `redirectUrl`, the client performs `window.location.href = redirectUrl` to start OAuth.
- After OAuth completes and the server stores tokens, users should re-initiate the export (or you may implement a frontend redirect back into the flow in a future patch).

## Notifications & client-wide UX
- A centralized toast/notification system was added to the frontend: `client/src/context/NotificationContext.js` and `client/src/components/Toast.js`.
- The `NotificationProvider` wraps the app in `client/src/App.js`; pages now call `useNotification().addToast(message, type)` for success/error info instead of local `setToast` state.
- This centralizes user feedback (copy/download/saves/exports) and provides consistent behavior across pages.

## CI / Test-runner considerations
- The export retry poller (background worker in `server/services/exportQueue.js`) may attempt DB connections on module load; to avoid failing CI/unit tests, it is disabled when `NODE_ENV === 'test'` or when `DISABLE_EXPORT_QUEUE` is set to `1`/`true`.
- Server-side test files set `process.env.NODE_ENV = 'test'` near the top of tests to ensure the poller remains disabled during test runs. If you run tests manually outside the repository's test script, ensure `NODE_ENV=test` is set.
- To force-disable the poller in other environments, set `DISABLE_EXPORT_QUEUE=true` in the environment.

---

## Tests
- New tests live in `server/tests/`:
  - `googleDriveService.test.js` — unit guard tests for missing env configuration.
  - `export.test.js` — an integration-style test that mocks `db.get` and `googleDriveService.getAuthUrl` to assert `POST /api/export-to-drive` returns 401 + `redirectUrl` when the user lacks tokens.

Testing notes:
- Tests avoid calling Google's real APIs by mocking the `googleDriveService` in places where external calls would occur. For CI, extend these tests to fully mock `exportToDrive` and simulate successful exports.

Run server tests from `server/`:
```powershell
npm test
```

---

## Known limitations & next steps
1. Logging & metrics: we should record export success/failure metrics (counter + timing) and include more useful log fields (export id, error reasons). TODO: implement a lightweight metrics emitter in the export path.
2. Retry/queue: exports may fail because of transient Google errors or quota; add a DB-backed retry queue (or background worker) for reliability.
3. Mocked full export tests: add tests that mock `googleDriveService.exportToDrive` to validate DB writes to `google_drive_exports` and the response shape.
4. UX: after successful OAuth callback, add a client-side hook that resumes a pending export automatically (optional improvement).
5. DOCX formatting: improve DOCX layout (headings, tables) in `googleDriveService.exportToDrive`.

Planned follow-ups (high priority): implement metrics + retry queue; add CI-safe mocked integration tests for the export path.

---

If you'd like, I can also:
- Create the mocked `exportToDrive` tests next (simulate success path and DB insert),
- Add basic server-side metrics logging for export attempts, or
- Update the frontend to automatically resume a pending export after OAuth callback.

Tell me which of the above follow-ups you want me to implement next.

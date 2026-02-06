# Google OAuth & Export Flow - Visual Guide

## Complete OAuth & Export Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: User Clicks "Export to Google Drive" Button                         │
└────────────────────────────────────────────┬────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: Frontend Checks User Authentication                                 │
│ • Is user logged in? (JWT token in localStorage)                            │
│ • If NO → Redirect to login page                                            │
│ • If YES → Continue to Step 3                                               │
└────────────────────────────────────────────┬────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: Frontend Calls GET /api/auth/google                                 │
│ • Include: Authorization: Bearer {JWT_TOKEN}                                │
│ • Backend receives request                                                  │
└────────────────────────────────────────────┬────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: Backend Generates OAuth Auth URL                                    │
│ • Extract user ID from JWT token                                            │
│ • Create state = new JWT signed with user ID                               │
│ • Call googleDriveService.getAuthUrl(state)                                │
│ • Returns: https://accounts.google.com/o/oauth2/v2/auth?...               │
│ • Response: { url: "https://accounts.google.com/..." }                     │
└────────────────────────────────────────────┬────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 5: Frontend Redirects to Google Login                                  │
│ • window.location = url (from Step 4)                                      │
│ • User sees Google login page                                              │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │ Google Login Options:                                               │   │
│ │ • User not logged in → Signs in with email/password                │   │
│ │ • User already logged in → Shows "Grant permission" screen         │   │
│ └─────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────┬────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 6: User Grants Permission to EZTutor                                   │
│ • Google shows: "EZTutor wants to access your Google Drive"                │
│ • User clicks: "Allow" or "Grant permission"                               │
│ • Google generates: authorization code (valid for ~10 minutes)             │
└────────────────────────────────────────────┬────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 7: Google Redirects Back to EZTutor                                    │
│ • Redirect URL: http://localhost:5000/api/auth/google/callback             │
│ • Includes: ?code={AUTH_CODE}&state={OUR_STATE_JWT}                        │
│ • Backend receives in req.query.code and req.query.state                   │
└────────────────────────────────────────────┬────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 8: Backend Verifies State & Extracts User ID                           │
│ • Verify state JWT signature (ensure it came from us)                       │
│ • Decode state to get user_id                                              │
│ • Security check: state is valid, matches our secret                       │
└────────────────────────────────────────────┬────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 9: Backend Exchanges Auth Code for Tokens                              │
│ • Call: googleDriveService.exchangeCodeForTokens(code)                     │
│ • Makes POST request to Google API:                                        │
│   POST https://oauth2.googleapis.com/token                                 │
│   • client_id: GOOGLE_CLIENT_ID                                            │
│   • client_secret: GOOGLE_CLIENT_SECRET                                    │
│   • code: AUTH_CODE                                                        │
│   • grant_type: authorization_code                                         │
│ • Response from Google:                                                    │
│   {                                                                        │
│     "access_token": "ya29.a0A...",                                         │
│     "refresh_token": "1//0e...",                                           │
│     "expiry_date": 1707062400                                              │
│   }                                                                        │
└────────────────────────────────────────────┬────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 10: Backend Encrypts & Stores Tokens                                   │
│ • Encrypt tokens using ENCRYPTION_KEY                                      │
│ • Call: db.run('UPDATE users SET ...')                                     │
│   UPDATE users SET                                                         │
│     google_access_token = {encrypted_access_token},                        │
│     google_refresh_token = {encrypted_refresh_token},                      │
│     google_token_expires_at = {expiry_date}                                │
│   WHERE id = {user_id}                                                     │
│ • Database now has tokens encrypted                                        │
└────────────────────────────────────────────┬────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 11: Backend Redirects User Back to Frontend                            │
│ • Redirect URL: http://localhost:3000?google_connected=1                   │
│ • Frontend detects success flag                                            │
│ • Shows success toast: "Google Drive connected!"                           │
└────────────────────────────────────────────┬────────────────────────────────┘
                                             │
                                             ▼
╚═════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 12: User Clicks "Export to Google Drive" Again (Now with tokens)       │
└────────────────────────────────────────────┬────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 13: Frontend Calls POST /api/export-to-drive                           │
│ • Include: Authorization: Bearer {JWT_TOKEN}                               │
│ • Body: {                                                                  │
│     "contentType": "lesson" | "quiz",                                     │
│     "contentId": 123                                                       │
│   }                                                                        │
└────────────────────────────────────────────┬────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 14: Backend Retrieves User's Tokens                                    │
│ • Extract user_id from JWT                                                │
│ • Query: SELECT google_access_token, google_refresh_token,                │
│          google_token_expires_at FROM users WHERE id = {user_id}          │
│ • Check: Are tokens null? → Return 401 (need to authenticate)             │
└────────────────────────────────────────────┬────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 15: Check Token Expiration & Refresh if Needed                         │
│ ┌──────────────────────────────────────────────────────────────────────┐   │
│ │ Decision Point:                                                      │   │
│ │ • Is access_token NULL?               → Need authentication         │   │
│ │ • Is google_token_expires_at < NOW()? → Token expired, refresh it   │   │
│ │ • Otherwise?                          → Token valid, use it        │   │
│ └──────────────────────────────────────────────────────────────────────┘   │
│                           │                                               │
│           ┌───────────────┼───────────────┐                               │
│           │               │               │                               │
│        Token          Need Refresh      Token Valid                       │
│       Missing          (Expired)          (Fresh)                         │
│           │               │               │                               │
│           ▼               ▼               ▼                               │
│         401            RUN REFRESH      CONTINUE                         │
│                                                                          │
└────────────────────────────────────────────┬────────────────────────────┘
                                             │
                    ┌────────────────────────┼────────────────────────────┐
                    │                        │                            │
                    ▼                        ▼                            ▼
          (Token Expired Path)     (Refresh Needed)          (Valid Token Path)
┌──────────────────────────────┐   See STEP 16              CONTINUE TO STEP 17
│ STEP 15b: Return 401         │
│ Response: {                  │
│   "error": "...",            │
│   "redirectUrl": "{auth_url}"│
│ }                            │
│ Frontend shows: "Re-auth      │
│ required" button              │
│ User clicks → Back to STEP 3  │
└──────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 16: Refresh Expired Access Token                                       │
│ • Call: googleDriveService.refreshAccessToken(refresh_token)               │
│ • Makes POST request to Google API:                                        │
│   POST https://oauth2.googleapis.com/token                                 │
│   • client_id: GOOGLE_CLIENT_ID                                            │
│   • client_secret: GOOGLE_CLIENT_SECRET                                    │
│   • refresh_token: {encrypted_refresh_token}                               │
│   • grant_type: refresh_token                                              │
│ • Google returns: { access_token, expiry_date }                            │
│ • Backend updates database:                                                │
│   UPDATE users SET                                                         │
│     google_access_token = {new_access_token},                              │
│     google_token_expires_at = {new_expiry}                                 │
│   WHERE id = {user_id}                                                     │
│ • Access token now refreshed!                                              │
└────────────────────────────────────────────┬────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 17: Fetch Content to Export                                            │
│ • Query database based on contentType:                                      │
│   • If "lesson":                                                           │
│     SELECT * FROM lesson_plans WHERE id = {contentId} AND user_id = ...   │
│   • If "quiz":                                                             │
│     SELECT * FROM quizzes WHERE id = {contentId} AND user_id = ...        │
│ • Check: Did we find the content?                                         │
│   • If NOT found → Return 404 Error                                       │
│   • If found → Continue to STEP 18                                        │
└────────────────────────────────────────────┬────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 18: Call Google Drive API to Create File                               │
│ • Decrypt access token                                                     │
│ • Call: googleDriveService.exportToDrive({                                 │
│     accessToken,                                                           │
│     contentType: "lesson" | "quiz",                                        │
│     content: { ... }                                                       │
│   })                                                                       │
│ • Makes API calls to Google Drive:                                         │
│   - POST /drive/v3/files (create file)                                     │
│   - PATCH /drive/v3/files/{fileId} (set permissions)                       │
│   - Optional: Generate DOCX, upload to Drive                               │
│ • Google returns: { id, name, webViewLink/... }                            │
└────────────────────────────────────────────┬────────────────────────────────┘
                                             │
                        ┌────────────────────┴────────────────────┐
                        │                                         │
                        ▼                                         ▼
          (Success - File Created)                  (Failure - Error Occurred)
┌──────────────────────────────────┐      ┌───────────────────────────────┐
│ STEP 19: Store Export Record     │      │ STEP 19b: Queue for Retry     │
│ • INSERT into google_drive_      │      │ • INSERT into export_retry_   │
│   exports table:                 │      │   queue table:                │
│   - user_id                      │      │   - user_id                   │
│   - content_type                 │      │   - content_type              │
│   - content_id                   │      │   - content_id                │
│   - google_file_id               │      │   - attempts = 0              │
│   - google_file_url              │      │   - next_attempt_at = NOW()   │
│   - created_at                   │      │   - error_message             │
│                                  │      │ • Return 500 (will retry)     │
│ • Return 200 Success Response:   │      │ • Background worker (every    │
│   {                              │      │   30 seconds) will attempt    │
│     "success": true,             │      │   export again               │
│     "googleDriveUrl": "...",     │      │ • Exponential backoff:       │
│     "fileName": "..."            │      │   - Attempt 1: now           │
│   }                              │      │   - Attempt 2: +60 sec       │
│ • Frontend shows success toast   │      │   - Attempt 3: +120 sec      │
│                                  │      │   - Attempt 4: +240 sec      │
│                                  │      │   - ... up to 24 hours       │
└──────────────────────────────────┘      └───────────────────────────────┘
             │                                         │
             │                                         │
             ▼                                         ▼
        Success!                             Will Retry Automatically
     File in Google Drive              (No user action needed)
```

---

## Token Lifecycle

### Access Token
- **Lifespan**: ~1 hour (3600 seconds)
- **Used for**: Making API requests (exporting files)
- **When expires**: Backend automatically refreshes using refresh token
- **Stored as**: Encrypted in `users.google_access_token`

### Refresh Token
- **Lifespan**: Long-lived (years), can expire if:
  - User revokes app access
  - User changes Google password
  - User deletes their Google account
- **Used for**: Obtaining new access tokens
- **Stored as**: Encrypted in `users.google_refresh_token`
- **Recovery**: If invalid, user must re-authenticate (401 response with re-auth prompt)

---

## Error Scenarios & Recovery

### Scenario 1: User Not Authenticated
```
User clicks "Export" → User has no JWT token
Response: 401 Unauthorized (from authRequired middleware)
Recovery: User logs in first, then tries export again
```

### Scenario 2: User Has No Google Connection
```
User clicks "Export" → No google_access_token in DB
Response: 401 + { redirectUrl: "https://accounts.google.com/..." }
Frontend: Shows "Connect Google Drive" button
Recovery: User clicks button → OAuth flow (STEP 3 onwards)
```

### Scenario 3: Token Expired (Automatic Recovery)
```
User clicks "Export" → Access token expired
Backend: Calls refreshAccessToken() with refresh_token
If successful: New access token obtained, export continues
If failed: Returns 401 + re-auth prompt
```

### Scenario 4: Export Fails (Auto-Retry)
```
User clicks "Export" → File creation fails (quota exceeded, timeout, etc.)
Backend: Inserts into export_retry_queue
Response: 500 error (but will retry automatically)
Background Worker: Attempts again in 30 seconds
Exponential Backoff: 1st attempt at 1m, 2nd at 2m, 3rd at 4m, etc.
Max Retries: ~24 hours total
Success: File eventually created and moved to google_drive_exports
```

---

## Key Security Points

✅ **What's Protected**:
- Tokens are encrypted in database (not stored as plain text)
- Refresh token never sent to frontend
- State parameter prevents CSRF attacks (signed JWT)
- User ID verified by comparing state JWT with request user

⚠️ **What to Monitor**:
- Check `export_retry_queue` for repeated failures
- Monitor token refresh errors (may indicate credential rotation needed)
- Watch for unusual export patterns (potential misuse)

---

## Testing the Flow

### Local Testing Checklist
- [ ] User can click "Export" without authentication → Gets login redirect
- [ ] User can authenticate with Google → Gets success toast
- [ ] Token is stored encrypted in DB (check with: `SELECT google_access_token FROM users;`)
- [ ] User can export immediately after auth → File appears in Google Drive
- [ ] User can export again 1hr later → Token auto-refreshes
- [ ] Export with invalid token → Gets re-auth prompt

### Production Testing
- [ ] Verify GOOGLE_REDIRECT_URI matches production domain
- [ ] Test with real Google account
- [ ] Verify file permissions are correct (user can access shared files)
- [ ] Check that `/EZTutor Exports` folder is created automatically
- [ ] Monitor retry queue for failures

---

Last Updated: February 2026

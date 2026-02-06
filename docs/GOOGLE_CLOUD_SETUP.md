# Google Cloud Project & API Integration Guide

This guide walks you through creating a Google Cloud project, setting up the Google Drive API, and integrating it with EZTutor for exporting lessons and quizzes to Google Drive.

---

## Table of Contents
1. [Part 1: Create Google Cloud Project](#part-1-create-google-cloud-project)
2. [Part 2: Enable Google Drive API](#part-2-enable-google-drive-api)
3. [Part 3: Create OAuth 2.0 Credentials](#part-3-create-oauth-20-credentials)
4. [Part 4: Configure EZTutor Environment](#part-4-configure-eztutor-environment)
5. [Part 5: Test Integration](#part-5-test-integration)
6. [Troubleshooting](#troubleshooting)

---

## Part 1: Create Google Cloud Project

### Step 1.1: Go to Google Cloud Console
1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account (create one if needed)
3. You'll see a dashboard with a project selector at the top (currently might say "My First Project")

### Step 1.2: Create a New Project
1. Click the **Project Selector** dropdown at the top (shows project name and ID)
2. Click **"Create Project"** button
3. In the dialog:
   - **Project name**: Enter `EZTutor` (or your preferred name)
   - **Organization**: Leave as "No organization" (or select your org if you have one)
   - **Location**: Leave default
4. Click **"Create"**
5. Wait 1-2 minutes for the project to be created
6. You should see a notification confirming the project was created

### Step 1.3: Select Your New Project
1. Click the Project Selector dropdown again
2. Find and select your new `EZTutor` project
3. The console should now show the EZTutor project as active

✅ **Project created successfully!**

---

## Part 2: Enable Google Drive API

### Step 2.1: Navigate to APIs & Services
1. In the Google Cloud Console, click the **hamburger menu** (☰) in the top-left
2. Under **"APIs & Services"**, click **"Library"**
3. You'll see the API Library with a search bar

### Step 2.2: Search for Google Drive API
1. In the search bar, type `"Google Drive API"`
2. Click the **"Google Drive API"** result
3. You'll see the API overview page with a blue **"Enable"** button

### Step 2.3: Enable the API
1. Click the **"Enable"** button
2. Wait a few seconds for the API to be enabled
3. You should see a confirmation message and the button will change to a settings icon

✅ **Google Drive API enabled!**

### Step 2.4: (Optional) Enable Google Docs API
If you plan to generate Google Docs files (not just Word docs), also enable:
1. Go back to **"APIs & Services" > "Library"**
2. Search for `"Google Docs API"`
3. Click **"Enable"**

---

## Part 3: Create OAuth 2.0 Credentials

### Step 3.1: Go to Credentials
1. In the Google Cloud Console, click hamburger menu (☰)
2. Under **"APIs & Services"**, click **"Credentials"**
3. You'll see a page with a **"+ Create Credentials"** button at the top

### Step 3.2: Create OAuth Consent Screen (REQUIRED FIRST)
Before creating OAuth credentials, you need to configure the consent screen:

1. Click **"OAuth consent screen"** in the left sidebar
2. Select **"External"** for User Type (unless you have a Google Workspace)
3. Click **"Create"**
4. Fill out the **OAuth consent screen form**:
   - **App name**: `EZTutor`
   - **User support email**: Your email (e.g., your-email@gmail.com)
   - **Developer contact**: Your email
5. Click **"Save and Continue"**
6. On **"Scopes"** page, click **"Save and Continue"** (scopes auto-populated)
7. On **"Test users"** (optional), add any test email addresses, then click **"Save and Continue"**
8. Review the summary and click **"Back to Dashboard"**

✅ **OAuth consent screen configured!**

### Step 3.3: Create OAuth 2.0 Client ID
1. In **"Credentials"** page, click **"+ Create Credentials"** button
2. Select **"OAuth client ID"**
3. In the dialog, select **Application type**: **"Web application"**
4. Under **"Authorized redirect URIs"**, add:
   ```
   http://localhost:5000/api/auth/google/callback
   https://your-production-domain.com/api/auth/google/callback
   ```
   - Replace `your-production-domain.com` with your actual domain (e.g., `eztutor.onrender.com` if using Render)
   - Keep both localhost and production URLs for flexibility
5. Click **"Create"**
6. A dialog will appear with your credentials:
   - **Client ID**: Copy this value
   - **Client Secret**: Copy this value
7. Click **"Download JSON"** to download credentials file (save it safely)
8. Click **"OK"** to close

✅ **OAuth credentials created!**

### Step 3.4: Create Service Account (Optional, for Server-to-Server)
If you plan to export files on behalf of users automatically:

1. In **"Credentials"** page, click **"+ Create Credentials"**
2. Select **"Service Account"**
3. Fill in:
   - **Service account name**: `eztutor-export`
   - **Service account ID**: Auto-filled
4. Click **"Create and Continue"**
5. Click **"Continue"** on the permission grants step
6. Click **"Create Key"**, select **"JSON"**, and click **"Create"**
7. A JSON file will download - save it securely
8. Click **"Done"**

---

## Part 4: Configure EZTutor Environment

### Step 4.1: Set Environment Variables
Create or update your `.env` file in the server directory:

```bash
# Google OAuth Credentials (from Step 3.3)
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE

# Redirect URL (must match OAuth credentials)
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# (Production) Update this when deployed
# GOOGLE_REDIRECT_URI=https://your-domain.com/api/auth/google/callback

# Encryption key for storing tokens securely
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your_32_byte_hex_string_here

# Optional: Service account key (for automatic exports)
# GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./service-account-key.json
```

### Step 4.2: Store Sensitive Files Securely
1. **OAuth Credentials JSON**: Save outside version control
   ```bash
   # Move the downloaded JSON to a safe location
   mv ~/Downloads/client_secret_*.json ./server/credentials/
   ```

2. **Service Account Key** (if created):
   ```bash
   # Add to server/.gitignore
   echo "credentials/" >> server/.gitignore
   echo "*.key.json" >> server/.gitignore
   ```

### Step 4.3: Generate Encryption Key
Generate a secure 32-byte hex key for token encryption:

```bash
# Run in Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and add it to `.env` as `ENCRYPTION_KEY`.

### Step 4.4: Update Frontend Configuration
In client-side code, the frontend will:
1. Request auth URL from `/api/auth/google`
2. Redirect user to Google OAuth login
3. Google redirects back to `/api/auth/google/callback`
4. Backend stores encrypted tokens in database
5. User receives success notification

No additional frontend environment variables needed (backend handles OAuth).

---

## Part 5: Test Integration

### Step 5.1: Start Dev Environment
```bash
# In server directory
npm install
npm start

# In separate terminal, in client directory
npm install
npm start
```

### Step 5.2: Test OAuth Flow
1. Open client app (usually http://localhost:3000)
2. Navigate to a lesson or quiz export page
3. Click **"Export to Google Drive"** button
4. You'll be redirected to Google login
5. Sign in with your Google account
6. Grant permission to "EZTutor" to access your Google Drive
7. You'll be redirected back to the app
8. You should see a success notification

### Step 5.3: Verify Token Storage
Check that tokens are securely stored:
1. In database, check `users` table
2. Look for `google_access_token`, `google_refresh_token`, `google_token_expires_at`
3. Tokens should be encrypted (not plain text)

### Step 5.4: Test Export
1. Create or select a lesson/quiz
2. Click **"Export to Google Drive"**
3. In your Google Drive, you should see:
   - New folder: `/EZTutor Exports`
   - File: `Lesson Plan - [Title]` (DOCX format) or similar

### Step 5.5: Test Token Refresh
To verify token refresh works:
1. Export multiple items in one session
2. If first export triggers a token refresh, subsequent exports should use the refreshed token
3. Check logs for `[google-drive-service] token refreshed` messages

✅ **Integration working!**

---

## Part 6: Production Deployment

### Step 6.1: Update Environment Variables
Before deploying (Render, Vercel, Heroku, etc.):

1. Add to your hosting service's environment variables:
   ```
   GOOGLE_CLIENT_ID=YOUR_PROD_CLIENT_ID
   GOOGLE_CLIENT_SECRET=YOUR_PROD_CLIENT_SECRET
   GOOGLE_REDIRECT_URI=https://your-production-domain.com/api/auth/google/callback
   ENCRYPTION_KEY=your_production_encryption_key
   DATABASE_URL=your_postgres_url
   JWT_SECRET=your_jwt_secret
   ```

2. In **Google Cloud Console**, update OAuth credentials:
   - Go to **Credentials** > **OAuth 2.0 Client IDs**
   - Click your Web application credential
   - Add your production domain to **Authorized redirect URIs**:
     ```
     https://your-production-domain.com/api/auth/google/callback
     ```
   - Save

### Step 6.2: Verify Deployment
1. Deploy your app to production
2. Test OAuth flow on production domain
3. Verify tokens are stored with new production credentials
4. Test export functionality

---

## Troubleshooting

### "Invalid Client ID" Error
- **Cause**: Client ID in `.env` doesn't match Google Cloud credentials
- **Fix**: Double-check `GOOGLE_CLIENT_ID` in `.env` matches exactly what you copied from Google Cloud Console
- **Verify**: Run `echo $GOOGLE_CLIENT_ID` to see what's actually set

### "Redirect URI mismatch" Error
- **Cause**: OAuth redirect URL in request doesn't match credentials
- **Fix**: Ensure `GOOGLE_REDIRECT_URI` in `.env` exactly matches one of the URIs in Google Cloud OAuth settings
- **Common issue**: `http://localhost:5000` vs `http://localhost:5000/` (trailing slash)

### "Token refresh failed" or "Invalid refresh token"
- **Cause**: User revoked access or refresh token expired
- **Fix**: User must re-authenticate by clicking "Connect Google" again
- **Recovery**: Frontend handles this with 401 response and shows re-auth prompt

### "Permission denied" on Google Drive
- **Cause**: Scope issue - app may not have permission to create files
- **Fix**: 
  1. In Google Cloud Console, go to OAuth consent screen
  2. Check that `https://www.googleapis.com/auth/drive` is in the scopes
  3. User must revoke access (in Google account settings) and re-authenticate

### "Daily limit exceeded" Error
- **Cause**: Hit Google API rate limits (very rare)
- **Fix**: Export is auto-queued for retry with exponential backoff
- **Monitor**: Check `export_retry_queue` table in database

### Tokens Not Encrypting
- **Cause**: `ENCRYPTION_KEY` not set or invalid format
- **Fix**: 
  1. Generate new key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
  2. Add to `.env`: `ENCRYPTION_KEY=<output>`
  3. Restart server

### "Can't find module 'googleapis'"
- **Cause**: Dependencies not installed
- **Fix**: 
  ```bash
  cd server
  npm install
  ```

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (React)                           │
│  - Export button triggers OAuth flow                        │
│  - Redirects to /api/auth/google endpoint                   │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│            Backend API (Express)                            │
│  1. /api/auth/google - generates auth URL                   │
│  2. /api/auth/google/callback - handles OAuth redirect      │
│  3. /api/export-to-drive - exports to Google Drive          │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│           Google OAuth & Drive API                          │
│  - Authenticates user                                       │
│  - Issues access & refresh tokens                           │
│  - Creates files in user's Google Drive                     │
└────────────────┬────────────────────────────────────────────┘
                 │
┌─────────────────────────────────────────────────────────────┐
│        Database (PostgreSQL)                                │
│  - Stores encrypted tokens in users table                   │
│  - Tracks export history in google_drive_exports            │
│  - Queues failed exports in export_retry_queue              │
└─────────────────────────────────────────────────────────────┘
```

---

## Next Steps

1. ✅ Complete this guide
2. 🔄 Test OAuth flow locally
3. 🚀 Deploy to production
4. 📊 Monitor export queue for failures
5. 🔐 Rotate credentials periodically (3-6 months)

For more details on backend implementation, see [GOOGLE_DRIVE_INTEGRATION.md](./GOOGLE_DRIVE_INTEGRATION.md).

# Google Cloud Setup - Quick Reference

## 🚀 Quick Start Checklist

- [ ] Create Google Cloud project
- [ ] Enable Google Drive API
- [ ] Create OAuth consent screen
- [ ] Create OAuth 2.0 credentials (Web application)
- [ ] Download Client ID and Secret
- [ ] Add to `.env` file
- [ ] Generate and add `ENCRYPTION_KEY`
- [ ] Test locally (http://localhost:5000)
- [ ] Deploy and update production URIs
- [ ] Test on production domain

---

## 📋 Environment Variables Template

```bash
# Copy this template to server/.env

# Google OAuth (from https://console.cloud.google.com/)
GOOGLE_CLIENT_ID=<your-client-id-here>
GOOGLE_CLIENT_SECRET=<your-client-secret-here>

# Redirect URI (must match Google Cloud OAuth settings)
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Token encryption key (generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=<your-32-byte-hex-string>

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/eztutor

# JWT
JWT_SECRET=<your-jwt-secret-key>

# Optional: Service Account (for server-to-server operations)
# GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./credentials/service-account-key.json
```

---

## 🔑 Where to Find Credentials

| Item | Location in Google Cloud |
|------|-------------------------|
| Client ID | Credentials → OAuth 2.0 Client IDs → Web application |
| Client Secret | Same as above |
| Scopes | APIs & Services → Google Drive API → Scopes required |
| API Status | APIs & Services → Enabled APIs & Services |

---

## 🔗 Important URLs

| Purpose | URL |
|---------|-----|
| Google Cloud Console | https://console.cloud.google.com/ |
| Create Credentials | https://console.cloud.google.com/apis/credentials |
| OAuth Consent | https://console.cloud.google.com/apis/credentials/consent |
| Enable APIs | https://console.cloud.google.com/apis/library |
| Google Drive API | https://console.cloud.google.com/apis/library/drive.googleapis.com |

---

## 🛠️ Common Commands

### Generate Encryption Key
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Test OAuth Flow Locally
```bash
cd server && npm start
# In another terminal:
cd client && npm start
# Open http://localhost:3000 and click Export
```

### Check Environment Variables
```bash
# Verify they're set
echo "Client ID: $GOOGLE_CLIENT_ID"
echo "Encryption Key set: $ENCRYPTION_KEY"
```

### Verify Tokens in Database
```sql
-- Check users table
SELECT id, email, google_access_token, google_token_expires_at 
FROM users 
WHERE google_access_token IS NOT NULL;

-- Check export history
SELECT user_id, content_type, content_id, google_file_id, created_at 
FROM google_drive_exports 
ORDER BY created_at DESC LIMIT 10;

-- Check retry queue
SELECT id, user_id, content_type, attempts, next_attempt_at 
FROM export_retry_queue 
WHERE status = 'pending';
```

---

## 🐛 Troubleshooting Quick Fixes

| Error | Quick Fix |
|-------|-----------|
| "Invalid Client ID" | Copy Client ID exactly from Google Cloud (no extra spaces) |
| "Redirect URI mismatch" | Check trailing slashes match: `localhost:5000/callback` vs `localhost:5000/callback/` |
| "API not enabled" | Go to APIs & Services → Library → Google Drive API → Enable |
| "Token expired" | User must re-authenticate (normal flow, auto-handled) |
| "Permission denied" | Check scopes include `https://www.googleapis.com/auth/drive` |
| "ENCRYPTION_KEY not set" | Generate new key and add to `.env`, restart server |

---

## 📱 OAuth Flow Sequence

```
User clicks "Export to Google Drive"
         ↓
GET /api/auth/google (backend generates auth URL)
         ↓
Redirect to: https://accounts.google.com/o/oauth2/v2/auth?...
         ↓
User signs in (or is already signed in)
         ↓
Google redirects to: /api/auth/google/callback?code=AUTH_CODE&state=USER_JWT
         ↓
Backend exchanges code for tokens
         ↓
Backend stores encrypted tokens in database
         ↓
Redirect to frontend → Success notification
         ↓
User can now export to Google Drive
```

---

## 🔐 Security Checklist

- [ ] Never commit `ENCRYPTION_KEY` or credentials to Git
- [ ] Store credentials file (`credentials.json`) outside repo
- [ ] Add `credentials/` and `*.key.json` to `.gitignore`
- [ ] Rotate `ENCRYPTION_KEY` every 6 months
- [ ] Rotate `GOOGLE_CLIENT_SECRET` periodically
- [ ] Use HTTPS only in production
- [ ] Test token refresh works (automatic re-auth)
- [ ] Monitor `export_retry_queue` for repeated failures

---

## 📞 Support Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Drive API Documentation](https://developers.google.com/drive/api/guides/about-sdk)
- [EZTutor Integration Docs](./GOOGLE_DRIVE_INTEGRATION.md)
- [EZTutor Full Setup Guide](./GOOGLE_CLOUD_SETUP.md)

---

## 🎯 After Setup

1. **Local Testing**: Verify OAuth works on `http://localhost:3000`
2. **Export Testing**: Try exporting a lesson or quiz
3. **Google Drive Check**: Verify files appear in `/EZTutor Exports` folder
4. **Database Check**: Verify tokens are encrypted and stored
5. **Retry Queue**: (Optional) Force a failure to test auto-retry
6. **Production Deployment**: Update URIs and test again

---

Last updated: February 2026

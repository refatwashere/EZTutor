# Google Integration Documentation Index

Complete step-by-step guides for setting up Google Cloud, configuring OAuth 2.0, and integrating Google Drive exports with EZTutor.

---

## 📚 Documentation Files

### 1. **[GOOGLE_CLOUD_SETUP.md](GOOGLE_CLOUD_SETUP.md)** ⭐ START HERE
**Best for:** First-time Google Cloud project creation
- Complete step-by-step guide with screenshots descriptions
- Part 1: Create Google Cloud Project
- Part 2: Enable Google Drive API
- Part 3: Create OAuth 2.0 Credentials
- Part 4: Configure EZTutor Environment
- Part 5: Test Integration
- Part 6: Production Deployment
- Troubleshooting section

**Read time:** ~15 minutes | **Follow-along time:** ~30 minutes

---

### 2. **[GOOGLE_CLOUD_QUICK_REF.md](GOOGLE_CLOUD_QUICK_REF.md)** ⚡ QUICK LOOKUP
**Best for:** Quick reference during setup
- Concise checklist format
- Environment variables template (copy-paste ready)
- Where to find credentials
- Important URLs
- Common commands
- Troubleshooting quick fixes

**Read time:** ~3 minutes | **Reference time:** As needed

---

### 3. **[INTEGRATION_CHECKLIST.md](INTEGRATION_CHECKLIST.md)** ✅ VERIFICATION
**Best for:** Verifying your setup is complete
- Detailed architecture diagrams
- Step-by-step integration checklist
- Part 1-8 comprehensive verification steps
- Key file locations reference
- Expected test coverage
- Learning resources

**Read time:** ~10 minutes | **Verification time:** ~30 minutes

---

### 4. **[OAUTH_FLOW_DETAILED.md](OAUTH_FLOW_DETAILED.md)** 🔄 TECHNICAL DEEP DIVE
**Best for:** Understanding the complete OAuth flow
- Complete OAuth authentication flow (19 steps)
- Export flow with token refresh
- Token lifecycle explanation
- Error scenarios & recovery paths
- Security checkpoints
- Testing scenarios

**Read time:** ~20 minutes | **Development reference**

---

### 5. **[GOOGLE_DRIVE_INTEGRATION.md](GOOGLE_DRIVE_INTEGRATION.md)** 🛠️ IMPLEMENTATION DETAILS
**Best for:** Understanding backend implementation
- OAuth token management
- Token encryption/decryption
- Export queue & retry logic
- Background worker scheduling
- API error handling
- Database schema

**Read time:** ~15 minutes | **Development reference**

---

### 6. **[.env.example](../server/.env.example)** 📋 CONFIGURATION TEMPLATE
**Best for:** Setting up environment variables
- Template with all required variables
- Explanations for each variable
- Example values
- Notes for different environments (local/prod)
- Security warnings

**Copy this file:** `cp server/.env.example server/.env` then edit

---

## 🎯 Quick Navigation Guide

### I want to...

**...set up Google Cloud from scratch**
→ Read: [GOOGLE_CLOUD_SETUP.md](GOOGLE_CLOUD_SETUP.md) (Part 1-3)

**...configure EZTutor environment variables**
→ Read: [GOOGLE_CLOUD_SETUP.md](GOOGLE_CLOUD_SETUP.md) (Part 4) + [.env.example](../server/.env.example)

**...test locally**
→ Read: [GOOGLE_CLOUD_SETUP.md](GOOGLE_CLOUD_SETUP.md) (Part 5)

**...deploy to production**
→ Read: [GOOGLE_CLOUD_SETUP.md](GOOGLE_CLOUD_SETUP.md) (Part 6) + [DEPLOYMENT.md](DEPLOYMENT.md)

**...understand the OAuth flow**
→ Read: [OAUTH_FLOW_DETAILED.md](OAUTH_FLOW_DETAILED.md)

**...verify my integration is complete**
→ Use: [INTEGRATION_CHECKLIST.md](INTEGRATION_CHECKLIST.md)

**...troubleshoot an issue**
→ See: [GOOGLE_CLOUD_QUICK_REF.md](GOOGLE_CLOUD_QUICK_REF.md) (Troubleshooting section)

**...look up an environment variable**
→ See: [GOOGLE_CLOUD_QUICK_REF.md](GOOGLE_CLOUD_QUICK_REF.md) (Environment Variables Template)

**...understand how exports are processed**
→ Read: [GOOGLE_DRIVE_INTEGRATION.md](GOOGLE_DRIVE_INTEGRATION.md)

**...check database schema**
→ Read: [INTEGRATION_CHECKLIST.md](INTEGRATION_CHECKLIST.md) (Part 3: Database Schema)

---

## 📊 Reading Path by Role

### For Developers Setting Up Locally
1. [GOOGLE_CLOUD_SETUP.md](GOOGLE_CLOUD_SETUP.md) - Parts 1-5 (Google Cloud + Local Testing)
2. [.env.example](../server/.env.example) - Configure environment
3. [OAUTH_FLOW_DETAILED.md](OAUTH_FLOW_DETAILED.md) - Understand the flow
4. [GOOGLE_DRIVE_INTEGRATION.md](GOOGLE_DRIVE_INTEGRATION.md) - Deep dive reference

### For Operations/DevOps (Deployment)
1. [GOOGLE_CLOUD_SETUP.md](GOOGLE_CLOUD_SETUP.md) - Parts 1-3 (Create credentials)
2. [GOOGLE_CLOUD_SETUP.md](GOOGLE_CLOUD_SETUP.md) - Part 6 (Production Deployment)
3. [DEPLOYMENT.md](DEPLOYMENT.md) - Platform-specific deployment
4. [INTEGRATION_CHECKLIST.md](INTEGRATION_CHECKLIST.md) - Part 7 (Production Verification)

### For Backend Developers
1. [OAUTH_FLOW_DETAILED.md](OAUTH_FLOW_DETAILED.md) - Complete flow understanding
2. [GOOGLE_DRIVE_INTEGRATION.md](GOOGLE_DRIVE_INTEGRATION.md) - Implementation details
3. [INTEGRATION_CHECKLIST.md](INTEGRATION_CHECKLIST.md) - Architecture diagrams
4. Code review: `server/services/googleDriveService.js`, `server/routes/api.js`

### For Frontend Developers
1. [OAUTH_FLOW_DETAILED.md](OAUTH_FLOW_DETAILED.md) - User flow perspective
2. [GOOGLE_CLOUD_SETUP.md](GOOGLE_CLOUD_SETUP.md) - Part 5 (Testing)
3. Code review: `client/src/context/NotificationContext.js`, export page components

### For QA/Testing
1. [INTEGRATION_CHECKLIST.md](INTEGRATION_CHECKLIST.md) - Part 5 (Testing Locally)
2. [INTEGRATION_CHECKLIST.md](INTEGRATION_CHECKLIST.md) - Part 6 (Error Handling)
3. [OAUTH_FLOW_DETAILED.md](OAUTH_FLOW_DETAILED.md) - Error Scenarios section
4. Create test cases based on each scenario

---

## 🔑 Key Concepts

### OAuth 2.0 Authorization Code Flow
When a user wants to export to Google Drive:
1. Frontend redirects to Google login
2. User signs in and grants permission
3. Google redirects back with authorization code
4. Backend exchanges code for access & refresh tokens
5. Tokens stored securely (encrypted)
6. User can now export with valid access token

→ See: [OAUTH_FLOW_DETAILED.md](OAUTH_FLOW_DETAILED.md) - Steps 1-11

### Token Refresh
When access token expires (every ~1 hour):
1. Backend detects expiration
2. Uses refresh token to get new access token
3. Updates database with new token
4. Export continues seamlessly

→ See: [OAUTH_FLOW_DETAILED.md](OAUTH_FLOW_DETAILED.md) - Step 16

### Export Retry Queue
When export fails (quota exceeded, timeout, etc.):
1. Export inserted into `export_retry_queue` table
2. Background worker checks queue every 30 seconds
3. Attempts export again with exponential backoff
4. Retries for up to 24 hours
5. On success, moves to `google_drive_exports` table

→ See: [GOOGLE_DRIVE_INTEGRATION.md](GOOGLE_DRIVE_INTEGRATION.md) - Export Queue section

### Token Encryption
All Google tokens encrypted before database storage:
- Uses `ENCRYPTION_KEY` from `.env`
- Decrypted only when needed (API calls)
- Prevents data breaches from exposing tokens

→ See: [GOOGLE_DRIVE_INTEGRATION.md](GOOGLE_DRIVE_INTEGRATION.md) - Token Management section

---

## 🧪 Testing Checklist

### Local Testing
```bash
# 1. Create Google Cloud project
# Follow: GOOGLE_CLOUD_SETUP.md Parts 1-3

# 2. Configure environment
cp server/.env.example server/.env
# Edit .env with your credentials

# 3. Start development servers
cd server && npm install && npm start
cd ../client && npm install && npm start

# 4. Test OAuth flow
# Go to http://localhost:3000
# Click "Export to Google Drive" button
# Follow the authentication flow
# ✓ Should see success toast
# ✓ File should appear in Google Drive
```

### Local Testing Edge Cases
```bash
# 1. Test token refresh
# Modify DB: UPDATE users SET google_token_expires_at = NOW() - interval '1 hour'
# Attempt export → Should auto-refresh token

# 2. Test failed export
# Modify DB: DELETE FROM example_table (to break export)
# Attempt export → Should queue for retry
# Wait 30 seconds → Check export_retry_queue table

# 3. Test re-authentication
# Revoke access in Google account settings
# Attempt export → Should get 401 + re-auth prompt
# Click button to re-authenticate
```

### Production Testing
- [ ] Test OAuth with production domain
- [ ] Verify tokens encrypted in production DB
- [ ] Test export success path
- [ ] Monitor retry queue
- [ ] Verify Google Drive folder permissions

---

## 📞 Support & Resources

### Official Documentation
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Drive API Documentation](https://developers.google.com/drive/api/guides/about-sdk)
- [Google API Error Codes](https://developers.google.com/drive/api/guides/handle-errors)
- [Google API Rate Limits](https://developers.google.com/drive/api/guides/limits-and-quotas)

### EZTutor Documentation
- [Architecture Overview](architecture.md)
- [Security Guide](SECURITY.md)
- [Deployment Guide](DEPLOYMENT.md)
- [API Schema](api-schema.md)

### Common Issues
See [GOOGLE_CLOUD_QUICK_REF.md](GOOGLE_CLOUD_QUICK_REF.md) - Troubleshooting Quick Fixes

---

## 📋 Checklists

### Pre-Launch Checklist
- [ ] Google Cloud project created
- [ ] Google Drive API enabled
- [ ] OAuth credentials created (local + production)
- [ ] Environment variables configured
- [ ] Database schema updated
- [ ] Frontend components integrated
- [ ] Local testing passed
- [ ] Production environment variables set
- [ ] Deployment testing passed
- [ ] Monitoring/alerts configured

### After Deployment
- [ ] OAuth flow works on production domain
- [ ] Exports appear in Google Drive
- [ ] Tokens are encrypted in production DB
- [ ] Retry queue is monitored
- [ ] Error logs are being collected
- [ ] User documentation is published

---

## 🎓 Learning Objectives

After completing all documentation, you should understand:

✅ How to create a Google Cloud project  
✅ How to enable Google Drive API  
✅ How to create OAuth 2.0 credentials  
✅ How OAuth 2.0 authorization code flow works  
✅ How tokens are stored securely (encrypted)  
✅ How token refresh works automatically  
✅ How exports are retried with exponential backoff  
✅ How to configure EZTutor for Google integration  
✅ How to test locally and in production  
✅ How to troubleshoot common issues  
✅ How to monitor exports and token usage  

---

## 📈 Documentation Statistics

| Document | Lines | Read Time | Purpose |
|----------|-------|-----------|---------|
| GOOGLE_CLOUD_SETUP.md | ~450 | 15 min | Step-by-step setup guide |
| GOOGLE_CLOUD_QUICK_REF.md | ~350 | 3 min | Quick reference card |
| INTEGRATION_CHECKLIST.md | ~600 | 10 min | Verification checklist |
| OAUTH_FLOW_DETAILED.md | ~500 | 20 min | Technical deep dive |
| GOOGLE_DRIVE_INTEGRATION.md | ~400 | 15 min | Implementation details |
| .env.example | ~100 | 5 min | Configuration template |
| **TOTAL** | **~2,400** | **~1 hour** | Complete guide |

---

## 🔄 Update History

| Date | Changes |
|------|---------|
| Feb 2026 | Initial documentation suite created |
| Feb 2026 | Added OAuth flow diagrams and error scenarios |
| Feb 2026 | Added integration checklist and architecture diagrams |

---

## 📞 Questions?

Refer to the appropriate document:
- **Setup questions?** → [GOOGLE_CLOUD_SETUP.md](GOOGLE_CLOUD_SETUP.md)
- **Configuration help?** → [.env.example](../server/.env.example) + [GOOGLE_CLOUD_QUICK_REF.md](GOOGLE_CLOUD_QUICK_REF.md)
- **Understanding the flow?** → [OAUTH_FLOW_DETAILED.md](OAUTH_FLOW_DETAILED.md)
- **Verification checklist?** → [INTEGRATION_CHECKLIST.md](INTEGRATION_CHECKLIST.md)
- **Implementation details?** → [GOOGLE_DRIVE_INTEGRATION.md](GOOGLE_DRIVE_INTEGRATION.md)

---

**Start with [GOOGLE_CLOUD_SETUP.md](GOOGLE_CLOUD_SETUP.md) if you haven't set up Google Cloud yet!**

Created: February 2026 | Last Updated: February 2026

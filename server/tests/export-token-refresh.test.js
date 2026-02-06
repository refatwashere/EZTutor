const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const app = require('../index');

test('POST /api/export-to-drive with expired token refreshes and exports', async () => {
  const token = jwt.sign({ id: 85 }, process.env.JWT_SECRET);

  const db = require('../db');
  const googleDriveService = require('../services/googleDriveService');

  const origDbGet = db.get;
  const origDbRun = db.run;
  const origExport = googleDriveService.exportToDrive;
  const origRefresh = googleDriveService.refreshAccessToken;
  const origDecrypt = googleDriveService.decryptToken;

  let updateCalled = false;

  try {
    db.get = async (sql, params) => {
      if (sql.includes('FROM users')) {
        return {
          id: 85,
          google_access_token: 'enc_expired_token',
          google_refresh_token: 'enc_refresh_token',
          // Token expired 1 hour ago
          google_token_expires_at: new Date(Date.now() - 3600 * 1000).toISOString()
        };
      }
      if (sql.includes('FROM lesson_plans')) {
        return { id: 20, user_id: 85, title: 'Fresh Lesson', content: {} };
      }
      return null;
    };

    db.run = async (sql, params) => {
      if (sql.includes('UPDATE users SET google_access_token')) {
        updateCalled = true;
      }
      if (sql.includes('INSERT INTO google_drive_exports')) {
        return { rows: [] };
      }
      return { rows: [] };
    };

    googleDriveService.decryptToken = (t) => 'decrypted_token';
    
    googleDriveService.refreshAccessToken = async (refreshToken) => {
      return {
        access_token: 'new_access_token_123',
        refresh_token: 'new_refresh_token_456',
        expiry_date: new Date(Date.now() + 3600000).getTime()
      };
    };

    googleDriveService.exportToDrive = async ({ accessToken, refreshToken, contentType }) => {
      assert.equal(accessToken, 'new_access_token_123', 'expected to use new access token');
      return { id: 'g20', url: 'https://drive.test/g20', name: 'Fresh Lesson' };
    };

    const res = await request(app)
      .post('/api/export-to-drive')
      .set('Authorization', `Bearer ${token}`)
      .send({ contentType: 'lesson', contentId: 20 });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(updateCalled, 'expected UPDATE users call after refresh');
  } finally {
    db.get = origDbGet;
    db.run = origDbRun;
    googleDriveService.exportToDrive = origExport;
    googleDriveService.refreshAccessToken = origRefresh;
    googleDriveService.decryptToken = origDecrypt;
  }
});

test('POST /api/export-to-drive with invalid refresh token returns 401 re-auth', async () => {
  const token = jwt.sign({ id: 86 }, process.env.JWT_SECRET);

  const db = require('../db');
  const googleDriveService = require('../services/googleDriveService');

  const origDbGet = db.get;
  const origRefresh = googleDriveService.refreshAccessToken;
  const origDecrypt = googleDriveService.decryptToken;
  const origGetAuthUrl = googleDriveService.getAuthUrl;

  try {
    db.get = async (sql, params) => {
      if (sql.includes('FROM users')) {
        return {
          id: 86,
          google_access_token: 'enc_expired_token',
          google_refresh_token: 'enc_invalid_refresh',
          google_token_expires_at: new Date(Date.now() - 3600000).toISOString()
        };
      }
      return null;
    };

    googleDriveService.decryptToken = (t) => 'decrypted_but_invalid_token';

    googleDriveService.refreshAccessToken = async (refreshToken) => {
      // Simulate invalid refresh token (expired or revoked)
      const err = new Error('Invalid refresh token');
      err.code = 'INVALID_GRANT';
      throw err;
    };

    googleDriveService.getAuthUrl = (state) => {
      return 'https://accounts.google.com/o/oauth2/v2/auth?test=1&state=' + state;
    };

    const res = await request(app)
      .post('/api/export-to-drive')
      .set('Authorization', `Bearer ${token}`)
      .send({ contentType: 'lesson', contentId: 21 });

    assert.equal(res.status, 401);
    assert.ok(res.body.error, 'expected error field');
    assert.ok(res.body.redirectUrl, 'expected redirectUrl for re-auth');
  } finally {
    db.get = origDbGet;
    googleDriveService.refreshAccessToken = origRefresh;
    googleDriveService.decryptToken = origDecrypt;
    googleDriveService.getAuthUrl = origGetAuthUrl;
  }
});

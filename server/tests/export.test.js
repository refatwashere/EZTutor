const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const app = require('../index');

test('POST /api/export-to-drive returns 401 + redirectUrl when user has no Google tokens', async () => {
  // Prepare a JWT for auth
  const token = jwt.sign({ id: 42 }, process.env.JWT_SECRET);

  // Monkeypatch db and googleDriveService to avoid external deps
  const db = require('../db');
  const googleDriveService = require('../services/googleDriveService');

  const origDbGet = db.get;
  const origGetAuthUrl = googleDriveService.getAuthUrl;

  try {
    // Simulate user row with no google tokens
    db.get = async () => ({ google_refresh_token: null });
    googleDriveService.getAuthUrl = (state) => `https://auth.example/?state=${encodeURIComponent(state)}`;

    const res = await request(app)
      .post('/api/export-to-drive')
      .set('Authorization', `Bearer ${token}`)
      .send({ contentType: 'lesson', contentId: 1 });

    assert.equal(res.status, 401);
    assert.ok(res.body.redirectUrl && res.body.redirectUrl.startsWith('https://auth.example/'));
  } finally {
    db.get = origDbGet;
    googleDriveService.getAuthUrl = origGetAuthUrl;
  }
});

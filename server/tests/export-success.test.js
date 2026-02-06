const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const app = require('../index');

test('POST /api/export-to-drive success path stores export and returns url', async () => {
  const token = jwt.sign({ id: 77 }, process.env.JWT_SECRET);

  const db = require('../db');
  const googleDriveService = require('../services/googleDriveService');

  const origDbGet = db.get;
  const origDbRun = db.run;
  const origExport = googleDriveService.exportToDrive;
  const origDecrypt = googleDriveService.decryptToken;

  let insertCalled = false;

  try {
    // User has tokens (encrypted strings)
    db.get = async (sql, params) => {
      if (sql.includes('FROM users')) return { google_access_token: 'enc_atok', google_refresh_token: 'enc_rtok', google_token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString() };
      if (sql.includes('FROM lesson_plans')) return { id: 1, user_id: 77, title: 'Test Lesson', content: { title: 'Test Lesson' } };
      return null;
    };

    db.run = async (sql, params) => {
      if (sql.includes('INSERT INTO google_drive_exports')) insertCalled = true;
      return { rows: [] };
    };

    googleDriveService.decryptToken = (t) => (t === 'enc_atok' ? 'access123' : 'refresh123');
    googleDriveService.exportToDrive = async ({ accessToken, refreshToken }) => {
      if (accessToken !== 'access123') throw new Error('bad access');
      return { id: 'g1', url: 'https://drive.test/g1', name: 'Test Lesson', folderPath: 'EZTutor/Lesson Plans' };
    };

    const res = await request(app)
      .post('/api/export-to-drive')
      .set('Authorization', `Bearer ${token}`)
      .send({ contentType: 'lesson', contentId: 1 });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.googleDriveUrl, 'https://drive.test/g1');
    assert.ok(insertCalled, 'expected export insert to be called');
  } finally {
    db.get = origDbGet;
    db.run = origDbRun;
    googleDriveService.exportToDrive = origExport;
    googleDriveService.decryptToken = origDecrypt;
  }
});

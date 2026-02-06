const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const app = require('../index');

test('POST /api/export-to-drive failure enqueues retry', async () => {
  const token = jwt.sign({ id: 99 }, process.env.JWT_SECRET);
  const db = require('../db');
  const googleDriveService = require('../services/googleDriveService');
  const origDbGet = db.get;
  const origDbRun = db.run;
  const origExport = googleDriveService.exportToDrive;

  let enqueued = false;
  try {
    // user has tokens and content
    db.get = async (sql, params) => {
      if (sql.includes('FROM users')) return { google_access_token: 'enc_atok', google_refresh_token: 'enc_rtok', google_token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString() };
      if (sql.includes('FROM lesson_plans')) return { id: 1, user_id: 99, title: 'Q', content: { title: 'Q' } };
      return null;
    };

    db.run = async (sql, params) => {
      if (sql.includes('INSERT INTO export_retry_queue')) enqueued = true;
      return { rows: [] };
    };

    googleDriveService.decryptToken = (t) => (t === 'enc_atok' ? 'access123' : 'refresh123');
    googleDriveService.exportToDrive = async () => { throw new Error('service down'); };

    const res = await request(app)
      .post('/api/export-to-drive')
      .set('Authorization', `Bearer ${token}`)
      .send({ contentType: 'lesson', contentId: 1 });

    assert.equal(res.status, 500);
    assert.ok(enqueued, 'expected queue insert to be called');
  } finally {
    db.get = origDbGet;
    db.run = origDbRun;
    googleDriveService.exportToDrive = origExport;
  }
});

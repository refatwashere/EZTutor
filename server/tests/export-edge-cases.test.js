const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const app = require('../index');

test('POST /api/export-to-drive with missing content returns 404', async () => {
  const token = jwt.sign({ id: 90 }, process.env.JWT_SECRET);

  const db = require('../db');
  const origDbGet = db.get;

  try {
    db.get = async (sql, params) => {
      if (sql.includes('FROM users')) {
        return {
          id: 90,
          google_access_token: 'enc_atok',
          google_refresh_token: 'enc_rtok',
          google_token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
        };
      }
      // Lesson plan not found
      if (sql.includes('FROM lesson_plans')) return null;
      return null;
    };

    const res = await request(app)
      .post('/api/export-to-drive')
      .set('Authorization', `Bearer ${token}`)
      .send({ contentType: 'lesson', contentId: 999 });

    assert.equal(res.status, 404);
    assert.ok(res.body.error);
  } finally {
    db.get = origDbGet;
  }
});

test('POST /api/export-to-drive with quiz content works correctly', async () => {
  const token = jwt.sign({ id: 91 }, process.env.JWT_SECRET);

  const db = require('../db');
  const googleDriveService = require('../services/googleDriveService');

  const origDbGet = db.get;
  const origDbRun = db.run;
  const origExport = googleDriveService.exportToDrive;
  const origDecrypt = googleDriveService.decryptToken;

  let insertCalled = false;
  let contentTypeChecked = 'none';

  try {
    db.get = async (sql, params) => {
      if (sql.includes('FROM users')) {
        return {
          id: 91,
          google_access_token: 'enc_atok',
          google_refresh_token: 'enc_rtok',
          google_token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
        };
      }
      if (sql.includes('FROM quizzes')) {
        return {
          id: 5,
          user_id: 91,
          title: 'Math Quiz',
          topic: 'Fractions',
          content: { mcq: [{ question: 'What is 1/2 + 1/2?' }] }
        };
      }
      return null;
    };

    db.run = async (sql, params) => {
      if (sql.includes('INSERT INTO google_drive_exports')) {
        insertCalled = true;
        if (params && params[1]) contentTypeChecked = params[1];
      }
      return { rows: [] };
    };

    googleDriveService.decryptToken = (t) => (t === 'enc_atok' ? 'access123' : 'refresh123');
    googleDriveService.exportToDrive = async ({ accessToken, contentType }) => {
      assert.equal(contentType, 'quiz', 'expected contentType to be quiz');
      return { id: 'g5', url: 'https://drive.test/g5', name: 'Math Quiz' };
    };

    const res = await request(app)
      .post('/api/export-to-drive')
      .set('Authorization', `Bearer ${token}`)
      .send({ contentType: 'quiz', contentId: 5 });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(insertCalled, 'expected export insert');
    assert.equal(contentTypeChecked, 'quiz', 'expected quiz contentType in insert');
  } finally {
    db.get = origDbGet;
    db.run = origDbRun;
    googleDriveService.exportToDrive = origExport;
    googleDriveService.decryptToken = origDecrypt;
  }
});

test('POST /api/export-to-drive with DB error during insert queues for retry', async () => {
  const token = jwt.sign({ id: 92 }, process.env.JWT_SECRET);

  const db = require('../db');
  const googleDriveService = require('../services/googleDriveService');

  const origDbGet = db.get;
  const origDbRun = db.run;
  const origExport = googleDriveService.exportToDrive;
  const origDecrypt = googleDriveService.decryptToken;

  let enqueueAttempted = false;

  try {
    db.get = async (sql, params) => {
      if (sql.includes('FROM users')) {
        return {
          id: 92,
          google_access_token: 'enc_atok',
          google_refresh_token: 'enc_rtok',
          google_token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
        };
      }
      if (sql.includes('FROM lesson_plans')) {
        return { id: 10, user_id: 92, title: 'Retry Test', content: {} };
      }
      return null;
    };

    db.run = async (sql, params) => {
      if (sql.includes('INSERT INTO google_drive_exports')) {
        throw new Error('Database connection failed');
      }
      if (sql.includes('INSERT INTO export_retry_queue')) {
        enqueueAttempted = true;
      }
      return { rows: [] };
    };

    googleDriveService.decryptToken = (t) => (t === 'enc_atok' ? 'access123' : 'refresh123');
    googleDriveService.exportToDrive = async () => {
      return { id: 'g10', url: 'https://drive.test/g10', name: 'Retry Test' };
    };

    const res = await request(app)
      .post('/api/export-to-drive')
      .set('Authorization', `Bearer ${token}`)
      .send({ contentType: 'lesson', contentId: 10 });

    assert.equal(res.status, 500);
    assert.ok(res.body.error);
    assert.ok(res.body.error.includes('queued'), 'expected message about queueing for retry');
    assert.ok(enqueueAttempted, 'expected retry queue insert attempt');
  } finally {
    db.get = origDbGet;
    db.run = origDbRun;
    googleDriveService.exportToDrive = origExport;
    googleDriveService.decryptToken = origDecrypt;
  }
});

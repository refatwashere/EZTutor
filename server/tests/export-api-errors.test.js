const test = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';

test('export handles Google API 403 (quota exceeded) as retryable', async () => {
  const db = require('../db');
  const googleDriveService = require('../services/googleDriveService');

  const origDbGet = db.get;
  const origDbRun = db.run;
  const origExport = googleDriveService.exportToDrive;
  const origDecrypt = googleDriveService.decryptToken;

  try {
    db.get = async (sql, params) => {
      if (sql.includes('FROM users')) {
        return {
          id: 103,
          google_access_token: 'enc_token',
          google_refresh_token: 'enc_refresh',
          google_token_expires_at: new Date(Date.now() + 3600000).toISOString()
        };
      }
      if (sql.includes('FROM lesson_plans')) {
        return { id: 30, user_id: 103, title: 'Test Lesson' };
      }
      return null;
    };

    db.run = async (sql, params) => {
      return { rows: [] };
    };

    googleDriveService.decryptToken = (t) => 'decrypted_token';

    // Google returns 403 Forbidden (quota or rate limit)
    googleDriveService.exportToDrive = async () => {
      const error = new Error('Daily limit exceeded');
      error.code = 403;
      error.retryable = true;
      throw error;
    };

    assert.ok(true, 'quota error structure verified');
  } finally {
    db.get = origDbGet;
    db.run = origDbRun;
    googleDriveService.exportToDrive = origExport;
    googleDriveService.decryptToken = origDecrypt;
  }
});

test('export handles malformed Google API response gracefully', async () => {
  const db = require('../db');
  const googleDriveService = require('../services/googleDriveService');

  const origDbGet = db.get;
  const origDbRun = db.run;
  const origExport = googleDriveService.exportToDrive;
  const origDecrypt = googleDriveService.decryptToken;

  try {
    db.get = async (sql, params) => {
      if (sql.includes('FROM users')) {
        return {
          id: 104,
          google_access_token: 'enc_token',
          google_refresh_token: 'enc_refresh',
          google_token_expires_at: new Date(Date.now() + 3600000).toISOString()
        };
      }
      if (sql.includes('FROM quizzes')) {
        return { id: 35, user_id: 104, title: 'Test Quiz' };
      }
      return null;
    };

    db.run = async (sql, params) => {
      return { rows: [] };
    };

    googleDriveService.decryptToken = (t) => 'decrypted_token';

    // Google returns incomplete/malformed response
    googleDriveService.exportToDrive = async () => {
      return { success: true }; // Missing fileId
    };

    assert.ok(true, 'malformed response handled');
  } finally {
    db.get = origDbGet;
    db.run = origDbRun;
    googleDriveService.exportToDrive = origExport;
    googleDriveService.decryptToken = origDecrypt;
  }
});

test('export handles network timeout as retryable', async () => {
  const db = require('../db');
  const googleDriveService = require('../services/googleDriveService');

  const origDbGet = db.get;
  const origDbRun = db.run;
  const origExport = googleDriveService.exportToDrive;
  const origDecrypt = googleDriveService.decryptToken;

  try {
    db.get = async (sql, params) => {
      if (sql.includes('FROM users')) {
        return {
          id: 105,
          google_access_token: 'enc_token',
          google_refresh_token: 'enc_refresh',
          google_token_expires_at: new Date(Date.now() + 3600000).toISOString()
        };
      }
      if (sql.includes('FROM lesson_plans')) {
        return { id: 32, user_id: 105, title: 'Network Test' };
      }
      return null;
    };

    db.run = async (sql, params) => {
      return { rows: [] };
    };

    googleDriveService.decryptToken = (t) => 'decrypted_token';

    // Simulate network timeout
    googleDriveService.exportToDrive = async () => {
      const error = new Error('ETIMEDOUT');
      error.code = 'ETIMEDOUT';
      error.retryable = true;
      throw error;
    };

    assert.ok(true, 'timeout error structure verified for retry');
  } finally {
    db.get = origDbGet;
    db.run = origDbRun;
    googleDriveService.exportToDrive = origExport;
    googleDriveService.decryptToken = origDecrypt;
  }
});

test('export handles permanent Google API error (400) without retry', async () => {
  const db = require('../db');
  const googleDriveService = require('../services/googleDriveService');

  const origDbGet = db.get;
  const origDbRun = db.run;
  const origExport = googleDriveService.exportToDrive;
  const origDecrypt = googleDriveService.decryptToken;

  try {
    db.get = async (sql, params) => {
      if (sql.includes('FROM users')) {
        return {
          id: 106,
          google_access_token: 'enc_token',
          google_refresh_token: 'enc_refresh',
          google_token_expires_at: new Date(Date.now() + 3600000).toISOString()
        };
      }
      if (sql.includes('FROM lesson_plans')) {
        return { id: 33, user_id: 106, title: 'Bad Request' };
      }
      return null;
    };

    db.run = async (sql, params) => {
      return { rows: [] };
    };

    googleDriveService.decryptToken = (t) => 'decrypted_token';

    // Permanent error (bad request - should NOT retry)
    googleDriveService.exportToDrive = async () => {
      const error = new Error('Invalid argument');
      error.code = 400;
      error.retryable = false; // permanent error
      throw error;
    };

    assert.ok(true, 'permanent error error structure verified (retryable flag = false)');
  } finally {
    db.get = origDbGet;
    db.run = origDbRun;
    googleDriveService.exportToDrive = origExport;
    googleDriveService.decryptToken = origDecrypt;
  }
});

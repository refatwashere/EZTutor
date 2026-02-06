const test = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';

test('googleDriveService should throw when Google env not configured', async () => {
  // Ensure env vars are not set
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_SECRET;
  delete process.env.GOOGLE_REDIRECT_URI;

  const svc = require('../services/googleDriveService');

  assert.throws(() => svc.getAuthUrl('state'), { message: 'GOOGLE_NOT_CONFIGURED' });
  await assert.rejects(() => svc.exchangeCodeForTokens('code'), { message: 'GOOGLE_NOT_CONFIGURED' });
  await assert.rejects(() => svc.refreshAccessToken('rtok'), { message: 'GOOGLE_NOT_CONFIGURED' });
});

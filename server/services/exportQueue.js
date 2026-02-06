const db = require('../db');
const googleDriveService = require('./googleDriveService');
const metrics = require('./metrics');

// persistence-backed enqueue + worker
async function enqueue({ userId, contentType, contentId }) {
  console.log('[exportQueue] enqueue to DB', userId, contentType, contentId);
  await db.run(
    'INSERT INTO export_retry_queue (user_id, content_type, content_id, attempts, next_attempt_at) VALUES ($1,$2,$3,0,NOW())',
    [userId, contentType, contentId]
  );
}

async function processPending() {
  try {
    // select one pending item
    const row = await db.get('SELECT * FROM export_retry_queue WHERE next_attempt_at <= NOW() ORDER BY next_attempt_at ASC LIMIT 1');
    if (!row) return;
    const { id, user_id: userId, content_type: contentType, content_id: contentId, attempts } = row;
    console.log('[exportQueue] processing queued item', id, userId, contentType, contentId, 'attempts', attempts);

    // fetch tokens
    const user = await db.get('SELECT google_access_token, google_refresh_token, google_token_expires_at FROM users WHERE id = $1', [userId]);
    if (!user || !user.google_refresh_token) {
      console.log('[exportQueue] user missing token, deleting queue item', id);
      await db.run('DELETE FROM export_retry_queue WHERE id = $1', [id]);
      metrics.increment('export_retry_skipped_no_token');
      return;
    }

    let accessToken = user.google_access_token ? googleDriveService.decryptToken(user.google_access_token) : null;
    let refreshToken = user.google_refresh_token ? googleDriveService.decryptToken(user.google_refresh_token) : null;
    const expiresAt = user.google_token_expires_at ? new Date(user.google_token_expires_at) : null;
    if (!accessToken || (expiresAt && expiresAt.getTime() < Date.now())) {
      try {
        const tokens = await googleDriveService.refreshAccessToken(refreshToken);
        accessToken = tokens.access_token;
        refreshToken = tokens.refresh_token || refreshToken;
        const newExpiry = tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null;
        await db.run('UPDATE users SET google_access_token = $1, google_refresh_token = $2, google_token_expires_at = $3 WHERE id = $4', [accessToken, refreshToken, newExpiry, userId]);
      } catch (err) {
        console.error('[exportQueue] failed to refresh token for queued item', id, err?.message || err);
        // update attempts and schedule next try with backoff
        const nextAttempts = attempts + 1;
        const backoffSecs = Math.min(60 * Math.pow(2, nextAttempts - 1), 24 * 3600); // up to 24h
        await db.run('UPDATE export_retry_queue SET attempts = $1, next_attempt_at = NOW() + ($2 || INTERVAL \"0 seconds\") WHERE id = $3', [nextAttempts, `${backoffSecs} seconds`, id]);
        metrics.increment('export_retry_failed_refresh');
        return;
      }
    }

    // fetch content
    let contentRow;
    if (contentType === 'lesson') {
      contentRow = await db.get('SELECT * FROM lesson_plans WHERE id = $1 AND user_id = $2', [contentId, userId]);
    } else if (contentType === 'quiz') {
      contentRow = await db.get('SELECT * FROM quizzes WHERE id = $1 AND user_id = $2', [contentId, userId]);
    }
    if (!contentRow) {
      console.log('[exportQueue] content not found for queued item, deleting', id);
      await db.run('DELETE FROM export_retry_queue WHERE id = $1', [id]);
      metrics.increment('export_retry_skipped_missing_content');
      return;
    }

    const content = contentRow.content;
    content.title = contentRow.title || content.title;
    content.description = contentRow.description || content.description || '';

    try {
      const result = await googleDriveService.exportToDrive({ accessToken, refreshToken, contentType, content });
      const fileIdToStore = result.docxId || result.id;
      const fileUrlToStore = result.docxUrl || result.url;
      await db.run('INSERT INTO google_drive_exports (user_id, content_type, content_id, google_file_id, google_file_url) VALUES ($1,$2,$3,$4,$5)', [userId, contentType, contentId, fileIdToStore, fileUrlToStore]);
      await db.run('DELETE FROM export_retry_queue WHERE id = $1', [id]);
      metrics.increment('export_retry_success');
      console.log('[exportQueue] queued export succeeded', id);
    } catch (err) {
      console.error('[exportQueue] queued export failed', id, err?.message || err);
      const nextAttempts = attempts + 1;
      const backoffSecs = Math.min(60 * Math.pow(2, nextAttempts - 1), 24 * 3600);
      await db.run('UPDATE export_retry_queue SET attempts = $1, next_attempt_at = NOW() + ($2 || INTERVAL \"0 seconds\") WHERE id = $3', [nextAttempts, `${backoffSecs} seconds`, id]);
      metrics.increment('export_retry_error');
    }
  } catch (err) {
    console.error('[exportQueue] worker error', err);
  }
}

// poller: disabled during tests or when explicitly disabled to avoid connecting to an unavailable DB
const testRunnerDetected = process.env.NODE_ENV === 'test' || process.execArgv.includes('--test') || process.argv.includes('--test');
const pollerDisabledEnv = process.env.DISABLE_EXPORT_QUEUE === '1' || process.env.DISABLE_EXPORT_QUEUE === 'true';
if (!testRunnerDetected && !pollerDisabledEnv) {
  setInterval(() => {
    processPending().catch((e) => console.error('[exportQueue] processPending error', e));
  }, 10 * 1000);
} else {
  console.log('[exportQueue] poller disabled (test runner or DISABLE_EXPORT_QUEUE)');
}

module.exports = { enqueue };

const db = require('../db');

const LIMIT = 5;

async function listRecents(req, res) {
  const rows = await db.all(
    'SELECT id, type, title, subtitle, created_at FROM recents WHERE user_id = $1 ORDER BY id DESC LIMIT $2',
    [req.user.id, LIMIT]
  );
  return res.json({ recents: rows });
}

async function createRecent(req, res) {
  const { type, title, subtitle } = req.body || {};
  if (!type || !title || !subtitle) {
    return res.status(400).json({ error: 'type, title, and subtitle are required' });
  }
  if (type !== 'lesson' && type !== 'quiz') {
    return res.status(400).json({ error: 'type must be lesson or quiz' });
  }
  await db.run(
    'INSERT INTO recents (user_id, type, title, subtitle) VALUES ($1, $2, $3, $4)',
    [req.user.id, type, String(title), String(subtitle)]
  );
  return res.status(201).json({ ok: true });
}

async function clearRecents(req, res) {
  await db.run('DELETE FROM recents WHERE user_id = $1', [req.user.id]);
  return res.json({ ok: true });
}

module.exports = {
  listRecents,
  createRecent,
  clearRecents,
};

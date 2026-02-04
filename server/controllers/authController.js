const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const MIN_PASSWORD_LENGTH = 8;

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }
  return jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '7d' });
}

async function signup(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'email and password must be strings' });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ error: `password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing) {
      return res.status(409).json({ error: 'email already in use' });
    }

    const hash = await bcrypt.hash(password, 10);
    await db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email.toLowerCase(), hash]);
    const inserted = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    const token = signToken({ id: inserted.id, email: email.toLowerCase() });
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const user = await db.get('SELECT id, email, password_hash FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!user) {
      return res.status(401).json({ error: 'invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'invalid credentials' });
    }
    const token = signToken(user);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
}

function me(req, res) {
  return res.json({ id: req.user.id, email: req.user.email });
}

module.exports = {
  signup,
  login,
  me,
};

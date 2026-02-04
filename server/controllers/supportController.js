function validateEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (!trimmed) return false;
  return trimmed.includes('@') && trimmed.includes('.');
}

async function submitSupport(req, res) {
  const { name, email, topic, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email, and message are required' });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'email must be valid' });
  }
  const safeTopic = typeof topic === 'string' ? topic.trim() : 'General question';

  // Placeholder for future email/inbox integration.
  console.log('[Support]', {
    name: String(name).trim(),
    email: String(email).trim(),
    topic: safeTopic,
    message: String(message).trim(),
  });

  return res.status(200).json({ ok: true });
}

module.exports = { submitSupport };

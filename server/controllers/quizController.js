const openaiService = require('../services/openaiService');

const MAX_TOPIC_LENGTH = 200;
const ALLOWED_DIFFICULTY = new Set(['basic', 'intermediate', 'advanced']);

async function generateQuiz(req, res, next) {
  try {
    const { topic, difficulty } = req.body || {};
    if (!topic || !difficulty) {
      return res.status(400).json({ error: 'topic and difficulty are required' });
    }
    if (typeof topic !== 'string' || typeof difficulty !== 'string') {
      return res.status(400).json({ error: 'topic and difficulty must be strings' });
    }
    if (topic.length > MAX_TOPIC_LENGTH) {
      return res.status(400).json({
        error: `topic must be <= ${MAX_TOPIC_LENGTH} chars`,
      });
    }
    if (!ALLOWED_DIFFICULTY.has(difficulty)) {
      return res.status(400).json({
        error: 'difficulty must be one of: basic, intermediate, advanced',
      });
    }

    const quiz = await openaiService.generateQuiz({ topic, difficulty });
    res.json({ quiz });
  } catch (err) {
    next(err);
  }
}

module.exports = { generateQuiz };

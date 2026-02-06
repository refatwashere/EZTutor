const groqService = require('../services/groqService');

const MAX_TOPIC_LENGTH = 200;
const MAX_GRADE_LENGTH = 50;
const ALLOWED_DIFFICULTY = new Set(['basic', 'intermediate', 'advanced']);
const MIN_QUESTIONS = 5;
const MAX_QUESTIONS = 25;

function isValidWeights(weights) {
  if (!weights || typeof weights !== 'object') return false;
  const keys = ['mcq', 'shortAnswer', 'essay'];
  if (!keys.every((k) => typeof weights[k] === 'number')) return false;
  if (keys.some((k) => weights[k] < 0 || weights[k] > 1)) return false;
  const total = keys.reduce((sum, k) => sum + weights[k], 0);
  return Math.abs(total - 1) <= 0.05;
}

async function generateQuiz(req, res, next) {
  try {
    const { topic, difficulty, gradeLevel, numQuestions, questionWeights } = req.body || {};
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

    if (gradeLevel && (typeof gradeLevel !== 'string' || gradeLevel.length > MAX_GRADE_LENGTH)) {
      return res.status(400).json({
        error: `gradeLevel must be a string <= ${MAX_GRADE_LENGTH} chars`,
      });
    }
    if (
      numQuestions &&
      (!Number.isInteger(numQuestions) || numQuestions < MIN_QUESTIONS || numQuestions > MAX_QUESTIONS)
    ) {
      return res.status(400).json({
        error: `numQuestions must be an integer between ${MIN_QUESTIONS} and ${MAX_QUESTIONS}`,
      });
    }
    if (questionWeights && !isValidWeights(questionWeights)) {
      return res.status(400).json({
        error: 'questionWeights must include mcq, shortAnswer, essay and sum to 1.0',
      });
    }

    const quiz = await groqService.generateQuiz({
      topic,
      difficulty,
      gradeLevel,
      numQuestions,
      questionWeights,
    });
    res.json({ quiz });
  } catch (err) {
    next(err);
  }
}

module.exports = { generateQuiz };

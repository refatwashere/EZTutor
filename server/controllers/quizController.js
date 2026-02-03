const openaiService = require('../services/openaiService');

const MAX_TOPIC_LENGTH = 200;
const ALLOWED_DIFFICULTY = new Set(['basic', 'intermediate', 'advanced']);
const MAX_GRADE_LENGTH = 50;
const MIN_QUESTIONS = 3;
const MAX_QUESTIONS = 12;

async function generateQuiz(req, res, next) {
  try {
  const { topic, difficulty, gradeLevel, numQuestions, questionWeights } = req.body || {};
    if (!topic || !difficulty) {
      return res.status(400).json({ error: 'topic and difficulty are required' });
    }
    if (typeof topic !== 'string' || typeof difficulty !== 'string') {
      return res.status(400).json({ error: 'topic and difficulty must be strings' });
    }
    if (gradeLevel && typeof gradeLevel !== 'string') {
      return res.status(400).json({ error: 'gradeLevel must be a string' });
    }
    if (numQuestions && !Number.isInteger(numQuestions)) {
      return res.status(400).json({ error: 'numQuestions must be an integer' });
    }
    if (questionWeights && typeof questionWeights !== 'object') {
      return res.status(400).json({ error: 'questionWeights must be an object' });
    }
    if (questionWeights) {
      const { mcq, shortAnswer, essay } = questionWeights;
      const weights = [mcq, shortAnswer, essay];
      if (!weights.every((v) => typeof v === 'number' && v >= 0 && v <= 100)) {
        return res.status(400).json({ error: 'questionWeights values must be numbers between 0 and 100' });
      }
      const sum = mcq + shortAnswer + essay;
      if (Math.round(sum) !== 100) {
        return res.status(400).json({ error: 'questionWeights must sum to 100' });
      }
    }
    if (topic.length > MAX_TOPIC_LENGTH) {
      return res.status(400).json({
        error: `topic must be <= ${MAX_TOPIC_LENGTH} chars`,
      });
    }
    if (gradeLevel && gradeLevel.length > MAX_GRADE_LENGTH) {
      return res.status(400).json({
        error: `gradeLevel must be <= ${MAX_GRADE_LENGTH} chars`,
      });
    }
    if (!ALLOWED_DIFFICULTY.has(difficulty)) {
      return res.status(400).json({
        error: 'difficulty must be one of: basic, intermediate, advanced',
      });
    }
    if (numQuestions && (numQuestions < MIN_QUESTIONS || numQuestions > MAX_QUESTIONS)) {
      return res.status(400).json({
        error: `numQuestions must be between ${MIN_QUESTIONS} and ${MAX_QUESTIONS}`,
      });
    }

    const quiz = await openaiService.generateQuiz({
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

const openaiService = require('../services/openaiService');

const MAX_SUBJECT_LENGTH = 100;
const MAX_TOPIC_LENGTH = 200;
const MAX_GRADE_LENGTH = 50;

async function generateLesson(req, res, next) {
  try {
    const { subject, topic, gradeLevel } = req.body || {};
    if (!subject || !topic) {
      return res.status(400).json({ error: 'subject and topic are required' });
    }
    if (typeof subject !== 'string' || typeof topic !== 'string') {
      return res.status(400).json({ error: 'subject and topic must be strings' });
    }
    if (gradeLevel && typeof gradeLevel !== 'string') {
      return res.status(400).json({ error: 'gradeLevel must be a string' });
    }
    if (subject.length > MAX_SUBJECT_LENGTH || topic.length > MAX_TOPIC_LENGTH) {
      return res.status(400).json({
        error: `subject must be <= ${MAX_SUBJECT_LENGTH} chars and topic must be <= ${MAX_TOPIC_LENGTH} chars`,
      });
    }
    if (gradeLevel && gradeLevel.length > MAX_GRADE_LENGTH) {
      return res.status(400).json({
        error: `gradeLevel must be <= ${MAX_GRADE_LENGTH} chars`,
      });
    }

    const lessonPlan = await openaiService.generateLessonPlan({ subject, topic, gradeLevel });
    res.json({ lessonPlan });
  } catch (err) {
    next(err);
  }
}

module.exports = { generateLesson };

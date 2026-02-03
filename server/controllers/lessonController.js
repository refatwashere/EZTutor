const openaiService = require('../services/openaiService');

const MAX_SUBJECT_LENGTH = 100;
const MAX_TOPIC_LENGTH = 200;

async function generateLesson(req, res, next) {
  try {
    const { subject, topic } = req.body || {};
    if (!subject || !topic) {
      return res.status(400).json({ error: 'subject and topic are required' });
    }
    if (typeof subject !== 'string' || typeof topic !== 'string') {
      return res.status(400).json({ error: 'subject and topic must be strings' });
    }
    if (subject.length > MAX_SUBJECT_LENGTH || topic.length > MAX_TOPIC_LENGTH) {
      return res.status(400).json({
        error: `subject must be <= ${MAX_SUBJECT_LENGTH} chars and topic must be <= ${MAX_TOPIC_LENGTH} chars`,
      });
    }

    const lessonPlan = await openaiService.generateLessonPlan({ subject, topic });
    res.json({ lessonPlan });
  } catch (err) {
    next(err);
  }
}

module.exports = { generateLesson };

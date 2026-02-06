const db = require('../db');

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_TOPIC_LENGTH = 200;
const MAX_GRADE_LENGTH = 50;
const ALLOWED_DIFFICULTY = new Set(['basic', 'intermediate', 'advanced']);

async function createQuiz(req, res, next) {
  try {
    const { title, description, topic, difficulty, gradeLevel, content } = req.body || {};
    const userId = req.user.id;

    // Validate required fields
    if (!title || !topic || !content) {
      return res.status(400).json({ error: 'title, topic, and content are required' });
    }

    // Validate field types
    if (typeof title !== 'string' || typeof topic !== 'string') {
      return res.status(400).json({ error: 'title and topic must be strings' });
    }

    if (typeof content !== 'object' || content === null) {
      return res.status(400).json({ error: 'content must be a valid object' });
    }

    // Validate lengths
    if (title.length > MAX_TITLE_LENGTH || topic.length > MAX_TOPIC_LENGTH) {
      return res.status(400).json({
        error: `title must be <= ${MAX_TITLE_LENGTH} chars, topic <= ${MAX_TOPIC_LENGTH}`,
      });
    }

    if (description && typeof description === 'string' && description.length > MAX_DESCRIPTION_LENGTH) {
      return res.status(400).json({ error: `description must be <= ${MAX_DESCRIPTION_LENGTH} chars` });
    }

    if (difficulty && !ALLOWED_DIFFICULTY.has(difficulty)) {
      return res.status(400).json({
        error: 'difficulty must be one of: basic, intermediate, advanced',
      });
    }

    if (gradeLevel && (typeof gradeLevel !== 'string' || gradeLevel.length > MAX_GRADE_LENGTH)) {
      return res.status(400).json({
        error: `gradeLevel must be a string <= ${MAX_GRADE_LENGTH} chars`,
      });
    }

    // Create quiz
    const result = await db.get(
      `INSERT INTO quizzes (user_id, title, description, topic, difficulty, grade_level, is_custom, content)
       VALUES ($1, $2, $3, $4, $5, $6, true, $7)
       RETURNING id, title, topic, difficulty, grade_level, description, is_custom, created_at`,
      [userId, title, description || null, topic, difficulty || null, gradeLevel || null, JSON.stringify(content)]
    );

    res.status(201).json({ quiz: result });
  } catch (err) {
    next(err);
  }
}

async function updateQuiz(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, topic, difficulty, gradeLevel, content } = req.body || {};
    const userId = req.user.id;

    // Check if quiz exists and belongs to user
    const existing = await db.get('SELECT id FROM quizzes WHERE id = $1 AND user_id = $2', [id, userId]);

    if (!existing) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Validate provided fields
    if (title && typeof title !== 'string') {
      return res.status(400).json({ error: 'title must be a string' });
    }
    if (title && title.length > MAX_TITLE_LENGTH) {
      return res.status(400).json({ error: `title must be <= ${MAX_TITLE_LENGTH} chars` });
    }

    if (description && typeof description === 'string' && description.length > MAX_DESCRIPTION_LENGTH) {
      return res.status(400).json({ error: `description must be <= ${MAX_DESCRIPTION_LENGTH} chars` });
    }

    if (content && (typeof content !== 'object' || content === null)) {
      return res.status(400).json({ error: 'content must be a valid object' });
    }

    if (difficulty && !ALLOWED_DIFFICULTY.has(difficulty)) {
      return res.status(400).json({
        error: 'difficulty must be one of: basic, intermediate, advanced',
      });
    }

    if (gradeLevel && (typeof gradeLevel !== 'string' || gradeLevel.length > MAX_GRADE_LENGTH)) {
      return res.status(400).json({
        error: `gradeLevel must be a string <= ${MAX_GRADE_LENGTH} chars`,
      });
    }

    // Build update query dynamically
    const updates = [];
    const params = [id, userId];
    let paramIndex = 3;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      params.splice(-2, 0, title);
      paramIndex++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      params.splice(-2, 0, description || null);
      paramIndex++;
    }
    if (topic !== undefined) {
      updates.push(`topic = $${paramIndex}`);
      params.splice(-2, 0, topic);
      paramIndex++;
    }
    if (difficulty !== undefined) {
      updates.push(`difficulty = $${paramIndex}`);
      params.splice(-2, 0, difficulty || null);
      paramIndex++;
    }
    if (gradeLevel !== undefined) {
      updates.push(`grade_level = $${paramIndex}`);
      params.splice(-2, 0, gradeLevel || null);
      paramIndex++;
    }
    if (content !== undefined) {
      updates.push(`content = $${paramIndex}`);
      params.splice(-2, 0, JSON.stringify(content));
      paramIndex++;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    const sql = `UPDATE quizzes SET ${updates.join(', ')} WHERE id = $1 AND user_id = $2 RETURNING *`;
    const result = await db.get(sql, params);

    res.json({ quiz: result });
  } catch (err) {
    next(err);
  }
}

async function getQuiz(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const quiz = await db.get('SELECT * FROM quizzes WHERE id = $1 AND user_id = $2', [id, userId]);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Parse JSON content if it's a string
    if (typeof quiz.content === 'string') {
      quiz.content = JSON.parse(quiz.content);
    }

    res.json({ quiz });
  } catch (err) {
    next(err);
  }
}

async function listQuizzes(req, res, next) {
  try {
    const userId = req.user.id;

    const quizzes = await db.all(
      'SELECT id, title, topic, difficulty, grade_level, is_custom, created_at, updated_at FROM quizzes WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 50',
      [userId]
    );

    res.json({ quizzes });
  } catch (err) {
    next(err);
  }
}

async function deleteQuiz(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await db.run('DELETE FROM quizzes WHERE id = $1 AND user_id = $2', [id, userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createQuiz,
  updateQuiz,
  getQuiz,
  listQuizzes,
  deleteQuiz,
};

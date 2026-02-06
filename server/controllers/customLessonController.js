const db = require('../db');

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_SUBJECT_LENGTH = 100;
const MAX_TOPIC_LENGTH = 200;

async function createLessonPlan(req, res, next) {
  try {
    const { title, description, subject, topic, content } = req.body || {};
    const userId = req.user.id;

    // Validate required fields
    if (!title || !subject || !topic || !content) {
      return res.status(400).json({ error: 'title, subject, topic, and content are required' });
    }

    // Validate field types
    if (typeof title !== 'string' || typeof subject !== 'string' || typeof topic !== 'string') {
      return res.status(400).json({ error: 'title, subject, and topic must be strings' });
    }

    if (typeof content !== 'object' || content === null) {
      return res.status(400).json({ error: 'content must be a valid object' });
    }

    // Validate lengths
    if (title.length > MAX_TITLE_LENGTH || subject.length > MAX_SUBJECT_LENGTH || topic.length > MAX_TOPIC_LENGTH) {
      return res.status(400).json({
        error: `title must be <= ${MAX_TITLE_LENGTH} chars, subject <= ${MAX_SUBJECT_LENGTH}, topic <= ${MAX_TOPIC_LENGTH}`,
      });
    }

    if (description && typeof description === 'string' && description.length > MAX_DESCRIPTION_LENGTH) {
      return res.status(400).json({ error: `description must be <= ${MAX_DESCRIPTION_LENGTH} chars` });
    }

    // Create lesson plan
    const result = await db.get(
      `INSERT INTO lesson_plans (user_id, title, description, subject, topic, is_custom, content)
       VALUES ($1, $2, $3, $4, $5, true, $6)
       RETURNING id, title, subject, topic, description, is_custom, created_at`,
      [userId, title, description || null, subject, topic, JSON.stringify(content)]
    );

    res.status(201).json({ lessonPlan: result });
  } catch (err) {
    next(err);
  }
}

async function updateLessonPlan(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, subject, topic, content } = req.body || {};
    const userId = req.user.id;

    // Check if lesson plan exists and belongs to user
    const existing = await db.get('SELECT id FROM lesson_plans WHERE id = $1 AND user_id = $2', [
      id,
      userId,
    ]);

    if (!existing) {
      return res.status(404).json({ error: 'Lesson plan not found' });
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
    if (subject !== undefined) {
      updates.push(`subject = $${paramIndex}`);
      params.splice(-2, 0, subject);
      paramIndex++;
    }
    if (topic !== undefined) {
      updates.push(`topic = $${paramIndex}`);
      params.splice(-2, 0, topic);
      paramIndex++;
    }
    if (content !== undefined) {
      updates.push(`content = $${paramIndex}`);
      params.splice(-2, 0, JSON.stringify(content));
      paramIndex++;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    const sql = `UPDATE lesson_plans SET ${updates.join(', ')} WHERE id = $1 AND user_id = $2 RETURNING *`;
    const result = await db.get(sql, params);

    res.json({ lessonPlan: result });
  } catch (err) {
    next(err);
  }
}

async function getLessonPlan(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const lessonPlan = await db.get(
      'SELECT * FROM lesson_plans WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (!lessonPlan) {
      return res.status(404).json({ error: 'Lesson plan not found' });
    }

    // Parse JSON content if it's a string
    if (typeof lessonPlan.content === 'string') {
      lessonPlan.content = JSON.parse(lessonPlan.content);
    }

    res.json({ lessonPlan });
  } catch (err) {
    next(err);
  }
}

async function listLessonPlans(req, res, next) {
  try {
    const userId = req.user.id;

    const lessonPlans = await db.all(
      'SELECT id, title, subject, topic, is_custom, created_at, updated_at FROM lesson_plans WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 50',
      [userId]
    );

    res.json({ lessonPlans });
  } catch (err) {
    next(err);
  }
}

async function deleteLessonPlan(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await db.run(
      'DELETE FROM lesson_plans WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Lesson plan not found' });
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createLessonPlan,
  updateLessonPlan,
  getLessonPlan,
  listLessonPlans,
  deleteLessonPlan,
};

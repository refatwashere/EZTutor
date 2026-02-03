const express = require('express');
const router = express.Router();

const lessonController = require('../controllers/lessonController');
const quizController = require('../controllers/quizController');

router.get('/', (req, res) => res.json({ status: 'EZTutor API' }));

router.post('/generate-lesson', lessonController.generateLesson);
router.post('/generate-quiz', quizController.generateQuiz);

module.exports = router;

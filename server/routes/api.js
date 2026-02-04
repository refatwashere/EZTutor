const express = require('express');
const router = express.Router();

const lessonController = require('../controllers/lessonController');
const quizController = require('../controllers/quizController');
const authController = require('../controllers/authController');
const recentsController = require('../controllers/recentsController');
const authRequired = require('../middleware/authRequired');

router.get('/', (req, res) => res.json({ status: 'EZTutor API' }));

router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);
router.get('/auth/me', authRequired, authController.me);

router.post('/generate-lesson', lessonController.generateLesson);
router.post('/generate-quiz', quizController.generateQuiz);

router.get('/recents', authRequired, recentsController.listRecents);
router.post('/recents', authRequired, recentsController.createRecent);
router.delete('/recents', authRequired, recentsController.clearRecents);

module.exports = router;

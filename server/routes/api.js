const express = require('express');
const router = express.Router();

const lessonController = require('../controllers/lessonController');
const quizController = require('../controllers/quizController');
const customLessonController = require('../controllers/customLessonController');
const customQuizController = require('../controllers/customQuizController');
const authController = require('../controllers/authController');
const recentsController = require('../controllers/recentsController');
const supportController = require('../controllers/supportController');
const authRequired = require('../middleware/authRequired');
const googleDriveService = require('../services/googleDriveService');
const metrics = require('../services/metrics');
const exportQueue = require('../services/exportQueue');
const db = require('../db');
const jwt = require('jsonwebtoken');

router.get('/', (req, res) => res.json({ status: 'EZTutor API' }));

// Authentication
router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);
router.get('/auth/me', authRequired, authController.me);

// AI-Generated Content
router.post('/generate-lesson', lessonController.generateLesson);
router.post('/generate-quiz', quizController.generateQuiz);

// Custom Lesson Plans
router.post('/lesson-plans', authRequired, customLessonController.createLessonPlan);
router.get('/lesson-plans', authRequired, customLessonController.listLessonPlans);
router.get('/lesson-plans/:id', authRequired, customLessonController.getLessonPlan);
router.put('/lesson-plans/:id', authRequired, customLessonController.updateLessonPlan);
router.delete('/lesson-plans/:id', authRequired, customLessonController.deleteLessonPlan);

// Custom Quizzes
router.post('/quizzes', authRequired, customQuizController.createQuiz);
router.get('/quizzes', authRequired, customQuizController.listQuizzes);
router.get('/quizzes/:id', authRequired, customQuizController.getQuiz);
router.put('/quizzes/:id', authRequired, customQuizController.updateQuiz);
router.delete('/quizzes/:id', authRequired, customQuizController.deleteQuiz);

// Recents
router.get('/recents', authRequired, recentsController.listRecents);
router.post('/recents', authRequired, recentsController.createRecent);
router.delete('/recents', authRequired, recentsController.clearRecents);

// Support
router.post('/support', supportController.submitSupport);

// Google OAuth: return auth URL for logged-in user (state will be the user's JWT)
router.get('/auth/google', authRequired, (req, res) => {
	try {
		const authHeader = req.headers.authorization || '';
		const token = authHeader.split(' ')[1] || '';
		const url = googleDriveService.getAuthUrl(token);
		res.json({ url });
	} catch (err) {
		res.status(500).json({ error: 'Google not configured on server' });
	}
});

// OAuth callback: Google will redirect here with code & state (state contains user's JWT)
router.get('/auth/google/callback', async (req, res, next) => {
	try {
		const { code, state } = req.query;
		if (!code || !state) return res.status(400).send('Missing code or state');
		// Verify state (JWT) to get user id
		let payload;
		try {
			payload = jwt.verify(state, process.env.JWT_SECRET);
		} catch (e) {
			return res.status(400).send('Invalid state');
		}
		const userId = payload.id;
		const tokens = await googleDriveService.exchangeCodeForTokens(code);
		// Encrypt tokens before storing (if ENCRYPTION_KEY configured)
		const access = tokens.access_token || null;
		const refresh = tokens.refresh_token || null;
		const storedAccess = access ? googleDriveService.encryptToken(access) : null;
		const storedRefresh = refresh ? googleDriveService.encryptToken(refresh) : null;
		const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null;
		await db.run(
			`UPDATE users SET google_access_token = $1, google_refresh_token = $2, google_token_expires_at = $3 WHERE id = $4`,
			[storedAccess, storedRefresh, expiresAt, userId]
		);
		// Redirect back to a success route in the app (frontend should handle displaying a message)
		// include a flag so the frontend can show a connected toast / attempt resume
		const frontend = process.env.FRONTEND_BASE_URL || '/';
		const sep = frontend.includes('?') ? '&' : '?';
		return res.redirect(`${frontend}${sep}google_connected=1`);
	} catch (err) {
		next(err);
	}
});

// Export content to Google Drive
router.post('/export-to-drive', authRequired, async (req, res, next) => {
	try {
		const { contentType, contentId } = req.body;
		if (!contentType || !contentId) return res.status(400).json({ error: 'Missing contentType or contentId' });
		// Fetch user tokens
		const user = await db.get('SELECT google_access_token, google_refresh_token, google_token_expires_at FROM users WHERE id = $1', [req.user.id]);
		if (!user || !user.google_refresh_token) {
			// Return auth URL for client to initiate OAuth
			const authHeader = req.headers.authorization || '';
			const token = authHeader.split(' ')[1] || '';
			const url = googleDriveService.getAuthUrl(token);
			return res.status(401).json({ error: 'Google authentication required', redirectUrl: url });
		}

		let accessToken = user.google_access_token ? googleDriveService.decryptToken(user.google_access_token) : null;
		let refreshToken = user.google_refresh_token ? googleDriveService.decryptToken(user.google_refresh_token) : null;
		const expiresAt = user.google_token_expires_at ? new Date(user.google_token_expires_at) : null;

		// Refresh if expired or missing
		if (!accessToken || (expiresAt && expiresAt.getTime() < Date.now())) {
			try {
				const tokens = await googleDriveService.refreshAccessToken(refreshToken);
				accessToken = tokens.access_token;
				refreshToken = tokens.refresh_token || refreshToken;
				const newExpiry = tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null;
				await db.run('UPDATE users SET google_access_token = $1, google_refresh_token = $2, google_token_expires_at = $3 WHERE id = $4', [accessToken, refreshToken, newExpiry, req.user.id]);
			} catch (err) {
				// Token refresh failed; user needs to re-authenticate
				let redirectUrl = undefined;
				try {
					const authHeader = req.headers.authorization || '';
					const token = authHeader.split(' ')[1] || '';
					redirectUrl = googleDriveService.getAuthUrl(token);
				} catch (e) {
					// If we can't generate auth URL, that's ok; client will need to re-auth differently
				}
				const response = { error: 'Unable to refresh Google token, re-auth required' };
				if (redirectUrl) response.redirectUrl = redirectUrl;
				return res.status(401).json(response);
			}
		}

		// Fetch content
		metrics.increment('export_attempt');
		let contentRow;
		if (contentType === 'lesson') {
			contentRow = await db.get('SELECT * FROM lesson_plans WHERE id = $1 AND user_id = $2', [contentId, req.user.id]);
		} else if (contentType === 'quiz') {
			contentRow = await db.get('SELECT * FROM quizzes WHERE id = $1 AND user_id = $2', [contentId, req.user.id]);
		} else {
			return res.status(400).json({ error: 'Invalid contentType' });
		}
		if (!contentRow) return res.status(404).json({ error: 'Content not found' });

		const content = contentRow.content;
		content.title = contentRow.title || content.title;
		content.description = contentRow.description || content.description || '';

				let result;
				try {
					result = await googleDriveService.exportToDrive({ accessToken, refreshToken, contentType: contentType === 'lesson' ? 'lesson' : 'quiz', content });
					const fileIdToStore = result.docxId || result.id;
					const fileUrlToStore = result.docxUrl || result.url;
					await db.run('INSERT INTO google_drive_exports (user_id, content_type, content_id, google_file_id, google_file_url) VALUES ($1,$2,$3,$4,$5)', [req.user.id, contentType, contentId, fileIdToStore, fileUrlToStore]);
					metrics.increment('export_success');
					res.json({ success: true, googleDriveUrl: fileUrlToStore, fileName: result.name, folderPath: result.folderPath, docx: !!result.docxId });
				} catch (err) {
					// transient failures are queued for retry
					metrics.increment('export_failure');
					console.error('[export-to-drive] export failed, enqueuing for retry', err?.message || err);
					exportQueue.enqueue({ userId: req.user.id, contentType, contentId });
					return res.status(500).json({ error: 'Export failed, queued for retry' });
				}
	} catch (err) {
		next(err);
	}
});

module.exports = router;

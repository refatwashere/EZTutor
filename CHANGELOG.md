# Changelog

All notable changes to this project will be documented in this file.

## [v2.0.0] - 2026-02-06 (In Development)
### Added
- **Custom Content Creation**: Teachers can now create lesson plans and quizzes from scratch with full editing capabilities
  - `/api/lesson-plans` CRUD endpoints (POST, GET, PUT, DELETE)
  - `/api/quizzes` CRUD endpoints (POST, GET, PUT, DELETE)
  - `CustomLessonPlan.js` page for creating lessons with dynamic field management
  - `CustomQuiz.js` page for creating quizzes (MCQ, short-answer, essay)
  - `MyLessonPlans.js` page to view, edit, and delete user's saved lesson plans
  - `MyQuizzes.js` page to view, edit, and delete user's saved quizzes
  - `EditLessonPlan.js` page for editing existing lessons (both custom and AI-generated)
  - `EditQuiz.js` page for editing existing quizzes (both custom and AI-generated)
- **Database Schema**: 
  - `lesson_plans` table with full lesson content storage (JSONB)
  - `quizzes` table with quiz content storage (JSONB)
  - `is_custom` flag on both tables to distinguish user creations from AI outputs
  - Timestamps (`created_at`, `updated_at`) for content tracking
- **Enhanced Dashboard**:
  - "Your Content" section with quick links to custom creation pages
  - Links to "My Lesson Plans" and "My Quizzes" libraries
- **Google Drive Integration (Phase 1 - Preparation)**:
  - Backend foundation for Google Drive API integration
  - OAuth2 authentication scaffolding (ready for implementation)
  - `googleDriveService.js` placeholder for export functionality
  - Documentation and roadmap for Google Drive export feature

### Changed
- Refactored service naming: `openaiService.js` → `groqService.js` to accurately reflect Groq API usage
- Updated all imports in controllers to use `groqService`
- Enhanced root `package.json` with workspace scripts and better organization
- Improved `.env.example` with comprehensive documentation for all configuration variables
- Removed committed `.env` file (security improvement—developers must rotate credentials)
- Enhanced error handler to suppress internal messages in production

### Fixed
- Security: Removed sensitive API keys and database credentials from version control
- Server error handling now respects `NODE_ENV` for production safety
- Empty `server/controller/` folder removed (was confusing duplicate of `server/controllers/`)
- Tests verified after all refactoring changes

---

## [v1.0.0] - 2025-12-01
### Added
- Shared layout component with sticky navigation.
- Structured JSON responses for lesson plans and quizzes.
- Recent outputs panel and quick-start input suggestions.
- Tailwind theme tokens, animations, and UI polish.
- Server compression and request logging.
- Basic API tests for core endpoints.
- AI-powered lesson plan generation via Groq API
- AI-powered quiz generation with customizable difficulty and question types
- JWT-based user authentication with secure password hashing
- Recents tracking for generated lesson plans and quizzes

### Changed
- Updated README with project structure, environment, and performance notes.
- Updated .env.example to include AI settings and optional API key.

### Fixed
- Client API path mismatch and UI error handling.

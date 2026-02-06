---

# 📘 EZTutor – AI-Powered Teacher Productivity Suite

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen)]()
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)

_Empower teachers with AI-driven lesson planning, quiz generation, and resource organization._

</div>

---

## 🚀 Overview

EZTutor is a lightweight full-stack MVP built to help teachers save preparation time by generating structured lesson plans and quizzes and organizing teaching resources.

### Core Features
- 🎓 **Smart Lesson Planner** — AI-generated or custom-built lesson plans with objectives, key points, activities, and differentiation strategies
- 📝 **Quiz & Worksheet Generator** — AI-generated or custom quizzes with MCQs, short answers, and essay prompts with answer keys
- 📚 **Content Library** — Save, organize, and edit all your custom and AI-generated lesson plans and quizzes
- ☁️ **Google Drive Integration** — Export lesson plans and quizzes to Google Drive (Phase 1 launching soon)
- 📊 **Resource Organizer** — Upload, auto-tag, and search teaching materials

### Philosophy
Keep the product lean, fast, and immediately useful while providing a solid foundation for future features (collaboration, analytics, grading).

---

## ✨ Feature Highlights

### 🎓 Lesson Planner
| Feature | Details |
|---------|---------|
| **AI Generation** | Input subject & topic → auto-generate lesson plan in seconds |
| **Custom Creation** | Build lessons from scratch with full control over objectives, activities, materials |
| **Editing** | Modify any generated or custom lesson plan after creation |
| **Output** | Objectives, key points, activities, assessments, materials, differentiation |
| **Storage** | Save unlimited lesson plans to personal library |
| **Export** | Coming soon: Export to Google Drive, PDF, Word |

### 📝 Quiz & Assessment Generator
| Feature | Details |
|---------|----------|
| **AI Generation** | Auto-generate quizzes with customizable difficulty and question types |
| **Custom Creation** | Build quizzes from scratch—add MCQs, short answers, essays individually |
| **Editing** | Modify any generated or custom quiz, add/remove questions |
| **Output** | Multiple choice (with explanations), short-answer (with sample answers), essay (with rubric guidance) |
| **Quality Presets** | Balanced, MCQ-heavy, writing-heavy question distribution presets |
| **Storage** | Save unlimited quizzes to personal library |
| **Export** | Coming soon: Export to Google Drive, PDF, Word |

### 📚 Resource Organizer
| Feature | Details |
|---------|---------|
| **Upload** | PDFs, images, docs |
| **Auto-tagging** | Smart categorization by subject/topic |
| **Search** | Full-text and tag-based search |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TailwindCSS, Axios |
| Backend | Node.js, Express 5 |
| AI Engine | Groq SDK (llama-3.1 family) |
| Database | PostgreSQL (lesson plans, quizzes, user accounts) |
| Cloud Storage | Google Drive (Phase 1), Cloudinary / Firebase (planned) |
| Auth | JWT + bcrypt password hashing |
| Infrastructure | Render.com (deployment-ready) |

---

## 📂 Project Structure (high level)

```
EZTutor/
├── client/      # React frontend
├── server/      # Express backend
├── docs/        # architecture, api-schema, deployment, security
├── CODE_REVIEW.md
├── REFACTORING_ROADMAP.md
└── README.md
```

See `FOLDER_STRUCTURE_GUIDE.md` for a full breakdown.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 12+ (or hosted DB)
- Groq API key (see https://console.groq.com)

### Install and run locally

```bash
git clone https://github.com/refatwashere/EZTutor.git
cd EZTutor
npm install

# Start backend
cd server
npm install
cp .env.example .env
# edit .env, then:
npm start

# Start frontend (in another terminal)
cd ../client
npm install
npm start
```

### Install Policy
- Root is dependency‑free and only contains orchestration scripts.
- Install dependencies in `server/` and `client/` (or use `npm run install-all` from root).
- Avoid keeping a root `node_modules/` to prevent confusion and bloat.

Frontend runs at `http://localhost:3000`, API at `http://localhost:5000`.

### Enable Google Drive Integration (Optional)
To export lessons and quizzes to Google Drive:
1. Follow [GOOGLE_CLOUD_SETUP.md](docs/GOOGLE_CLOUD_SETUP.md) to create a Google Cloud project
2. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `server/.env`
3. Generate and add `ENCRYPTION_KEY` to `server/.env`
4. Restart the server

See [Quick Reference](docs/GOOGLE_CLOUD_QUICK_REF.md) for a condensed checklist and [Integration Checklist](docs/INTEGRATION_CHECKLIST.md) for detailed verification steps.

---

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login & receive JWT |
| GET  | `/api/auth/me`    | Get current user (auth) |

### Core
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate-lesson` | Generate lesson plan (subject, topic) |
| POST | `/api/generate-quiz`   | Generate quiz (topic, difficulty, grade) |
| POST | `/api/support`         | Submit support request |

### User Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/recents` | List user's recents (auth) |
| POST   | `/api/recents` | Add a recent item (auth) |
| DELETE | `/api/recents` | Clear recents (auth) |

Health endpoints: `GET /health`, `GET /health/groq`

Full schema: `docs/api-schema.md`.

---

## 🛡️ Security & Safety
- Note: the repository's committed `.env` file was removed during a security cleanup. If you previously committed secrets, rotate them now.

- Input validation (express-validator or custom checks)
- Rate limiting: 100 requests / 15 minutes per IP
- JWT auth for protected endpoints
- bcrypt password hashing
- Parameterized DB queries (pg) to prevent SQL injection
- Optional API key gating (`EZTUTOR_API_KEY`)

See `docs/SECURITY.md` for details.

---

## 📦 Response Examples

Lesson plan example and quiz schema are in `docs/api-schema.md`.

---

## ✅ Testing

Backend

```bash
cd server
# runs Node's built-in test runner (node --test). Tests set NODE_ENV=test automatically
npm test
```

Notes:
- Server tests set `process.env.NODE_ENV = 'test'` inside individual test files to ensure background pollers (export queue) are disabled during runs.
- If you need to force-disable the export queue in other environments, set `DISABLE_EXPORT_QUEUE=true` in your environment.

Frontend

```bash
cd client
npm install
npm start    # run dev server (http://localhost:3000)
# or run tests
npm test
```

Tips for CI and local dev:
- Ensure `NODE_ENV=test` is set for server-side unit tests (the project tests already set this in test files).
- The export worker attempts DB connections when enabled; CI environments without a DB should either run tests in `NODE_ENV=test` or set `DISABLE_EXPORT_QUEUE=true` to avoid connection attempts.

---

## 📚 Documentation

### Core Documentation
- [Architecture Overview](docs/architecture.md) — System design & component relationships
- [API Schema](docs/api-schema.md) — Full API endpoint reference
- [Deployment Guide](docs/DEPLOYMENT.md) — Deploy to production (Render, Vercel, etc.)
- [Security Guide](docs/SECURITY.md) — Security best practices & token management

### Google Drive Integration
- [Google Cloud Setup Guide](docs/GOOGLE_CLOUD_SETUP.md) — **Complete step-by-step** guide for creating Google Cloud project, enabling APIs, and configuring OAuth
- [Quick Reference](docs/GOOGLE_CLOUD_QUICK_REF.md) — Checklist, credentials template, common commands, troubleshooting
- [Integration Checklist](docs/INTEGRATION_CHECKLIST.md) — Detailed verification checklist, architecture diagrams, file locations
- [Technical Integration](docs/GOOGLE_DRIVE_INTEGRATION.md) — Token management, retry queue, error handling details

**👉 Start here:** If you want to enable Google Drive exports, read [GOOGLE_CLOUD_SETUP.md](docs/GOOGLE_CLOUD_SETUP.md) first.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Run tests and add coverage
4. Open a PR describing your changes

Please follow commit hygiene and include tests for new features.

---

## 📜 License

MIT — see LICENSE file for details.

---

If you want, I can also:
- apply the `FOLDER_STRUCTURE_GUIDE.md` changes,
- add `server/constants.js` and `client/src/services/api.js`,
- or create the `.env.example` file.

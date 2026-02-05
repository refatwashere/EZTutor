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
- 🎓 **Smart Lesson Planner** — AI-generated objectives, key points, activities and timing
- 📝 **Quiz & Worksheet Generator** — MCQs, short answers, and essay prompts with answer keys
- 📚 **Resource Organizer** — Upload, auto-tag, and search teaching materials

### Philosophy
Keep the product lean, fast, and immediately useful while providing a solid foundation for future features (grading, analytics, collaboration).

---

## ✨ Feature Highlights

### 🎓 Lesson Planner
| Feature | Details |
|---------|---------|
| **Input** | Subject & Topic |
| **Output** | Objectives, key points, suggested activities, estimated duration |
| **Export** | PDF, Word, or shareable link |

### 📝 Quiz Generator
| Feature | Details |
|---------|---------|
| **Input** | Topic, difficulty, grade level, question mix |
| **Output** | MCQs with distractors, short-answer, essay questions, answer keys |
| **Customization** | Number of questions, mix, and difficulty |

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
| AI Engine | Groq SDK (llama family) |
| Database | PostgreSQL |
| Storage | Cloudinary / Firebase |
| Auth | JWT (stateless) |

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

Frontend runs at `http://localhost:3000`, API at `http://localhost:5000`.

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

```bash
# Backend
cd server && npm test

# Frontend
cd client && npm test
```

---

## 📚 Documentation

See `docs/architecture.md`, `docs/DEPLOYMENT.md`, `docs/api-schema.md`, and `docs/SECURITY.md`.

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

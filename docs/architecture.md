# EZTutor Architecture

## High-Level Overview
EZTutor is a lightweight full-stack MVP with a React client and an Express API.
The client handles user input and renders structured results, while the server
provides AI-generated lesson plans and quizzes.

## System Diagram (Mermaid)
```mermaid
flowchart LR
  U[Teacher] -->|Inputs subject/topic| UI[React Client]
  UI -->|POST /api/generate-lesson| API[Express API]
  UI -->|POST /api/generate-quiz| API
  API -->|Structured JSON| UI
  API -->|OpenAI SDK| OAI[OpenAI API]
```

## Runtime Components
- **Client**: React + TailwindCSS + Axios
  - Pages: Dashboard, LessonPlan, QuizGenerator, ResourceHub
  - Layout: shared navigation and theme system
- **Server**: Express + OpenAI SDK
  - Routes: `/api/generate-lesson`, `/api/generate-quiz`
  - Middleware: rate limiting, API key auth, error handler, compression

## Data Flow (Lesson Plan)
1. User enters subject + topic.
2. Client posts to `/api/generate-lesson`.
3. Server validates input and calls OpenAI with JSON schema response format.
4. Server returns structured JSON.
5. Client renders sections and offers copy/download.

## Data Flow (Quiz)
1. User enters topic + difficulty.
2. Client posts to `/api/generate-quiz`.
3. Server validates input and calls OpenAI with JSON schema response format.
4. Server returns structured JSON.
5. Client renders MCQ, short answer, and essay sections.

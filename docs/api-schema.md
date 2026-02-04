# EZTutor API Schema (Overview)

This document summarizes the response shapes used by the API. The server
returns structured JSON for predictable rendering in the UI.

## POST `/api/generate-lesson`

**Request**
```json
{
  "subject": "Math",
  "topic": "Fractions"
}
```

**Response**
```json
{
  "lessonPlan": {
    "title": "Lesson Plan: Fractions",
    "subject": "Math",
    "topic": "Fractions",
    "objectives": ["..."],
    "keyPoints": ["..."],
    "activities": ["..."],
    "assessmentIdeas": ["..."],
    "materials": ["..."],
    "differentiation": ["..."]
  }
}
```

## POST `/api/generate-quiz`

**Request**
```json
{
  "topic": "Renaissance",
  "difficulty": "intermediate",
  "gradeLevel": "Grade 7",
  "numQuestions": 10,
  "questionWeights": {
    "mcq": 0.6,
    "shortAnswer": 0.3,
    "essay": 0.1
  }
}
```

**Response**
```json
{
  "quiz": {
    "topic": "Renaissance",
    "difficulty": "intermediate",
    "gradeLevel": "Grade 7",
    "numQuestions": 10,
    "questionWeights": {
      "mcq": 0.6,
      "shortAnswer": 0.3,
      "essay": 0.1
    },
    "mcq": [
      {
        "question": "…",
        "options": ["A", "B", "C", "D"],
        "answerIndex": 2,
        "explanation": "…"
      }
    ],
    "shortAnswer": [
      {
        "question": "…",
        "sampleAnswer": "…"
      }
    ],
    "essay": [
      {
        "question": "…",
        "guidance": "…"
      }
    ]
  }
}
```

## POST `/api/auth/signup`

**Request**
```json
{
  "email": "teacher@example.com",
  "password": "password123"
}
```

**Response**
```json
{
  "token": "jwt_token_here"
}
```

## POST `/api/auth/login`

**Request**
```json
{
  "email": "teacher@example.com",
  "password": "password123"
}
```

**Response**
```json
{
  "token": "jwt_token_here"
}
```

## GET `/api/auth/me`

**Response**
```json
{
  "id": 1,
  "email": "teacher@example.com"
}
```

## GET `/api/recents`

**Response**
```json
{
  "recents": [
    {
      "id": 12,
      "type": "lesson",
      "title": "Lesson Plan: Fractions",
      "subtitle": "Grade 5 • Math",
      "created_at": "2025-01-22T15:04:05.000Z"
    }
  ]
}
```

## POST `/api/recents`

**Request**
```json
{
  "type": "quiz",
  "title": "Quiz: Renaissance",
  "subtitle": "Grade 7 • Intermediate"
}
```

**Response**
```json
{
  "id": 42,
  "type": "quiz",
  "title": "Quiz: Renaissance",
  "subtitle": "Grade 7 • Intermediate",
  "created_at": "2025-01-22T15:04:05.000Z"
}
```

## DELETE `/api/recents`

**Response**
```json
{
  "ok": true
}
```

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

---

## Custom Content Management (v2.0+)

Users can now create, store, edit, and delete custom lesson plans and quizzes.

### POST `/api/lesson-plans` (Auth Required)

**Create a custom lesson plan**

**Request**
```json
{
  "title": "Introduction to Fractions",
  "description": "A comprehensive lesson on fractions for 5th grade",
  "subject": "Math",
  "topic": "Fractions",
  "content": {
    "objectives": [
      "Define fractions as parts of a whole",
      "Identify equivalent fractions"
    ],
    "keyPoints": [
      "Numerator and denominator concepts",
      "Visual representation using models"
    ],
    "activities": [
      "Hands-on fraction circle activity",
      "Group problem-solving exercise"
    ],
    "assessmentIdeas": [
      "Exit ticket: 3 fraction identification questions",
      "Quiz: 10 problems on equivalent fractions"
    ],
    "materials": [
      "Fraction circle manipulatives",
      "Whiteboard and markers",
      "Student worksheet"
    ],
    "differentiation": [
      "Provide pre-made fraction circles for struggling learners",
      "Challenge advanced students with improper fractions and mixed numbers"
    ]
  }
}
```

**Response** (Status 201)
```json
{
  "lessonPlan": {
    "id": 1,
    "title": "Introduction to Fractions",
    "subject": "Math",
    "topic": "Fractions",
    "description": "A comprehensive lesson on fractions for 5th grade",
    "is_custom": true,
    "created_at": "2026-02-06T10:30:00.000Z"
  }
}
```

---

### GET `/api/lesson-plans` (Auth Required)

**Retrieve all user's lesson plans**

**Response**
```json
{
  "lessonPlans": [
    {
      "id": 1,
      "title": "Introduction to Fractions",
      "subject": "Math",
      "topic": "Fractions",
      "is_custom": true,
      "created_at": "2026-02-06T10:30:00.000Z",
      "updated_at": "2026-02-06T10:30:00.000Z"
    },
    {
      "id": 2,
      "title": "Photosynthesis Basics",
      "subject": "Science",
      "topic": "Photosynthesis",
      "is_custom": false,
      "created_at": "2026-02-05T14:15:00.000Z",
      "updated_at": "2026-02-05T14:15:00.000Z"
    }
  ]
}
```

---

### GET `/api/lesson-plans/:id` (Auth Required)

**Retrieve a specific lesson plan with full content**

**Response**
```json
{
  "lessonPlan": {
    "id": 1,
    "title": "Introduction to Fractions",
    "subject": "Math",
    "topic": "Fractions",
    "description": "A comprehensive lesson...",
    "is_custom": true,
    "content": {
      "objectives": ["..."],
      "keyPoints": ["..."],
      "activities": ["..."],
      "assessmentIdeas": ["..."],
      "materials": ["..."],
      "differentiation": ["..."]
    },
    "created_at": "2026-02-06T10:30:00.000Z",
    "updated_at": "2026-02-06T10:30:00.000Z"
  }
}
```

---

### PUT `/api/lesson-plans/:id` (Auth Required)

**Update an existing lesson plan**

**Request** (same structure as POST, but all fields optional)
```json
{
  "title": "Introduction to Fractions (Updated)",
  "content": {
    "objectives": ["..."],
    "keyPoints": ["..."]
  }
}
```

**Response**
```json
{
  "lessonPlan": {
    "id": 1,
    "title": "Introduction to Fractions (Updated)",
    "subject": "Math",
    "topic": "Fractions",
    "is_custom": true,
    "updated_at": "2026-02-06T11:00:00.000Z"
  }
}
```

---

### DELETE `/api/lesson-plans/:id` (Auth Required)

**Delete a lesson plan**

**Response**
```json
{
  "ok": true
}
```

---

### POST `/api/quizzes` (Auth Required)

**Create a custom quiz**

**Request**
```json
{
  "title": "Fractions Quiz #1",
  "description": "Assessment on basic fraction concepts",
  "topic": "Fractions",
  "difficulty": "basic",
  "gradeLevel": "Grade 5",
  "content": {
    "mcq": [
      {
        "question": "What fraction is shaded?",
        "options": ["1/2", "1/3", "1/4", "2/3"],
        "answerIndex": 0,
        "explanation": "Half of the circle is shaded = 1/2"
      }
    ],
    "shortAnswer": [
      {
        "question": "Write 0.5 as a fraction",
        "sampleAnswer": "1/2 or 50/100"
      }
    ],
    "essay": [
      {
        "question": "Explain how equivalent fractions work using an example",
        "guidance": "Student should show that 1/2 = 2/4 = 3/6 with visual or numerical proof"
      }
    ]
  }
}
```

**Response** (Status 201)
```json
{
  "quiz": {
    "id": 5,
    "title": "Fractions Quiz #1",
    "topic": "Fractions",
    "difficulty": "basic",
    "grade_level": "Grade 5",
    "description": "Assessment on basic fraction concepts",
    "is_custom": true,
    "created_at": "2026-02-06T10:30:00.000Z"
  }
}
```

---

### GET `/api/quizzes` (Auth Required)

**Retrieve all user's quizzes**

**Response**
```json
{
  "quizzes": [
    {
      "id": 5,
      "title": "Fractions Quiz #1",
      "topic": "Fractions",
      "difficulty": "basic",
      "grade_level": "Grade 5",
      "is_custom": true,
      "created_at": "2026-02-06T10:30:00.000Z",
      "updated_at": "2026-02-06T10:30:00.000Z"
    }
  ]
}
```

---

### GET `/api/quizzes/:id` (Auth Required)

**Retrieve a specific quiz with full content**

**Response**
```json
{
  "quiz": {
    "id": 5,
    "title": "Fractions Quiz #1",
    "topic": "Fractions",
    "difficulty": "basic",
    "grade_level": "Grade 5",
    "description": "Assessment on basic fraction concepts",
    "is_custom": true,
    "content": {
      "mcq": ["..."],
      "shortAnswer": ["..."],
      "essay": ["..."]
    },
    "created_at": "2026-02-06T10:30:00.000Z",
    "updated_at": "2026-02-06T10:30:00.000Z"
  }
}
```

---

### PUT `/api/quizzes/:id` (Auth Required)

**Update an existing quiz**

**Request** (same structure as POST, but all fields optional)
```json
{
  "title": "Fractions Quiz #1 (Revised)",
  "content": {
    "mcq": ["..."],
    "shortAnswer": ["..."]
  }
}
```

**Response**
```json
{
  "quiz": {
    "id": 5,
    "title": "Fractions Quiz #1 (Revised)",
    "topic": "Fractions",
    "difficulty": "basic",
    "is_custom": true,
    "updated_at": "2026-02-06T11:00:00.000Z"
  }
}
```

---

### DELETE `/api/quizzes/:id` (Auth Required)

**Delete a quiz**

**Response**
```json
{
  "ok": true
}
```

---

## Support Requests

**Notes**
Support requests are currently logged server-side and do not persist to the database.

## POST `/api/support`

**Request**
```json
{
  "name": "Alex Teacher",
  "email": "teacher@example.com",
  "topic": "Bug report",
  "message": "Quiz generator returns empty results."
}
```

**Response**
```json
{
  "ok": true
}
```

---

## Google Drive Integration (Phase 1 - Coming Soon)

### POST `/api/export-to-drive` (Auth Required)

**Export a lesson plan or quiz to Google Drive** *(v2.1+)*

**Request**
```json
{
  "contentType": "lesson",
  "contentId": 1
}
```

**Response** (Status 200)
```json
{
  "success": true,
  "googleDriveUrl": "https://drive.google.com/open?id=1abcXYZ...",
  "fileName": "Introduction to Fractions"
}
```

**Notes**
- Requires Google OAuth2 authentication (additional setup)
- Creates document in user's `/EZTutor` folder in Google Drive
- Supports exporting custom and AI-generated content
- Document title = lesson/quiz title
- Content formatted as Google Docs

---

## Error Responses

All endpoints return appropriate HTTP status codes:

| Status | Meaning |
|--------|---------|
| 200 | Success (GET, PUT, DELETE) |
| 201 | Created (POST) |
| 400 | Bad Request (validation failure) |
| 401 | Unauthorized (missing/invalid token) |
| 404 | Not Found (resource doesn't exist) |
| 500 | Server Error |

**Error Response Format**
```json
{
  "error": "Descriptive error message"

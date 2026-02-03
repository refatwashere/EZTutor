# EZTutor API Schema (Overview)

This document summarizes the response shapes used by the API. The server
returns structured JSON for predictable rendering in the UI.

## POST `/api/generate-lesson`

**Request**
```json
{
  "subject": "Math",
  "topic": "Fractions",
  "gradeLevel": "Grade 5"
}
```

**Response**
```json
{
  "lessonPlan": {
    "title": "Lesson Plan: Fractions",
    "subject": "Math",
    "topic": "Fractions",
    "gradeLevel": "Grade 5",
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
  "gradeLevel": "Grade 8",
  "numQuestions": 6,
  "questionWeights": {
    "mcq": 50,
    "shortAnswer": 30,
    "essay": 20
  }
}
```

**Response**
```json
{
  "quiz": {
    "topic": "Renaissance",
    "difficulty": "intermediate",
    "gradeLevel": "Grade 8",
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

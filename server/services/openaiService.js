const GroqSdk = require('groq-sdk');

let client;

function initClient() {
  if (!client) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not set in environment');
    }
    const timeout = Number(process.env.GROQ_TIMEOUT_MS || 20000);
    const maxRetries = Number(process.env.GROQ_MAX_RETRIES || 2);
    const Groq = GroqSdk.default || GroqSdk;
    client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
      timeout,
      maxRetries,
    });
  }
  return client;
}

const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama3-8b-8192';

const lessonPlanSchema = {
  name: 'lesson_plan',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['title', 'subject', 'topic', 'objectives', 'keyPoints', 'activities'],
    properties: {
      title: { type: 'string' },
      subject: { type: 'string' },
      topic: { type: 'string' },
      objectives: { type: 'array', items: { type: 'string' } },
      keyPoints: { type: 'array', items: { type: 'string' } },
      activities: { type: 'array', items: { type: 'string' } },
      assessmentIdeas: { type: 'array', items: { type: 'string' } },
      materials: { type: 'array', items: { type: 'string' } },
      differentiation: { type: 'array', items: { type: 'string' } },
    },
  },
};

const quizSchema = {
  name: 'quiz',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['topic', 'difficulty', 'mcq', 'shortAnswer', 'essay'],
    properties: {
      topic: { type: 'string' },
      difficulty: { type: 'string' },
      mcq: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['question', 'options', 'answerIndex'],
          properties: {
            question: { type: 'string' },
            options: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 5 },
            answerIndex: { type: 'integer', minimum: 0 },
            explanation: { type: 'string' },
          },
        },
      },
      shortAnswer: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['question', 'sampleAnswer'],
          properties: {
            question: { type: 'string' },
            sampleAnswer: { type: 'string' },
          },
        },
      },
      essay: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['question', 'guidance'],
          properties: {
            question: { type: 'string' },
            guidance: { type: 'string' },
          },
        },
      },
    },
  },
};

async function generateLessonPlan({ subject, topic }) {
  const groq = initClient();

  const messages = [
    {
      role: 'system',
      content:
        'You are a helpful curriculum assistant. Return concise, classroom-ready content in valid JSON only. Schema: {title, subject, topic, objectives[], keyPoints[], activities[], assessmentIdeas[], materials[], differentiation[]}.',
    },
    {
      role: 'user',
      content: `Create a lesson plan for subject "${subject}" on the topic "${topic}".`,
    },
  ];

  const resp = await groq.chat.completions.create({
    model: DEFAULT_MODEL,
    messages,
    max_tokens: 1000,
  });

  const content = resp?.choices?.[0]?.message?.content || '';
  return parseJsonResponse(content, lessonPlanSchema.name);
}

async function generateQuiz({ topic, difficulty }) {
  const groq = initClient();

  const messages = [
    {
      role: 'system',
      content:
        'You are a helpful teacher assistant. Return concise, classroom-ready content in valid JSON only. Schema: {topic, difficulty, mcq[{question, options[], answerIndex, explanation}], shortAnswer[{question, sampleAnswer}], essay[{question, guidance}]}.',
    },
    {
      role: 'user',
      content: `Generate a quiz on "${topic}" with ${difficulty} difficulty. Include multiple-choice, short-answer, and essay questions.`,
    },
  ];

  const resp = await groq.chat.completions.create({
    model: DEFAULT_MODEL,
    messages,
    max_tokens: 1000,
  });

  const content = resp?.choices?.[0]?.message?.content || '';
  return parseJsonResponse(content, quizSchema.name);
}

module.exports = {
  generateLessonPlan,
  generateQuiz,
};

function parseJsonResponse(content, label) {
  try {
    return JSON.parse(content);
  } catch (err) {
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      const slice = content.slice(start, end + 1);
      try {
        return JSON.parse(slice);
      } catch (innerErr) {
        throw new Error(`Failed to parse ${label} JSON response`);
      }
    }
    throw new Error(`Failed to parse ${label} JSON response`);
  }
}

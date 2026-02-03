const OpenAI = require('openai');

let client;

function initClient() {
  if (!client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not set in environment');
    }
    const timeout = Number(process.env.OPENAI_TIMEOUT_MS || 20000);
    const maxRetries = Number(process.env.OPENAI_MAX_RETRIES || 2);
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout,
      maxRetries,
    });
  }
  return client;
}

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

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
  const openai = initClient();

  const messages = [
    {
      role: 'system',
      content:
        'You are a helpful curriculum assistant. Return concise, classroom-ready content in valid JSON that matches the provided schema.',
    },
    {
      role: 'user',
      content: `Create a lesson plan for subject "${subject}" on the topic "${topic}".`,
    },
  ];

  const resp = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages,
    max_tokens: 1000,
    response_format: {
      type: 'json_schema',
      json_schema: lessonPlanSchema,
    },
  });

  const content = resp?.choices?.[0]?.message?.content || '';
  return JSON.parse(content);
}

async function generateQuiz({ topic, difficulty }) {
  const openai = initClient();

  const messages = [
    {
      role: 'system',
      content:
        'You are a helpful teacher assistant. Return concise, classroom-ready content in valid JSON that matches the provided schema.',
    },
    {
      role: 'user',
      content: `Generate a quiz on "${topic}" with ${difficulty} difficulty. Include multiple-choice, short-answer, and essay questions.`,
    },
  ];

  const resp = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages,
    max_tokens: 1000,
    response_format: {
      type: 'json_schema',
      json_schema: quizSchema,
    },
  });

  const content = resp?.choices?.[0]?.message?.content || '';
  return JSON.parse(content);
}

module.exports = {
  generateLessonPlan,
  generateQuiz,
};

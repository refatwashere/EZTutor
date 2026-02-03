const OpenAI = require('openai');

let client;

function shouldUseTemplateMode() {
  return process.env.EZTUTOR_MODE === 'template' || !process.env.OPENAI_API_KEY;
}

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

function buildTemplateLessonPlan({ subject, topic }) {
  const title = `${subject}: ${topic} Lesson Plan`;
  const objectives = [
    `Define key terms related to ${topic}.`,
    `Explain why ${topic} matters within ${subject}.`,
    `Apply ${topic} concepts to a short example or scenario.`,
  ];
  const keyPoints = [
    `Core idea of ${topic} in ${subject}.`,
    `Common misconceptions about ${topic}.`,
    `Real‑world relevance of ${topic}.`,
  ];
  const activities = [
    `Quick warm‑up: 3 prompt questions about ${topic}.`,
    `Guided practice: solve 2 examples related to ${topic}.`,
    `Exit ticket: one sentence summary of ${topic}.`,
  ];
  const assessmentIdeas = [
    `Short quiz: 5 questions on ${topic}.`,
    `One-paragraph reflection on how ${topic} shows up in daily life.`,
  ];
  const materials = [
    `Whiteboard/Slides`,
    `Handout with examples on ${topic}`,
  ];
  const differentiation = [
    `Provide sentence stems for struggling learners.`,
    `Offer an extension challenge for advanced students.`,
  ];
  return {
    title,
    subject,
    topic,
    objectives,
    keyPoints,
    activities,
    assessmentIdeas,
    materials,
    differentiation,
  };
}

function buildTemplateQuiz({ topic, difficulty }) {
  const mcq = [
    {
      question: `Which statement best describes ${topic}?`,
      options: [
        `A core concept that explains ${topic}`,
        `An unrelated idea to ${topic}`,
        `A definition that contradicts ${topic}`,
        `A random fact with no connection to ${topic}`,
      ],
      answerIndex: 0,
      explanation: `Option A matches the central definition of ${topic}.`,
    },
    {
      question: `Which is an example of ${topic}?`,
      options: [
        `A clear example of ${topic}`,
        `An opposite case`,
        `A common misconception`,
        `An unrelated scenario`,
      ],
      answerIndex: 0,
      explanation: `Option A demonstrates ${topic} in context.`,
    },
  ];

  const shortAnswer = [
    {
      question: `In 2–3 sentences, explain ${topic} in your own words.`,
      sampleAnswer: `${topic} is a concept that ... (student explains in their own words).`,
    },
    {
      question: `Describe one real‑world use of ${topic}.`,
      sampleAnswer: `A real‑world use is ...`,
    },
  ];

  const essay = [
    {
      question: `How does ${topic} connect to the broader theme of this unit?`,
      guidance: `Discuss the main idea, provide an example, and conclude with significance.`,
    },
  ];

  if (difficulty === 'advanced') {
    mcq.push({
      question: `Which scenario best illustrates an advanced application of ${topic}?`,
      options: [
        `A complex scenario requiring deeper reasoning about ${topic}`,
        `A simple recall question`,
        `A definition only`,
        `An unrelated example`,
      ],
      answerIndex: 0,
      explanation: `Option A requires advanced reasoning about ${topic}.`,
    });
  }

  return {
    topic,
    difficulty,
    mcq,
    shortAnswer,
    essay,
  };
}

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
  if (shouldUseTemplateMode()) {
    return buildTemplateLessonPlan({ subject, topic });
  }
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
  if (shouldUseTemplateMode()) {
    return buildTemplateQuiz({ topic, difficulty });
  }
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

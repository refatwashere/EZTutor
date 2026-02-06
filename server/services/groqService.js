const GroqSdk = require('groq-sdk');

let client;

function shouldUseTemplateMode() {
  return process.env.EZTUTOR_MODE === 'template';
}

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

const MODEL_FALLBACKS = [
  process.env.GROQ_MODEL,
  'llama-3.1-8b-instant',
  'llama-3.1-70b-versatile',
].filter(Boolean);

function pickModel(index = 0) {
  return MODEL_FALLBACKS[Math.min(index, MODEL_FALLBACKS.length - 1)];
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
      gradeLevel: { type: 'string' },
      numQuestions: { type: 'integer' },
      questionWeights: {
        type: 'object',
        additionalProperties: false,
        required: ['mcq', 'shortAnswer', 'essay'],
        properties: {
          mcq: { type: 'number' },
          shortAnswer: { type: 'number' },
          essay: { type: 'number' },
        },
      },
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
    return {
      title: `${subject}: ${topic} Lesson Plan`,
      subject,
      topic,
      objectives: [`Define key terms related to ${topic}.`, `Explain why ${topic} matters.`],
      keyPoints: [`Core idea of ${topic}.`, `Common misconceptions about ${topic}.`],
      activities: [`Quick warm‑up on ${topic}.`, `Guided practice.`],
      assessmentIdeas: [`Exit ticket: 2 quick questions.`],
      materials: [`Slides/board`, `Handout`],
      differentiation: [`Sentence stems`, `Extension challenge`],
    };
  }
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

  const resp = await createWithModelFallback(messages, lessonPlanSchema.name);

  const content = resp?.choices?.[0]?.message?.content || '';
  const parsed = parseJsonResponse(content, lessonPlanSchema.name);
  return normalizeLessonPlan(parsed, { subject, topic });
}

function getQuizDefaults({ gradeLevel, numQuestions, questionWeights }) {
  const safeGrade = typeof gradeLevel === 'string' && gradeLevel.trim() ? gradeLevel.trim() : 'Grade 6-8';
  const safeNum =
    Number.isInteger(numQuestions) && numQuestions >= 5 && numQuestions <= 25 ? numQuestions : 10;
  const safeWeights =
    questionWeights && typeof questionWeights === 'object'
      ? questionWeights
      : { mcq: 0.6, shortAnswer: 0.3, essay: 0.1 };
  return { gradeLevel: safeGrade, numQuestions: safeNum, questionWeights: safeWeights };
}

function distributeCounts(total, weights) {
  const entries = [
    { key: 'mcq', weight: weights.mcq },
    { key: 'shortAnswer', weight: weights.shortAnswer },
    { key: 'essay', weight: weights.essay },
  ];
  const raw = entries.map((entry) => total * entry.weight);
  const counts = {};
  entries.forEach((entry, idx) => {
    counts[entry.key] = Math.max(1, Math.floor(raw[idx]));
  });

  let sum = entries.reduce((acc, entry) => acc + counts[entry.key], 0);
  let remainder = total - sum;

  if (remainder > 0) {
    const order = entries
      .map((entry, idx) => ({
        key: entry.key,
        frac: raw[idx] - Math.floor(raw[idx]),
      }))
      .sort((a, b) => b.frac - a.frac);
    let i = 0;
    while (remainder > 0) {
      const target = order[i % order.length].key;
      counts[target] += 1;
      remainder -= 1;
      i += 1;
    }
  } else if (remainder < 0) {
    const order = entries
      .map((entry, idx) => ({
        key: entry.key,
        frac: raw[idx] - Math.floor(raw[idx]),
      }))
      .sort((a, b) => a.frac - b.frac);
    let i = 0;
    while (remainder < 0) {
      const target = order[i % order.length].key;
      if (counts[target] > 1) {
        counts[target] -= 1;
        remainder += 1;
      }
      i += 1;
      if (i > 100) break;
    }
  }

  return counts;
}

async function generateQuiz({ topic, difficulty, gradeLevel, numQuestions, questionWeights }) {
  const defaults = getQuizDefaults({ gradeLevel, numQuestions, questionWeights });
  if (shouldUseTemplateMode()) {
    const counts = distributeCounts(defaults.numQuestions, defaults.questionWeights);
    return {
      topic,
      difficulty,
      gradeLevel: defaults.gradeLevel,
      numQuestions: defaults.numQuestions,
      questionWeights: defaults.questionWeights,
      mcq: Array.from({ length: counts.mcq }, (_, index) => ({
        question: `Which statement best describes ${topic}?`,
        options: [
          `A core concept that explains ${topic}`,
          `An unrelated idea to ${topic}`,
          `A definition that contradicts ${topic}`,
          `A random fact with no connection to ${topic}`,
        ],
        answerIndex: 0,
        explanation: `Option A matches the central definition of ${topic}.`,
      })),
      shortAnswer: Array.from({ length: counts.shortAnswer }, (_, index) => ({
        question: `Explain ${topic} in your own words.`,
        sampleAnswer: `${topic} is a concept that ...`,
      })),
      essay: Array.from({ length: counts.essay }, (_, index) => ({
        question: `How does ${topic} connect to the broader theme of this unit?`,
        guidance: `Discuss main idea, example, and significance.`,
      })),
    };
  }
  const groq = initClient();

  const messages = [
    {
      role: 'system',
      content:
        'You are a helpful teacher assistant. Return concise, classroom-ready content in valid JSON only. Schema: {topic, difficulty, gradeLevel, numQuestions, questionWeights{mcq, shortAnswer, essay}, mcq[{question, options[], answerIndex, explanation}], shortAnswer[{question, sampleAnswer}], essay[{question, guidance}]}.',
    },
    {
      role: 'user',
      content: `Generate a quiz on "${topic}" with ${difficulty} difficulty for ${defaults.gradeLevel}. Provide about ${defaults.numQuestions} questions total with weights: MCQ ${defaults.questionWeights.mcq}, short answer ${defaults.questionWeights.shortAnswer}, essay ${defaults.questionWeights.essay}.`,
    },
  ];

  const resp = await createWithModelFallback(messages, quizSchema.name);

  const content = resp?.choices?.[0]?.message?.content || '';
  const parsed = parseJsonResponse(content, quizSchema.name);
  return normalizeQuiz(parsed, { topic, difficulty, ...defaults });
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

function normalizeString(value, fallback = '') {
  if (typeof value === 'string') return value;
  if (value == null) return fallback;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object') {
    const name = value.name || value.title;
    const desc = value.description || value.details;
    if (name && desc) return `${name}: ${desc}`;
    if (name) return String(name);
    return JSON.stringify(value);
  }
  return fallback;
}

function normalizeStringArray(value, fallback = []) {
  if (!Array.isArray(value)) return fallback;
  return value.map((item) => normalizeString(item, '')).filter((v) => v !== '');
}

function normalizeLessonPlan(plan, fallback) {
  const safe = plan && typeof plan === 'object' ? plan : {};
  return {
    title: normalizeString(safe.title, `${fallback.subject}: ${fallback.topic} Lesson Plan`),
    subject: normalizeString(safe.subject, fallback.subject),
    topic: normalizeString(safe.topic, fallback.topic),
    objectives: normalizeStringArray(safe.objectives, []),
    keyPoints: normalizeStringArray(safe.keyPoints, []),
    activities: normalizeStringArray(safe.activities, []),
    assessmentIdeas: normalizeStringArray(safe.assessmentIdeas, []),
    materials: normalizeStringArray(safe.materials, []),
    differentiation: normalizeStringArray(safe.differentiation, []),
  };
}

function normalizeQuiz(quiz, fallback) {
  const safe = quiz && typeof quiz === 'object' ? quiz : {};
  const mcq = Array.isArray(safe.mcq) ? safe.mcq : [];
  const shortAnswer = Array.isArray(safe.shortAnswer) ? safe.shortAnswer : [];
  const essay = Array.isArray(safe.essay) ? safe.essay : [];

  const normalizedMcq = mcq.map((q) => {
    const options = normalizeStringArray(q?.options || [], []);
    return {
      question: normalizeString(q?.question, ''),
      options,
      answerIndex: Number.isInteger(q?.answerIndex) ? q.answerIndex : 0,
      explanation: normalizeString(q?.explanation, ''),
    };
  });

  const normalizedShort = shortAnswer.map((q) => ({
    question: normalizeString(q?.question, ''),
    sampleAnswer: normalizeString(q?.sampleAnswer, ''),
  }));

  const normalizedEssay = essay.map((q) => ({
    question: normalizeString(q?.question, ''),
    guidance: normalizeString(q?.guidance, ''),
  }));

  return {
    topic: normalizeString(safe.topic, fallback.topic),
    difficulty: normalizeString(safe.difficulty, fallback.difficulty),
    gradeLevel: normalizeString(safe.gradeLevel, fallback.gradeLevel),
    numQuestions: Number.isInteger(safe.numQuestions) ? safe.numQuestions : fallback.numQuestions,
    questionWeights: safe.questionWeights || fallback.questionWeights,
    mcq: normalizedMcq,
    shortAnswer: normalizedShort,
    essay: normalizedEssay,
  };
}

async function createWithModelFallback(messages, label) {
  const groq = initClient();
  let lastErr;
  for (let i = 0; i < MODEL_FALLBACKS.length; i += 1) {
    const model = pickModel(i);
    try {
      return await groq.chat.completions.create({
        model,
        messages,
        max_tokens: 1000,
      });
    } catch (err) {
      lastErr = err;
      const code = err?.code || err?.error?.code;
      if (code !== 'model_decommissioned' && code !== 'invalid_request_error') {
        break;
      }
    }
  }
  throw lastErr || new Error(`Failed to create ${label} with Groq models`);
}

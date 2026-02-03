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

function buildTemplateLessonPlan({ subject, topic, gradeLevel }) {
  const subjectKey = String(subject || '').toLowerCase();
  const title = `${subject}: ${topic} Lesson Plan`;

  const resolveGradeLevel = (value) => {
    if (value) return value;
    if (subjectKey.includes('math') || subjectKey.includes('science')) return 'Grade 6';
    if (subjectKey.includes('history')) return 'Grade 7';
    if (subjectKey.includes('english') || subjectKey.includes('ela')) return 'Grade 8';
    return 'Grade 6';
  };

  const finalGrade = resolveGradeLevel(gradeLevel);
  const gradeTag = finalGrade ? ` for ${finalGrade}` : '';
  const gradeBand = String(finalGrade || '').toLowerCase();
  const isElementary = /k|grade\s?1|grade\s?2|grade\s?3|grade\s?4|grade\s?5/.test(gradeBand);
  const isMiddle = /grade\s?6|grade\s?7|grade\s?8/.test(gradeBand);
  const isHigh = /grade\s?9|grade\s?10|grade\s?11|grade\s?12|high/.test(gradeBand);

  const variation = Math.floor(Math.random() * 3);

  const subjectTemplates = {
    math: {
      objectives: [
        `${isElementary ? 'Model' : 'Represent'} ${topic} using numbers, visuals, or manipulatives${gradeTag}.`,
        `${isHigh ? 'Solve multi‑step' : 'Solve'} problems involving ${topic}${gradeTag}.`,
        `${isHigh ? 'Justify' : 'Explain'} reasoning for a ${topic} solution${gradeTag}.`,
      ],
      keyPoints: [
        `Key vocabulary and notation for ${topic}.`,
        `Common strategies and checks for ${topic}.`,
        `Typical errors to avoid in ${topic} problems.`,
      ],
      activities: [
        `Warm‑up: 3 quick problems on ${topic}.`,
        `Guided practice: solve 2 worked examples as a class.`,
        `Independent practice: 4 problems with varied difficulty.`,
      ],
      assessmentIdeas: [
        `Exit ticket: 2 problems + 1 explanation question.`,
        `Mini‑quiz with mixed representations of ${topic}.`,
      ],
      materials: [
        `Whiteboard/Slides`,
        `Practice handout`,
        `Optional manipulatives`,
      ],
      differentiation: [
        `Provide worked examples and sentence stems.`,
        `Offer challenge problems for extension.`,
      ],
    },
    science: {
      objectives: [
        `${isElementary ? 'Describe' : 'Explain'} the main process behind ${topic}${gradeTag}.`,
        `Identify key parts or stages of ${topic}${gradeTag}.`,
        `${isHigh ? 'Analyze' : 'Predict'} outcomes based on changes to ${topic}${gradeTag}.`,
      ],
      keyPoints: [
        `Scientific vocabulary linked to ${topic}.`,
        `Cause‑and‑effect relationships in ${topic}.`,
        `Real‑world examples of ${topic}.`,
      ],
      activities: [
        `Demo or video observation related to ${topic}.`,
        `Group model‑building or diagram labeling.`,
        `Claim‑evidence‑reasoning prompt about ${topic}.`,
      ],
      assessmentIdeas: [
        `Short CER write‑up on ${topic}.`,
        `Diagram labeling quiz.`,
      ],
      materials: [
        `Slides/diagram`,
        `Lab sheet (if applicable)`,
        `Markers or sticky notes`,
      ],
      differentiation: [
        `Provide scaffolded diagrams and word banks.`,
        `Extension: connect ${topic} to a new scenario.`,
      ],
    },
    history: {
      objectives: [
        `Summarize key events or figures related to ${topic}${gradeTag}.`,
        `${isHigh ? 'Evaluate' : 'Analyze'} causes and effects of ${topic}${gradeTag}.`,
        `${isElementary ? 'Use simple evidence' : 'Use evidence'} to support a historical claim about ${topic}${gradeTag}.`,
      ],
      keyPoints: [
        `Timeline context for ${topic}.`,
        `Primary vs. secondary sources on ${topic}.`,
        `Multiple perspectives on ${topic}.`,
      ],
      activities: [
        `Primary source analysis in pairs.`,
        `Timeline card sort for ${topic}.`,
        `Short debate or discussion prompt.`,
      ],
      assessmentIdeas: [
        `Short response using evidence from a source.`,
        `Exit ticket: cause/effect summary.`,
      ],
      materials: [
        `Primary source handout`,
        `Timeline cards`,
        `Slides`,
      ],
      differentiation: [
        `Provide sentence frames for analysis.`,
        `Offer extension reading with discussion questions.`,
      ],
    },
    english: {
      objectives: [
        `Identify key elements of ${topic} in a text${gradeTag}.`,
        `${isElementary ? 'Write 3–4 sentences' : 'Write a short response'} using evidence${gradeTag}.`,
        `${isHigh ? 'Analyze' : 'Explain'} how craft/structure supports meaning${gradeTag}.`,
      ],
      keyPoints: [
        `Key vocabulary for ${topic}.`,
        `Text evidence and citation basics.`,
        `Author’s purpose and tone.`,
      ],
      activities: [
        `Close reading with annotation.`,
        `Pair‑share on a discussion prompt.`,
        `Write a paragraph with a claim + evidence.`,
      ],
      assessmentIdeas: [
        `Exit ticket: cite one piece of evidence.`,
        `Short response rubric check.`,
      ],
      materials: [
        `Text excerpt`,
        `Annotation guide`,
        `Writing checklist`,
      ],
      differentiation: [
        `Provide sentence starters and word banks.`,
        `Extension: compare two excerpts.`,
      ],
    },
  };

  const fallback = {
    objectives: [
      `Define key terms related to ${topic}${gradeTag}.`,
      `Explain why ${topic} matters within ${subject}${gradeTag}.`,
      `Apply ${topic} concepts to a short example or scenario${gradeTag}.`,
    ],
    keyPoints: [
      `Core idea of ${topic} in ${subject}.`,
      `Common misconceptions about ${topic}.`,
      `Real‑world relevance of ${topic}.`,
    ],
    activities: [
      `Quick warm‑up: 3 prompt questions about ${topic}.`,
      `Guided practice: 2 examples related to ${topic}.`,
      `Exit ticket: one sentence summary of ${topic}.`,
    ],
    assessmentIdeas: [
      `Short quiz: 5 questions on ${topic}.`,
      `One‑paragraph reflection on how ${topic} shows up in daily life.`,
    ],
    materials: [
      `Whiteboard/Slides`,
      `Handout with examples on ${topic}`,
    ],
    differentiation: [
      `Provide sentence stems for struggling learners.`,
      `Offer an extension challenge for advanced students.`,
    ],
  };

  const picked =
    subjectKey.includes('math') ? subjectTemplates.math :
    subjectKey.includes('science') ? subjectTemplates.science :
    subjectKey.includes('history') ? subjectTemplates.history :
    subjectKey.includes('english') || subjectKey.includes('ela') ? subjectTemplates.english :
    fallback;

  const objectives = picked.objectives;
  const keyPoints = picked.keyPoints;
  const activities =
    variation === 1
      ? picked.activities.slice().reverse()
      : variation === 2
      ? [...picked.activities, `Quick reflection: one takeaway about ${topic}.`]
      : picked.activities;
  const assessmentIdeas =
    variation === 2
      ? [...picked.assessmentIdeas, `Peer check: swap and review answers.`]
      : picked.assessmentIdeas;
  const materials = picked.materials;
  const differentiation = picked.differentiation;
  return {
    title,
    subject,
    topic,
    gradeLevel: finalGrade,
    objectives,
    keyPoints,
    activities,
    assessmentIdeas,
    materials,
    differentiation,
  };
}

function buildTemplateQuiz({ topic, difficulty, gradeLevel }) {
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const subjectKey = String(topic || '').toLowerCase();

  const subjectBanks = {
    math: {
      mcq: [
        {
          question: `Which representation best matches ${topic}?`,
          options: [
            `A correct visual/number model of ${topic}`,
            `A model that misrepresents ${topic}`,
            `A model for a different concept`,
            `A model with missing values`,
          ],
          answerIndex: 0,
          explanation: `Option A accurately represents ${topic}.`,
        },
      ],
      shortAnswer: [
        {
          question: `Solve a simple ${topic} problem and show your steps.`,
          sampleAnswer: `Student work with labeled steps and final answer.`,
        },
      ],
      essay: [
        {
          question: `Explain how ${topic} can be used to solve a real-world problem.`,
          guidance: `Describe the situation, set up the math, and interpret the result.`,
        },
      ],
    },
    science: {
      mcq: [
        {
          question: `Which statement correctly describes the process of ${topic}?`,
          options: [
            `A correct description of the process`,
            `A description that reverses cause/effect`,
            `A description of a different process`,
            `A description missing a key step`,
          ],
          answerIndex: 0,
          explanation: `Option A matches the scientific process of ${topic}.`,
        },
      ],
      shortAnswer: [
        {
          question: `Predict what happens if one variable in ${topic} changes.`,
          sampleAnswer: `Prediction with reasoning grounded in ${topic}.`,
        },
      ],
      essay: [
        {
          question: `Use evidence to explain why ${topic} occurs.`,
          guidance: `Include observations, reasoning, and a conclusion.`,
        },
      ],
    },
    history: {
      mcq: [
        {
          question: `Which event best connects to ${topic}?`,
          options: [
            `An event directly tied to ${topic}`,
            `An event from a different era`,
            `An unrelated political event`,
            `A cultural event with no link`,
          ],
          answerIndex: 0,
          explanation: `Option A is most closely tied to ${topic}.`,
        },
      ],
      shortAnswer: [
        {
          question: `Describe one cause and one effect of ${topic}.`,
          sampleAnswer: `Cause: ... Effect: ...`,
        },
      ],
      essay: [
        {
          question: `How did ${topic} change society during its time period?`,
          guidance: `Discuss impact, evidence, and differing perspectives.`,
        },
      ],
    },
    english: {
      mcq: [
        {
          question: `Which sentence best demonstrates ${topic}?`,
          options: [
            `A sentence that correctly uses ${topic}`,
            `A sentence with a minor error`,
            `A sentence that uses a different concept`,
            `A sentence with no clear meaning`,
          ],
          answerIndex: 0,
          explanation: `Option A correctly demonstrates ${topic}.`,
        },
      ],
      shortAnswer: [
        {
          question: `Write a short response that uses ${topic} effectively.`,
          sampleAnswer: `A brief response demonstrating ${topic}.`,
        },
      ],
      essay: [
        {
          question: `Analyze how ${topic} affects meaning in a text.`,
          guidance: `Use evidence and explain author’s choices.`,
        },
      ],
    },
  };

  const subjectPick =
    subjectKey.includes('math') ? subjectBanks.math :
    subjectKey.includes('science') ? subjectBanks.science :
    subjectKey.includes('history') ? subjectBanks.history :
    subjectKey.includes('english') || subjectKey.includes('ela') ? subjectBanks.english :
    null;

  const variationMcq = [
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

  const variationShort = [
    {
      question: `In 2–3 sentences, explain ${topic} in your own words.`,
      sampleAnswer: `${topic} is a concept that ... (student explains in their own words).`,
    },
    {
      question: `Describe one real‑world use of ${topic}.`,
      sampleAnswer: `A real‑world use is ...`,
    },
  ];

  const variationEssay = [
    {
      question: `How does ${topic} connect to the broader theme of this unit?`,
      guidance: `Discuss the main idea, provide an example, and conclude with significance.`,
    },
  ];

  const mcq = [
    pick(variationMcq),
    pick(variationMcq),
  ];

  const shortAnswer = [
    pick(variationShort),
  ];

  const essay = [
    pick(variationEssay),
  ];

  if (subjectPick) {
    mcq.push(pick(subjectPick.mcq));
    shortAnswer.push(pick(subjectPick.shortAnswer));
    essay.push(pick(subjectPick.essay));
  }
  if (difficulty === 'intermediate') {
    mcq.push({
      question: `Which choice best compares two ideas related to ${topic}?`,
      options: [
        `A comparison that highlights a subtle difference`,
        `A comparison that restates the same idea`,
        `A comparison with unrelated terms`,
        `A comparison that ignores context`,
      ],
      answerIndex: 0,
      explanation: `Option A demonstrates nuanced understanding of ${topic}.`,
    });
    shortAnswer.push({
      question: `What is one misconception about ${topic}, and how would you correct it?`,
      sampleAnswer: `A common misconception is ... A correction is ...`,
    });
  }

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
    essay.push({
      question: `Evaluate two perspectives on ${topic} and argue which is stronger.`,
      guidance: `Use evidence, counterarguments, and a clear conclusion.`,
    });
  }

  return {
    topic,
    difficulty,
    gradeLevel,
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
      gradeLevel: { type: 'string' },
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

async function generateLessonPlan({ subject, topic, gradeLevel }) {
  if (shouldUseTemplateMode()) {
    return buildTemplateLessonPlan({ subject, topic, gradeLevel });
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
      content: `Create a lesson plan for subject "${subject}" on the topic "${topic}".${gradeLevel ? ` Target grade: ${gradeLevel}.` : ''}`,
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

async function generateQuiz({ topic, difficulty, gradeLevel, numQuestions, questionWeights }) {
  if (shouldUseTemplateMode()) {
    const base = buildTemplateQuiz({ topic, difficulty, gradeLevel });
    if (numQuestions && Number.isInteger(numQuestions)) {
      const total = Math.max(3, Math.min(12, numQuestions));
      let mcqCount;
      let shortCount;
      let essayCount;
      if (questionWeights) {
        mcqCount = Math.max(1, Math.round((questionWeights.mcq / 100) * total));
        shortCount = Math.max(1, Math.round((questionWeights.shortAnswer / 100) * total));
        essayCount = Math.max(1, total - mcqCount - shortCount);
      } else {
        essayCount = Math.max(1, Math.round(total * 0.2));
        shortCount = Math.max(1, Math.round(total * 0.3));
        mcqCount = Math.max(1, total - essayCount - shortCount);
      }
      base.mcq = base.mcq.slice(0, mcqCount);
      base.shortAnswer = base.shortAnswer.slice(0, shortCount);
      base.essay = base.essay.slice(0, essayCount);
    }
    return base;
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
      content: `Generate a quiz on "${topic}" with ${difficulty} difficulty.${gradeLevel ? ` Target grade: ${gradeLevel}.` : ''}${numQuestions ? ` Total questions: ${numQuestions}.` : ''}${questionWeights ? ` Weights: MCQ ${questionWeights.mcq}%, Short ${questionWeights.shortAnswer}%, Essay ${questionWeights.essay}%.` : ''} Include multiple-choice, short-answer, and essay questions.`,
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

import React, { useState } from 'react';
import axios from 'axios';

export default function QuizGenerator() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('basic');
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentTopics] = useState([
    { topic: 'Renaissance', difficulty: 'intermediate' },
    { topic: 'Electric Circuits', difficulty: 'basic' },
    { topic: 'Argumentative Writing', difficulty: 'advanced' },
  ]);

  const generateQuiz = async () => {
    setError('');
    setQuiz(null);
    setLoading(true);
    try {
      const res = await axios.post(
        '/api/generate-quiz',
        { topic, difficulty },
        {
          baseURL: process.env.REACT_APP_API_BASE || '',
        }
      );
      setQuiz(res.data.quiz);
      const summary = {
        id: `quiz-${Date.now()}`,
        type: 'quiz',
        title: `Quiz: ${res.data.quiz?.topic || topic}`,
        subtitle: `Difficulty: ${difficulty}`,
      };
      const existing = JSON.parse(localStorage.getItem('eztutor_recent_outputs') || '[]');
      localStorage.setItem('eztutor_recent_outputs', JSON.stringify([summary, ...existing].slice(0, 5)));
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        'Failed to generate quiz. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formatQuizText = (quizData) => {
    if (!quizData) return '';
    const lines = [];
    lines.push(`Quiz: ${quizData.topic || topic}`);
    lines.push(`Difficulty: ${quizData.difficulty || difficulty}`);
    lines.push('');
    if (quizData.mcq?.length) {
      lines.push('Multiple Choice:');
      quizData.mcq.forEach((q, i) => {
        lines.push(`${i + 1}. ${q.question}`);
        q.options.forEach((opt, idx) => {
          lines.push(`   ${String.fromCharCode(65 + idx)}. ${opt}`);
        });
        if (Number.isInteger(q.answerIndex) && q.options[q.answerIndex]) {
          lines.push(`   Answer: ${String.fromCharCode(65 + q.answerIndex)}. ${q.options[q.answerIndex]}`);
        }
        lines.push('');
      });
    }
    if (quizData.shortAnswer?.length) {
      lines.push('Short Answer:');
      quizData.shortAnswer.forEach((q, i) => {
        lines.push(`${i + 1}. ${q.question}`);
        lines.push(`   Sample Answer: ${q.sampleAnswer}`);
        lines.push('');
      });
    }
    if (quizData.essay?.length) {
      lines.push('Essay:');
      quizData.essay.forEach((q, i) => {
        lines.push(`${i + 1}. ${q.question}`);
        lines.push(`   Guidance: ${q.guidance}`);
        lines.push('');
      });
    }
    return lines.join('\n').trim();
  };

  const handleCopy = async () => {
    if (!quiz) return;
    try {
      await navigator.clipboard.writeText(formatQuizText(quiz));
    } catch (err) {
      setError('Failed to copy to clipboard.');
    }
  };

  const handleDownload = () => {
    if (!quiz) return;
    const text = formatQuizText(quiz);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(quiz?.topic || topic || 'quiz').replace(/\s+/g, '_')}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const canSubmit = topic.trim() && difficulty && !loading;

  return (
    <div className="page">
      <div className="container space-y-6 fade-in">
      <div className="card section-card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Quiz Generator</h2>
        <div className="flex gap-2">
          <button className="btn btn-outline" onClick={() => setQuiz(null)}>
            Clear
          </button>
        </div>
      </div>
      <p className="text-gray-600">
        Generate a balanced quiz with multiple choice, short answer, and essay questions.
      </p>
      <div className="flex flex-wrap gap-2">
        {recentTopics.map((item) => (
          <button
            key={`${item.topic}-${item.difficulty}`}
            className="pill"
            onClick={() => {
              setTopic(item.topic);
              setDifficulty(item.difficulty);
            }}
          >
            {item.topic} • {item.difficulty}
          </button>
        ))}
      </div>
      <input 
        className="input w-full"
        placeholder="Topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <select 
        className="input w-full"
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
      >
        <option value="basic">Basic</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
      <div className="flex flex-wrap gap-2">
        <button 
          className="btn btn-secondary disabled:opacity-50"
          onClick={generateQuiz}
          disabled={!canSubmit}
        >
          {loading ? 'Generating...' : 'Generate Quiz'}
        </button>
        <button className="btn btn-outline" onClick={handleCopy} disabled={!quiz}>
          Copy
        </button>
        <button className="btn btn-outline" onClick={handleDownload} disabled={!quiz}>
          Download
        </button>
      </div>
      </div>

      {loading && (
        <div className="mt-6 space-y-3">
          <div className="h-4 rounded w-1/3 skeleton"></div>
          <div className="h-3 rounded w-full skeleton"></div>
          <div className="h-3 rounded w-5/6 skeleton"></div>
          <div className="h-3 rounded w-2/3 skeleton"></div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 border border-red-300 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      {quiz && (
        <div className="mt-6 p-6 card space-y-4 fade-in">
          <div>
            <div className="text-xl font-semibold">{quiz.topic || topic}</div>
            <div className="text-gray-700">Difficulty: {quiz.difficulty || difficulty}</div>
          </div>

          {quiz.mcq?.length > 0 && (
            <div>
              <div className="font-semibold">Multiple Choice</div>
              <ol className="list-decimal pl-6 space-y-2">
                {quiz.mcq.map((q, i) => (
                  <li key={i}>
                    <div>{String(q.question)}</div>
                    <ul className="list-disc pl-6">
                      {q.options.map((opt, idx) => (
                        <li key={idx}>
                          {String(opt)}
                          {q.answerIndex === idx ? (
                            <span className="ml-2 text-green-700">(Answer)</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                    {q.explanation && <div className="text-sm text-gray-600">Explanation: {q.explanation}</div>}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {quiz.shortAnswer?.length > 0 && (
            <div>
              <div className="font-semibold">Short Answer</div>
              <ol className="list-decimal pl-6 space-y-2">
                {quiz.shortAnswer.map((q, i) => (
                  <li key={i}>
                    <div>{String(q.question)}</div>
                    <div className="text-sm text-gray-700">Sample: {String(q.sampleAnswer)}</div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {quiz.essay?.length > 0 && (
            <div>
              <div className="font-semibold">Essay</div>
              <ol className="list-decimal pl-6 space-y-2">
                {quiz.essay.map((q, i) => (
                  <li key={i}>
                    <div>{String(q.question)}</div>
                    <div className="text-sm text-gray-700">Guidance: {String(q.guidance)}</div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

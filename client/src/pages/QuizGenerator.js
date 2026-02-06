import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../context/NotificationContext';

export default function QuizGenerator() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('basic');
  const [gradeLevel, setGradeLevel] = useState('Grade 7');
  const [numQuestions, setNumQuestions] = useState(10);
  const [weightPreset, setWeightPreset] = useState('balanced');
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [prefsNotice, setPrefsNotice] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { addToast } = useNotification();
  const [recentTopics] = useState([
    { topic: 'Renaissance', difficulty: 'intermediate' },
    { topic: 'Electric Circuits', difficulty: 'basic' },
    { topic: 'Argumentative Writing', difficulty: 'advanced' },
  ]);

  const weightPresets = {
    balanced: { mcq: 0.6, shortAnswer: 0.3, essay: 0.1 },
    mcqHeavy: { mcq: 0.75, shortAnswer: 0.2, essay: 0.05 },
    writingHeavy: { mcq: 0.4, shortAnswer: 0.4, essay: 0.2 },
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('eztutor_quiz_prefs');
      if (!stored) return;
      const prefs = JSON.parse(stored);
      if (prefs.gradeLevel) setGradeLevel(prefs.gradeLevel);
      if (prefs.numQuestions) setNumQuestions(prefs.numQuestions);
      if (prefs.weightPreset) setWeightPreset(prefs.weightPreset);
      setPrefsNotice('Quiz settings loaded from Dashboard.');
      setTimeout(() => setPrefsNotice(''), 2500);
    } catch (err) {
      // ignore malformed prefs
    }
  }, []);

  const generateQuiz = async () => {
    setError('');
    setQuiz(null);
    setLoading(true);
    try {
      const res = await axios.post(
        '/api/generate-quiz',
        {
          topic,
          difficulty,
          gradeLevel,
          numQuestions: Number(numQuestions),
          questionWeights: weightPresets[weightPreset] || weightPresets.balanced,
        },
        {
          baseURL: process.env.REACT_APP_API_BASE || '',
        }
      );
      setQuiz(res.data.quiz);
      await saveRecent(
        'quiz',
        `Quiz: ${res.data.quiz?.topic || topic}`,
        `${gradeLevel} • ${difficulty}`
      );
      addToast('Quiz generated and saved to recents.', 'success');
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
    lines.push(`Grade Level: ${quizData.gradeLevel || gradeLevel}`);
    lines.push(`Questions: ${quizData.numQuestions || numQuestions}`);
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
      addToast('Quiz copied to clipboard.', 'success');
    } catch (err) {
      addToast('Failed to copy to clipboard.', 'error');
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
    addToast('Quiz downloaded.', 'success');
  };

  const canSubmit = topic.trim() && difficulty && gradeLevel.trim() && !loading;

  const saveRecent = async (type, title, subtitle) => {
    const token = localStorage.getItem('eztutor_token');
    if (!token) return;
    await fetch(`${process.env.REACT_APP_API_BASE || ''}/api/recents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type, title, subtitle }),
    });
  };

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
      {prefsNotice && <div className="pill">{prefsNotice}</div>}
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
      <input
        className="input w-full"
        placeholder="Grade level (e.g., Grade 7)"
        value={gradeLevel}
        onChange={(e) => setGradeLevel(e.target.value)}
      />
      <input
        className="input w-full"
        type="number"
        min="5"
        max="25"
        value={numQuestions}
        onChange={(e) => setNumQuestions(e.target.value)}
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
      <select
        className="input w-full"
        value={weightPreset}
        onChange={(e) => setWeightPreset(e.target.value)}
      >
        <option value="balanced">Balanced mix</option>
        <option value="mcqHeavy">More multiple choice</option>
        <option value="writingHeavy">More writing</option>
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
        <button className="btn btn-secondary" onClick={() => setConfirmOpen(true)} disabled={!quiz}>
          Export to Google Drive
        </button>
        <ConfirmModal
          open={confirmOpen}
          title="Export quiz to Google Drive"
          message="This will save the quiz to your library and export a copy to your Google Drive. Proceed?"
          confirmText="Export"
          cancelText="Cancel"
          onCancel={() => setConfirmOpen(false)}
          onConfirm={async () => {
            setConfirmOpen(false);
            setExporting(true);
            const token = localStorage.getItem('eztutor_token');
            if (!token) { setError('Please sign in to save and export.'); setExporting(false); return; }
            try {
              const res = await fetch(`${process.env.REACT_APP_API_BASE || ''}/api/quizzes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ title: quiz.title || `Quiz: ${quiz.topic || topic}`, description: quiz.description || '', content: { ...quiz, topic } }),
              });
              if (res.status === 401) throw new Error('Authentication required to save content.');
              const saved = await res.json();
              if (!saved || !saved.id) throw new Error('Failed to save quiz before export.');
              const ex = await fetch(`${process.env.REACT_APP_API_BASE || ''}/api/export-to-drive`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ contentType: 'quiz', contentId: saved.id }),
              });
              const exJson = await ex.json();
              if (ex.status === 401 && exJson && exJson.redirectUrl) { 
                // store pending export so we can resume after OAuth
                localStorage.setItem('pendingExport', JSON.stringify({ contentType: 'quiz', contentId: saved.id }));
                window.location.href = exJson.redirectUrl; 
                return; 
              }
              if (!exJson || !exJson.success) throw new Error(exJson?.error || 'Export failed');
              addToast('Exported to Google Drive successfully!', 'success');
              if (exJson.googleDriveUrl) window.open(exJson.googleDriveUrl, '_blank');
            } catch (err) {
              setError(err?.message || 'Export failed.');
            } finally { setExporting(false); }
          }}
        />
        <LoadingSpinner open={exporting} message="Exporting to Google Drive..." />
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
            <div className="text-gray-700">Grade Level: {quiz.gradeLevel || gradeLevel}</div>
            <div className="text-gray-700">Questions: {quiz.numQuestions || numQuestions}</div>
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
      {!loading && !quiz && !error && (
        <div className="mt-6 text-gray-600">Generate a quiz to see results here.</div>
      )}
      </div>
    </div>
  );
}

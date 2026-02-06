import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../context/NotificationContext';

export default function EditQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('basic');
  const [gradeLevel, setGradeLevel] = useState('');
  const [mcqs, setMcqs] = useState([{ question: '', options: ['', '', ''], answerIndex: 0, explanation: '' }]);
  const [shortAnswers, setShortAnswers] = useState([{ question: '', sampleAnswer: '' }]);
  const [essays, setEssays] = useState([{ question: '', guidance: '' }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useNotification();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const token = localStorage.getItem('eztutor_token');
  const isEditMode = id !== 'new';

  useEffect(() => {
    if (isEditMode) {
      loadQuiz();
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadQuiz = async () => {
    try {
      const res = await axios.get(`/api/quizzes/${id}`, {
        baseURL: process.env.REACT_APP_API_BASE || '',
        headers: { Authorization: `Bearer ${token}` },
      });

      const q = res.data.quiz;
      setQuiz(q);
      setTitle(q.title);
      setDescription(q.description || '');
      setTopic(q.topic);
      setDifficulty(q.difficulty || 'basic');
      setGradeLevel(q.grade_level || '');
      setMcqs(q.content?.mcq || [{ question: '', options: ['', '', ''], answerIndex: 0, explanation: '' }]);
      setShortAnswers(q.content?.shortAnswer || [{ question: '', sampleAnswer: '' }]);
      setEssays(q.content?.essay || [{ question: '', guidance: '' }]);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const updateMcq = (index, field, value) => {
    const updated = [...mcqs];
    updated[index] = { ...updated[index], [field]: value };
    setMcqs(updated);
  };

  const updateMcqOption = (mcqIdx, optIdx, value) => {
    const updated = [...mcqs];
    const options = [...updated[mcqIdx].options];
    options[optIdx] = value;
    updated[mcqIdx].options = options;
    setMcqs(updated);
  };

  const addMcq = () => {
    setMcqs([...mcqs, { question: '', options: ['', '', ''], answerIndex: 0, explanation: '' }]);
  };

  const removeMcq = (index) => {
    setMcqs(mcqs.filter((_, i) => i !== index));
  };

  const updateShortAnswer = (index, field, value) => {
    const updated = [...shortAnswers];
    updated[index] = { ...updated[index], [field]: value };
    setShortAnswers(updated);
  };

  const addShortAnswer = () => {
    setShortAnswers([...shortAnswers, { question: '', sampleAnswer: '' }]);
  };

  const removeShortAnswer = (index) => {
    setShortAnswers(shortAnswers.filter((_, i) => i !== index));
  };

  const updateEssay = (index, field, value) => {
    const updated = [...essays];
    updated[index] = { ...updated[index], [field]: value };
    setEssays(updated);
  };

  const addEssay = () => {
    setEssays([...essays, { question: '', guidance: '' }]);
  };

  const removeEssay = (index) => {
    setEssays(essays.filter((_, i) => i !== index));
  };

  const saveQuiz = async () => {
    if (!title || !topic) {
      setError('Title and topic are required');
      return;
    }

    if (mcqs.length === 0 && shortAnswers.length === 0 && essays.length === 0) {
      setError('Add at least one question');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const content = {
        mcq: mcqs.filter((q) => q.question.trim()),
        shortAnswer: shortAnswers.filter((q) => q.question.trim()),
        essay: essays.filter((q) => q.question.trim()),
      };

      if (isEditMode) {
        await axios.put(
          `/api/quizzes/${id}`,
          { title, description, topic, difficulty, gradeLevel, content },
          {
            baseURL: process.env.REACT_APP_API_BASE || '',
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(
          '/api/quizzes',
          { title, description, topic, difficulty, gradeLevel, content },
          {
            baseURL: process.env.REACT_APP_API_BASE || '',
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      addToast(`Quiz ${isEditMode ? 'updated' : 'created'} successfully!`, 'success');
      setTimeout(() => navigate('/my-quizzes'), 1500);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="page">
        <div className="container text-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container space-y-8 fade-in">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">{isEditMode ? 'Edit' : 'Create'} Quiz</h1>
          <p className="text-gray-600">
            {isEditMode ? 'Update your existing quiz' : 'Create a new quiz from scratch'}
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {toast && <div className="alert alert-success">{toast}</div>}

        <div className="card section-card space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Quiz Details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Title *</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g., Fractions Quiz"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Description (Optional)</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Brief description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="label">Topic *</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g., Fractions"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Difficulty</label>
                <select
                  className="input w-full"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="label">Grade Level (Optional)</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g., Grade 4"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Multiple Choice Questions */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Multiple Choice Questions</h3>
              <button className="btn btn-sm btn-outline" onClick={addMcq}>
                + Add MCQ
              </button>
            </div>
            {mcqs.map((mcq, idx) => (
              <div key={idx} className="card bg-gray-50 p-4 space-y-3 rounded">
                <div className="flex justify-between">
                  <span className="font-semibold">Question {idx + 1}</span>
                  {mcqs.length > 1 && (
                    <button
                      className="btn btn-sm btn-outline text-red-600"
                      onClick={() => removeMcq(idx)}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Question text"
                  value={mcq.question}
                  onChange={(e) => updateMcq(idx, 'question', e.target.value)}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Options</label>
                  {mcq.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex gap-2">
                      <input
                        type="text"
                        className="input w-full"
                        placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                        value={opt}
                        onChange={(e) => updateMcqOption(idx, optIdx, e.target.value)}
                      />
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`answer-${idx}`}
                          checked={mcq.answerIndex === optIdx}
                          onChange={() => updateMcq(idx, 'answerIndex', optIdx)}
                        />
                        <span className="text-xs">Correct</span>
                      </label>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Explanation (optional)"
                  value={mcq.explanation}
                  onChange={(e) => updateMcq(idx, 'explanation', e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* Short Answer Questions */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Short Answer Questions</h3>
              <button className="btn btn-sm btn-outline" onClick={addShortAnswer}>
                + Add
              </button>
            </div>
            {shortAnswers.map((sa, idx) => (
              <div key={idx} className="card bg-gray-50 p-4 space-y-3 rounded">
                <div className="flex justify-between">
                  <span className="font-semibold">Question {idx + 1}</span>
                  {shortAnswers.length > 1 && (
                    <button
                      className="btn btn-sm btn-outline text-red-600"
                      onClick={() => removeShortAnswer(idx)}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Question text"
                  value={sa.question}
                  onChange={(e) => updateShortAnswer(idx, 'question', e.target.value)}
                />
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Sample answer"
                  value={sa.sampleAnswer}
                  onChange={(e) => updateShortAnswer(idx, 'sampleAnswer', e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* Essay Questions */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Essay Questions</h3>
              <button className="btn btn-sm btn-outline" onClick={addEssay}>
                + Add
              </button>
            </div>
            {essays.map((essay, idx) => (
              <div key={idx} className="card bg-gray-50 p-4 space-y-3 rounded">
                <div className="flex justify-between">
                  <span className="font-semibold">Question {idx + 1}</span>
                  {essays.length > 1 && (
                    <button
                      className="btn btn-sm btn-outline text-red-600"
                      onClick={() => removeEssay(idx)}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Question text"
                  value={essay.question}
                  onChange={(e) => updateEssay(idx, 'question', e.target.value)}
                />
                <textarea
                  className="input w-full h-20"
                  placeholder="Guidance for grading"
                  value={essay.guidance}
                  onChange={(e) => updateEssay(idx, 'guidance', e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t pt-6">
            <button className="btn btn-primary" onClick={saveQuiz} disabled={saving}>
              {saving ? 'Saving...' : isEditMode ? 'Update Quiz' : 'Create Quiz'}
            </button>
            {isEditMode && (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={() => setConfirmOpen(true)}
                >
                  Export to Drive
                </button>
                <ConfirmModal
                  open={confirmOpen}
                  title="Export quiz to Google Drive"
                  message="This will export a copy of this quiz to your Google Drive. Proceed?"
                  confirmText="Export"
                  cancelText="Cancel"
                  onCancel={() => setConfirmOpen(false)}
                  onConfirm={async () => {
                    setConfirmOpen(false);
                    setExporting(true);
                    const token = localStorage.getItem('eztutor_token');
                    if (!token) { setError('Sign in to export'); setExporting(false); return; }
                    try {
                      const res = await fetch(`${process.env.REACT_APP_API_BASE || ''}/api/export-to-drive`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ contentType: 'quiz', contentId: id }),
                      });
                      const j = await res.json();
                      if (res.status === 401 && j.redirectUrl) { localStorage.setItem('pendingExport', JSON.stringify({ contentType: 'quiz', contentId: id })); window.location.href = j.redirectUrl; return; }
                      if (!j.success) throw new Error(j.error || 'Export failed');
                      if (j.googleDriveUrl) window.open(j.googleDriveUrl, '_blank');
                      addToast('Exported to Google Drive', 'success');
                    } catch (err) {
                      setError(err?.message || 'Export failed');
                    } finally { setExporting(false); }
                  }}
                />
                <LoadingSpinner open={exporting} message="Exporting to Google Drive..." />
              </>
            )}
            <button className="btn btn-outline" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

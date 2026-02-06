import React, { useState } from 'react';
import axios from 'axios';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../context/NotificationContext';

export default function LessonPlan() {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [lessonPlan, setLessonPlan] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { addToast } = useNotification();
  const [recentInputs] = useState([
    { subject: 'Math', topic: 'Fractions' },
    { subject: 'Science', topic: 'Photosynthesis' },
    { subject: 'History', topic: 'Civil Rights Movement' },
  ]);

  const generateLesson = async () => {
    setError('');
    setLessonPlan(null);
    setLoading(true);
    try {
      const res = await axios.post(
        '/api/generate-lesson',
        { subject, topic },
        {
          baseURL: process.env.REACT_APP_API_BASE || '',
        }
      );
      setLessonPlan(res.data.lessonPlan);
      await saveRecent('lesson', res.data.lessonPlan?.title || 'Lesson Plan', `${subject} • ${topic}`);
      addToast('Lesson plan generated and saved to recents.', 'success');
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        'Failed to generate lesson plan. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formatLessonPlanText = (plan) => {
    if (!plan) return '';
    const lines = [];
    lines.push(`${plan.title || 'Lesson Plan'}`);
    lines.push(`Subject: ${plan.subject || subject}`);
    lines.push(`Topic: ${plan.topic || topic}`);
    lines.push('');
    if (plan.objectives?.length) {
      lines.push('Objectives:');
      plan.objectives.forEach((o, i) => lines.push(`${i + 1}. ${o}`));
      lines.push('');
    }
    if (plan.keyPoints?.length) {
      lines.push('Key Points:');
      plan.keyPoints.forEach((k, i) => lines.push(`${i + 1}. ${k}`));
      lines.push('');
    }
    if (plan.activities?.length) {
      lines.push('Activities:');
      plan.activities.forEach((a, i) => lines.push(`${i + 1}. ${a}`));
      lines.push('');
    }
    if (plan.assessmentIdeas?.length) {
      lines.push('Assessment Ideas:');
      plan.assessmentIdeas.forEach((a, i) => lines.push(`${i + 1}. ${a}`));
      lines.push('');
    }
    if (plan.materials?.length) {
      lines.push('Materials:');
      plan.materials.forEach((m, i) => lines.push(`${i + 1}. ${m}`));
      lines.push('');
    }
    if (plan.differentiation?.length) {
      lines.push('Differentiation:');
      plan.differentiation.forEach((d, i) => lines.push(`${i + 1}. ${d}`));
    }
    return lines.join('\n').trim();
  };

  const handleCopy = async () => {
    if (!lessonPlan) return;
    try {
      await navigator.clipboard.writeText(formatLessonPlanText(lessonPlan));
      addToast('Lesson plan copied to clipboard.', 'success');
    } catch (err) {
      addToast('Failed to copy to clipboard.', 'error');
    }
  };

  const handleDownload = () => {
    if (!lessonPlan) return;
    const text = formatLessonPlanText(lessonPlan);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(lessonPlan?.topic || topic || 'lesson-plan').replace(/\s+/g, '_')}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    addToast('Lesson plan downloaded.', 'success');
  };

  const canSubmit = subject.trim() && topic.trim() && !loading;

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
        <h2 className="text-2xl font-bold">Lesson Plan Generator</h2>
        <div className="flex gap-2">
          <button className="btn btn-outline" onClick={() => setLessonPlan(null)}>
            Clear
          </button>
        </div>
      </div>
      <p className="text-gray-600">
        Provide a subject and topic to generate a structured plan with objectives, key points,
        and suggested activities.
      </p>
      <div className="flex flex-wrap gap-2">
        {recentInputs.map((item) => (
          <button
            key={`${item.subject}-${item.topic}`}
            className="pill"
            onClick={() => {
              setSubject(item.subject);
              setTopic(item.topic);
            }}
          >
            {item.subject} • {item.topic}
          </button>
        ))}
      </div>
      <input 
        className="input w-full"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <input 
        className="input w-full"
        placeholder="Topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <button 
          className="btn btn-primary disabled:opacity-50"
          onClick={generateLesson}
          disabled={!canSubmit}
        >
          {loading ? 'Generating...' : 'Generate Plan'}
        </button>
        <button className="btn btn-outline" onClick={handleCopy} disabled={!lessonPlan}>
          Copy
        </button>
        <button className="btn btn-outline" onClick={handleDownload} disabled={!lessonPlan}>
          Download
        </button>
        <button className="btn btn-secondary" onClick={() => setConfirmOpen(true)} disabled={!lessonPlan}>
          Export to Google Drive
        </button>
        <ConfirmModal
          open={confirmOpen}
          title="Export lesson plan to Google Drive"
          message="This will save the lesson to your library and export a copy to your Google Drive. Proceed?"
          confirmText="Export"
          cancelText="Cancel"
          onCancel={() => setConfirmOpen(false)}
          onConfirm={async () => {
            setConfirmOpen(false);
            setExporting(true);
            const token = localStorage.getItem('eztutor_token');
            if (!token) {
              setError('Please sign in to save and export.');
              setExporting(false);
              return;
            }
            try {
              const res = await fetch(`${process.env.REACT_APP_API_BASE || ''}/api/lesson-plans`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ title: lessonPlan.title || `${subject} - ${topic}`, description: lessonPlan.description || '', content: { ...lessonPlan, subject, topic } }),
              });
              if (res.status === 401) throw new Error('Authentication required to save content.');
              const saved = await res.json();
              if (!saved || !saved.id) throw new Error('Failed to save lesson before export.');
              const ex = await fetch(`${process.env.REACT_APP_API_BASE || ''}/api/export-to-drive`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ contentType: 'lesson', contentId: saved.id }),
              });
              const exJson = await ex.json();
              if (ex.status === 401 && exJson && exJson.redirectUrl) {
                localStorage.setItem('pendingExport', JSON.stringify({ contentType: 'lesson', contentId: saved.id }));
                window.location.href = exJson.redirectUrl;
                return;
              }
              if (!exJson || !exJson.success) throw new Error(exJson?.error || 'Export failed');
              addToast('Exported to Google Drive successfully!', 'success');
              if (exJson.googleDriveUrl) window.open(exJson.googleDriveUrl, '_blank');
            } catch (err) {
              setError(err?.message || 'Export failed.');
              addToast(err?.message || 'Export failed.', 'error');
            } finally {
              setExporting(false);
            }
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

      {lessonPlan && (
        <div className="mt-6 p-6 card space-y-4 fade-in">
          <div>
            <div className="text-xl font-semibold">{lessonPlan.title || 'Lesson Plan'}</div>
            <div className="text-gray-700">
              {lessonPlan.subject || subject} • {lessonPlan.topic || topic}
            </div>
          </div>

          {lessonPlan.objectives?.length > 0 && (
            <div>
              <div className="font-semibold">Objectives</div>
              <ul className="list-disc pl-6">
                {lessonPlan.objectives.map((o, i) => (
                  <li key={i}>{String(o)}</li>
                ))}
              </ul>
            </div>
          )}

          {lessonPlan.keyPoints?.length > 0 && (
            <div>
              <div className="font-semibold">Key Points</div>
              <ul className="list-disc pl-6">
                {lessonPlan.keyPoints.map((k, i) => (
                  <li key={i}>{String(k)}</li>
                ))}
              </ul>
            </div>
          )}

          {lessonPlan.activities?.length > 0 && (
            <div>
              <div className="font-semibold">Suggested Activities</div>
              <ul className="list-disc pl-6">
                {lessonPlan.activities.map((a, i) => (
                  <li key={i}>{String(a)}</li>
                ))}
              </ul>
            </div>
          )}

          {lessonPlan.assessmentIdeas?.length > 0 && (
            <div>
              <div className="font-semibold">Assessment Ideas</div>
              <ul className="list-disc pl-6">
                {lessonPlan.assessmentIdeas.map((a, i) => (
                  <li key={i}>{String(a)}</li>
                ))}
              </ul>
            </div>
          )}

          {lessonPlan.materials?.length > 0 && (
            <div>
              <div className="font-semibold">Materials</div>
              <ul className="list-disc pl-6">
                {lessonPlan.materials.map((m, i) => (
                  <li key={i}>{String(m)}</li>
                ))}
              </ul>
            </div>
          )}

          {lessonPlan.differentiation?.length > 0 && (
            <div>
              <div className="font-semibold">Differentiation</div>
              <ul className="list-disc pl-6">
                {lessonPlan.differentiation.map((d, i) => (
                  <li key={i}>{String(d)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {!loading && !lessonPlan && !error && (
        <div className="mt-6 text-gray-600">Generate a lesson plan to see results here.</div>
      )}
      {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  );
}

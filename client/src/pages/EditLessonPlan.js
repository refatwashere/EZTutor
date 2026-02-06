import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../context/NotificationContext';

export default function EditLessonPlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lessonPlan, setLessonPlan] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [objectives, setObjectives] = useState(['']);
  const [keyPoints, setKeyPoints] = useState(['']);
  const [activities, setActivities] = useState(['']);
  const [assessmentIdeas, setAssessmentIdeas] = useState(['']);
  const [materials, setMaterials] = useState(['']);
  const [differentiation, setDifferentiation] = useState(['']);
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
      loadLessonPlan();
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadLessonPlan = async () => {
    try {
      const res = await axios.get(`/api/lesson-plans/${id}`, {
        baseURL: process.env.REACT_APP_API_BASE || '',
        headers: { Authorization: `Bearer ${token}` },
      });

      const lp = res.data.lessonPlan;
      setLessonPlan(lp);
      setTitle(lp.title);
      setDescription(lp.description || '');
      setSubject(lp.subject);
      setTopic(lp.topic);
      setObjectives(lp.content?.objectives || ['']);
      setKeyPoints(lp.content?.keyPoints || ['']);
      setActivities(lp.content?.activities || ['']);
      setAssessmentIdeas(lp.content?.assessmentIdeas || ['']);
      setMaterials(lp.content?.materials || ['']);
      setDifferentiation(lp.content?.differentiation || ['']);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load lesson plan');
    } finally {
      setLoading(false);
    }
  };

  const handleArrayChange = (index, value, arrayName) => {
    const updates = {
      objectives: () => {
        const u = [...objectives];
        u[index] = value;
        setObjectives(u);
      },
      keyPoints: () => {
        const u = [...keyPoints];
        u[index] = value;
        setKeyPoints(u);
      },
      activities: () => {
        const u = [...activities];
        u[index] = value;
        setActivities(u);
      },
      assessmentIdeas: () => {
        const u = [...assessmentIdeas];
        u[index] = value;
        setAssessmentIdeas(u);
      },
      materials: () => {
        const u = [...materials];
        u[index] = value;
        setMaterials(u);
      },
      differentiation: () => {
        const u = [...differentiation];
        u[index] = value;
        setDifferentiation(u);
      },
    };
    updates[arrayName]?.();
  };

  const addArrayItem = (arrayName) => {
    const updates = {
      objectives: () => setObjectives([...objectives, '']),
      keyPoints: () => setKeyPoints([...keyPoints, '']),
      activities: () => setActivities([...activities, '']),
      assessmentIdeas: () => setAssessmentIdeas([...assessmentIdeas, '']),
      materials: () => setMaterials([...materials, '']),
      differentiation: () => setDifferentiation([...differentiation, '']),
    };
    updates[arrayName]?.();
  };

  const removeArrayItem = (index, arrayName) => {
    const updates = {
      objectives: () => setObjectives(objectives.filter((_, i) => i !== index)),
      keyPoints: () => setKeyPoints(keyPoints.filter((_, i) => i !== index)),
      activities: () => setActivities(activities.filter((_, i) => i !== index)),
      assessmentIdeas: () => setAssessmentIdeas(assessmentIdeas.filter((_, i) => i !== index)),
      materials: () => setMaterials(materials.filter((_, i) => i !== index)),
      differentiation: () => setDifferentiation(differentiation.filter((_, i) => i !== index)),
    };
    updates[arrayName]?.();
  };

  const saveLessonPlan = async () => {
    if (!title || !subject || !topic) {
      setError('Title, subject, and topic are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const content = {
        objectives: objectives.filter((o) => o.trim()),
        keyPoints: keyPoints.filter((k) => k.trim()),
        activities: activities.filter((a) => a.trim()),
        assessmentIdeas: assessmentIdeas.filter((a) => a.trim()),
        materials: materials.filter((m) => m.trim()),
        differentiation: differentiation.filter((d) => d.trim()),
      };

      if (isEditMode) {
        await axios.put(
          `/api/lesson-plans/${id}`,
          { title, description, subject, topic, content },
          {
            baseURL: process.env.REACT_APP_API_BASE || '',
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(
          '/api/lesson-plans',
          { title, description, subject, topic, content },
          {
            baseURL: process.env.REACT_APP_API_BASE || '',
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      addToast(`Lesson plan ${isEditMode ? 'updated' : 'created'} successfully!`, 'success');
      setTimeout(() => navigate('/my-lessons'), 1500);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save lesson plan');
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
          <h1 className="text-4xl font-bold">{isEditMode ? 'Edit' : 'Create'} Lesson Plan</h1>
          <p className="text-gray-600">
            {isEditMode ? 'Update your existing lesson plan' : 'Create a new lesson plan from scratch'}
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {toast && <div className="alert alert-success">{toast}</div>}

        <div className="card section-card space-y-6">
          {/* Basic Info (same as CustomLessonPlan) */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Lesson Details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Title *</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g., Introduction to Fractions"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Subject *</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g., Math"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
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
          </div>

          {/* Objectives */}
          <div className="space-y-3 border-t pt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Learning Objectives</h3>
              <button className="btn btn-sm btn-outline" onClick={() => addArrayItem('objectives')}>
                + Add
              </button>
            </div>
            {objectives.map((obj, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  className="input w-full"
                  placeholder={`Objective ${idx + 1}`}
                  value={obj}
                  onChange={(e) => handleArrayChange(idx, e.target.value, 'objectives')}
                />
                {objectives.length > 1 && (
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => removeArrayItem(idx, 'objectives')}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Key Points */}
          <div className="space-y-3 border-t pt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Key Points</h3>
              <button className="btn btn-sm btn-outline" onClick={() => addArrayItem('keyPoints')}>
                + Add
              </button>
            </div>
            {keyPoints.map((kp, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  className="input w-full"
                  placeholder={`Key point ${idx + 1}`}
                  value={kp}
                  onChange={(e) => handleArrayChange(idx, e.target.value, 'keyPoints')}
                />
                {keyPoints.length > 1 && (
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => removeArrayItem(idx, 'keyPoints')}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Activities */}
          <div className="space-y-3 border-t pt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Activities</h3>
              <button className="btn btn-sm btn-outline" onClick={() => addArrayItem('activities')}>
                + Add
              </button>
            </div>
            {activities.map((act, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  className="input w-full"
                  placeholder={`Activity ${idx + 1}`}
                  value={act}
                  onChange={(e) => handleArrayChange(idx, e.target.value, 'activities')}
                />
                {activities.length > 1 && (
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => removeArrayItem(idx, 'activities')}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Assessment Ideas */}
          <div className="space-y-3 border-t pt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Assessment Ideas</h3>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => addArrayItem('assessmentIdeas')}
              >
                + Add
              </button>
            </div>
            {assessmentIdeas.map((ai, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  className="input w-full"
                  placeholder={`Assessment idea ${idx + 1}`}
                  value={ai}
                  onChange={(e) => handleArrayChange(idx, e.target.value, 'assessmentIdeas')}
                />
                {assessmentIdeas.length > 1 && (
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => removeArrayItem(idx, 'assessmentIdeas')}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Materials */}
          <div className="space-y-3 border-t pt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Materials</h3>
              <button className="btn btn-sm btn-outline" onClick={() => addArrayItem('materials')}>
                + Add
              </button>
            </div>
            {materials.map((mat, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  className="input w-full"
                  placeholder={`Material ${idx + 1}`}
                  value={mat}
                  onChange={(e) => handleArrayChange(idx, e.target.value, 'materials')}
                />
                {materials.length > 1 && (
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => removeArrayItem(idx, 'materials')}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Differentiation */}
          <div className="space-y-3 border-t pt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Differentiation Strategies</h3>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => addArrayItem('differentiation')}
              >
                + Add
              </button>
            </div>
            {differentiation.map((diff, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  className="input w-full"
                  placeholder={`Differentiation strategy ${idx + 1}`}
                  value={diff}
                  onChange={(e) => handleArrayChange(idx, e.target.value, 'differentiation')}
                />
                {differentiation.length > 1 && (
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => removeArrayItem(idx, 'differentiation')}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t pt-6">
            <button className="btn btn-primary" onClick={saveLessonPlan} disabled={saving}>
              {saving ? 'Saving...' : isEditMode ? 'Update Lesson Plan' : 'Create Lesson Plan'}
            </button>
            {isEditMode && (
              <button
                  className="btn btn-secondary"
                  onClick={() => setConfirmOpen(true)}
                >
                  Export to Drive
                </button>
              <ConfirmModal
                open={confirmOpen}
                title="Export lesson to Google Drive"
                message="This will export a copy of this lesson to your Google Drive. Proceed?"
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
                      body: JSON.stringify({ contentType: 'lesson', contentId: id }),
                    });
                    const j = await res.json();
                    if (res.status === 401 && j.redirectUrl) { localStorage.setItem('pendingExport', JSON.stringify({ contentType: 'lesson', contentId: id })); window.location.href = j.redirectUrl; return; }
                    if (!j.success) throw new Error(j.error || 'Export failed');
                    if (j.googleDriveUrl) window.open(j.googleDriveUrl, '_blank');
                    addToast('Exported to Google Drive', 'success');
                  } catch (err) {
                    setError(err?.message || 'Export failed');
                  } finally { setExporting(false); }
                }}
              />
              <LoadingSpinner open={exporting} message="Exporting to Google Drive..." />
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';

export default function CustomLessonPlan() {
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(false);
  const { addToast } = useNotification();

  const token = localStorage.getItem('eztutor_token');

  const handleArrayChange = (index, value, arrayName) => {
    const array = {
      objectives,
      keyPoints,
      activities,
      assessmentIdeas,
      materials,
      differentiation,
    }[arrayName];
    const updated = [...array];
    updated[index] = value;
    if (arrayName === 'objectives') setObjectives(updated);
    else if (arrayName === 'keyPoints') setKeyPoints(updated);
    else if (arrayName === 'activities') setActivities(updated);
    else if (arrayName === 'assessmentIdeas') setAssessmentIdeas(updated);
    else if (arrayName === 'materials') setMaterials(updated);
    else if (arrayName === 'differentiation') setDifferentiation(updated);
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

    setError('');
    setLoading(true);

    try {
      const content = {
        objectives: objectives.filter((o) => o.trim()),
        keyPoints: keyPoints.filter((k) => k.trim()),
        activities: activities.filter((a) => a.trim()),
        assessmentIdeas: assessmentIdeas.filter((a) => a.trim()),
        materials: materials.filter((m) => m.trim()),
        differentiation: differentiation.filter((d) => d.trim()),
      };

      const res = await axios.post(
        '/api/lesson-plans',
        { title, description, subject, topic, content },
        {
          baseURL: process.env.REACT_APP_API_BASE || '',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      addToast('Lesson plan saved successfully!', 'success');
      setTimeout(() => navigate('/my-lessons'), 1500);
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || 'Failed to save lesson plan';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <div className="container space-y-8 fade-in">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Create Custom Lesson Plan</h1>
          <p className="text-gray-600">Build a lesson plan from scratch with your own content.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card section-card space-y-6">
          {/* Basic Info */}
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
                  <button className="btn btn-sm btn-outline" onClick={() => removeArrayItem(idx, 'objectives')}>
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
                  <button className="btn btn-sm btn-outline" onClick={() => removeArrayItem(idx, 'keyPoints')}>
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
                  <button className="btn btn-sm btn-outline" onClick={() => removeArrayItem(idx, 'activities')}>
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
              <button className="btn btn-sm btn-outline" onClick={() => addArrayItem('assessmentIdeas')}>
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
                  <button className="btn btn-sm btn-outline" onClick={() => removeArrayItem(idx, 'assessmentIdeas')}>
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
                  <button className="btn btn-sm btn-outline" onClick={() => removeArrayItem(idx, 'materials')}>
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
              <button className="btn btn-sm btn-outline" onClick={() => addArrayItem('differentiation')}>
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
                  <button className="btn btn-sm btn-outline" onClick={() => removeArrayItem(idx, 'differentiation')}>
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t pt-6">
            <button className="btn btn-primary" onClick={saveLessonPlan} disabled={loading}>
              {loading ? 'Saving...' : 'Save Lesson Plan'}
            </button>
            <button className="btn btn-outline" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

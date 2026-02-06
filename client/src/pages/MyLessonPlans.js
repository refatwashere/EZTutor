import React, { useEffect, useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MyLessonPlans() {
  const navigate = useNavigate();
  const [lessonPlans, setLessonPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toExportId, setToExportId] = useState(null);

  const token = localStorage.getItem('eztutor_token');

  const { addToast } = useNotification();

  useEffect(() => {
    loadLessonPlans();
  }, []);

  const loadLessonPlans = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/lesson-plans', {
        baseURL: process.env.REACT_APP_API_BASE || '',
        headers: { Authorization: `Bearer ${token}` },
      });
      setLessonPlans(res.data.lessonPlans || []);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load lesson plans');
    } finally {
      setLoading(false);
    }
  };

  const deleteLessonPlan = async (id) => {
    try {
      await axios.delete(`/api/lesson-plans/${id}`, {
        baseURL: process.env.REACT_APP_API_BASE || '',
        headers: { Authorization: `Bearer ${token}` },
      });
      setLessonPlans(lessonPlans.filter((lp) => lp.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete lesson plan');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <main className="page">
      <div className="container space-y-8 fade-in">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">My Lesson Plans</h1>
            <p className="text-gray-600">View and manage your saved lesson plans</p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={() => navigate('/lesson')}>
              Generate with AI
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/custom-lesson')}>
              Create Custom
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="card section-card text-center py-12">
            <p className="text-gray-500">Loading lesson plans...</p>
          </div>
        ) : lessonPlans.length === 0 ? (
          <div className="card section-card text-center py-12 space-y-4">
            <p className="text-gray-600 text-lg">No lesson plans yet</p>
            <div className="flex gap-2 justify-center">
              <button className="btn btn-secondary" onClick={() => navigate('/lesson')}>
                Generate with AI
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/custom-lesson')}>
                Create Custom
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lessonPlans.map((lp) => (
              <div key={lp.id} className="card section-card space-y-4 cursor-pointer hover:shadow-lg transition">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold line-clamp-2">{lp.title}</h3>
                  <p className="text-sm text-gray-600">
                    {lp.subject} • {lp.topic}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {lp.is_custom ? '✏️ Custom' : '🤖 AI Generated'} • {formatDate(lp.created_at)}
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <button
                    className="btn btn-sm btn-primary flex-1"
                    onClick={() => navigate(`/lesson-plans/${lp.id}`)}
                  >
                    View
                  </button>
                  <button
                    className="btn btn-sm btn-secondary flex-1"
                    onClick={() => { setToExportId(lp.id); setConfirmOpen(true); }}
                  >
                    Export
                  </button>
                  <button
                    className="btn btn-sm btn-outline flex-1"
                    onClick={() => navigate(`/lesson-plans/${lp.id}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline text-red-600"
                    onClick={() => setDeleteConfirm(lp.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Export Confirmation + Spinner */}
        <ConfirmModal
          open={confirmOpen}
          title="Export lesson to Google Drive"
          message="This will export a copy of this lesson to your Google Drive. Proceed?"
          confirmText="Export"
          cancelText="Cancel"
          onCancel={() => { setConfirmOpen(false); setToExportId(null); }}
          onConfirm={async () => {
            setConfirmOpen(false);
            setExporting(true);
            const token = localStorage.getItem('eztutor_token');
            if (!token) { setError('Sign in to export'); setExporting(false); setToExportId(null); return; }
            try {
              const res = await fetch(`${process.env.REACT_APP_API_BASE || ''}/api/export-to-drive`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ contentType: 'lesson', contentId: toExportId }),
              });
              const j = await res.json();
              if (res.status === 401 && j.redirectUrl) {
                localStorage.setItem('pendingExport', JSON.stringify({ contentType: 'lesson', contentId: toExportId }));
                window.location.href = j.redirectUrl;
                return;
              }
              if (!j.success) throw new Error(j.error || 'Export failed');
              if (!j.success) throw new Error(j.error || 'Export failed');
              if (j.googleDriveUrl) window.open(j.googleDriveUrl, '_blank');
              // show toast via global notification system
              addToast('Exported to Google Drive', 'success');
            } catch (err) {
              setError(err?.message || 'Export failed');
            } finally { setExporting(false); setToExportId(null); }
          }}
        />
        <LoadingSpinner open={exporting} message="Exporting to Google Drive..." />

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="card section-card space-y-4 max-w-sm">
              <h2 className="text-xl font-semibold">Delete Lesson Plan?</h2>
              <p className="text-gray-600">This action cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  className="btn btn-error flex-1"
                  onClick={() => deleteLessonPlan(deleteConfirm)}
                >
                  Delete
                </button>
                <button className="btn btn-outline flex-1" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

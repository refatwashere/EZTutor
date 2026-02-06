import React, { useEffect, useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MyQuizzes() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toExportId, setToExportId] = useState(null);

  const token = localStorage.getItem('eztutor_token');
  const { addToast } = useNotification();

  const loadQuizzes = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/quizzes', {
        baseURL: process.env.REACT_APP_API_BASE || '',
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuizzes(res.data.quizzes || []);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load quizzes');
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  const deleteQuiz = async (id) => {
    try {
      await axios.delete(`/api/quizzes/${id}`, {
        baseURL: process.env.REACT_APP_API_BASE || '',
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuizzes(quizzes.filter((q) => q.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete quiz');
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
            <h1 className="text-4xl font-bold">My Quizzes</h1>
            <p className="text-gray-600">View and manage your saved quizzes</p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={() => navigate('/quiz')}>
              Generate with AI
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/custom-quiz')}>
              Create Custom
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="card section-card text-center py-12">
            <p className="text-gray-500">Loading quizzes...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="card section-card text-center py-12 space-y-4">
            <p className="text-gray-600 text-lg">No quizzes yet</p>
            <div className="flex gap-2 justify-center">
              <button className="btn btn-secondary" onClick={() => navigate('/quiz')}>
                Generate with AI
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/custom-quiz')}>
                Create Custom
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((q) => (
              <div key={q.id} className="card section-card space-y-4 cursor-pointer hover:shadow-lg transition">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold line-clamp-2">{q.title}</h3>
                  <p className="text-sm text-gray-600">{q.topic}</p>
                </div>
                <div className="flex gap-2 text-xs text-gray-500">
                  <span>{q.difficulty ? `📊 ${q.difficulty}` : 'No difficulty'}</span>
                  {q.grade_level && <span>📚 {q.grade_level}</span>}
                </div>
                <div className="text-xs text-gray-500">
                  {q.is_custom ? '✏️ Custom' : '🤖 AI Generated'} • {formatDate(q.created_at)}
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <button
                    className="btn btn-sm btn-primary flex-1"
                    onClick={() => navigate(`/quizzes/${q.id}`)}
                  >
                    View
                  </button>
                  <button
                    className="btn btn-sm btn-secondary flex-1"
                    onClick={() => { setToExportId(q.id); setConfirmOpen(true); }}
                  >
                    Export
                  </button>
                  <button
                    className="btn btn-sm btn-outline flex-1"
                    onClick={() => navigate(`/quizzes/${q.id}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline text-red-600"
                    onClick={() => setDeleteConfirm(q.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <ConfirmModal
          open={confirmOpen}
          title="Export quiz to Google Drive"
          message="This will export a copy of this quiz to your Google Drive. Proceed?"
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
                body: JSON.stringify({ contentType: 'quiz', contentId: toExportId }),
              });
              const j = await res.json();
                      if (res.status === 401 && j.redirectUrl) { 
                        localStorage.setItem('pendingExport', JSON.stringify({ contentType: 'quiz', contentId: toExportId }));
                        window.location.href = j.redirectUrl; return; }
              if (!j.success) throw new Error(j.error || 'Export failed');
              if (j.googleDriveUrl) window.open(j.googleDriveUrl, '_blank');
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
              <h2 className="text-xl font-semibold">Delete Quiz?</h2>
              <p className="text-gray-600">This action cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  className="btn btn-error flex-1"
                  onClick={() => deleteQuiz(deleteConfirm)}
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

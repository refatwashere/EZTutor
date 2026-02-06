import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const [recent, setRecent] = useState([]);
  const { addToast } = useNotification();
  const { user } = useOutletContext() || {};
  const [quizPrefs, setQuizPrefs] = useState({
    gradeLevel: 'Grade 7',
    numQuestions: 10,
    weightPreset: 'balanced',
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('eztutor_quiz_prefs');
      if (!stored) return;
      const prefs = JSON.parse(stored);
      setQuizPrefs((prev) => ({
        ...prev,
        ...prefs,
      }));
    } catch (err) {
      // ignore malformed prefs
    }
  }, []);

  useEffect(() => {
    const loadRecents = async () => {
      if (!user) return setRecent([]);
      const token = localStorage.getItem('eztutor_token');
      if (!token) return setRecent([]);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE || ''}/api/recents`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setRecent(data.recents || []);
      } catch (err) {
        setRecent([]);
      }
    };
    loadRecents();
  }, [user]);

  return (
    <main className="page">
      <div className="container-wide space-y-10 fade-in">
        <div className="section space-y-4">
          <div className="flex flex-wrap items-center gap-6 justify-between">
            <div className="space-y-3 max-w-xl">
              <h1 className="text-5xl font-bold">Teaching, streamlined.</h1>
              <p className="text-gray-700">
                Plan lessons, generate assessments, and organize resources in a single,
                teacher-first workspace.
              </p>
              <div className="flex flex-wrap gap-2">
                <button className="btn btn-primary" onClick={() => navigate('/lesson')}>
                  Start a Lesson Plan
                </button>
                <button className="btn btn-outline" onClick={() => navigate('/quiz')}>
                  Create a Quiz
                </button>
              </div>
              <div className="flex gap-2">
                <span className="pill">Fast setup</span>
                <span className="pill">Classroom-ready</span>
                <span className="pill">Shareable</span>
              </div>
            </div>
            <div className="card section-card space-y-3 max-w-sm">
              <div className="text-sm text-gray-500">Today’s focus</div>
              <div className="text-lg font-semibold">Create a 40‑minute lesson plan</div>
              <div className="text-sm text-gray-600">
                Input subject and topic to get objectives, key points, and activities.
              </div>
              <button className="btn btn-warm" onClick={() => navigate('/lesson')}>
                Build lesson
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 stagger">
          <button
            className="card section-card text-left btn-primary"
            onClick={() => navigate('/lesson')}
          >
            <div className="text-lg font-semibold">Lesson Planner</div>
            <div className="text-sm text-blue-100">
              Structured objectives, key points, activities, and differentiation.
            </div>
            <div className="mt-3 text-xs text-blue-100">Suggested: Math • Fractions</div>
          </button>
          <button
            className="card section-card text-left btn-secondary"
            onClick={() => navigate('/quiz')}
          >
            <div className="text-lg font-semibold">Quiz Builder</div>
            <div className="text-sm text-green-100">
              MCQ, short answer, and essay items with answer keys.
            </div>
            <div className="mt-3 text-xs text-green-100">Suggested: History • Renaissance</div>
          </button>
          <button
            className="card section-card text-left btn-accent"
            onClick={() => navigate('/resources')}
          >
            <div className="text-lg font-semibold">Resource Hub</div>
            <div className="text-sm text-purple-100">
              Upload and tag resources for fast classroom retrieval.
            </div>
            <div className="mt-3 text-xs text-purple-100">Suggested: Slides • Unit 3</div>
          </button>
        </div>

        {/* Custom Content Section */}
        <div className="border-t pt-10">
          <h2 className="text-2xl font-bold mb-4">Your Content</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <button
              className="card section-card text-left space-y-2 hover:shadow-lg transition"
              onClick={() => navigate('/my-lessons')}
            >
              <div className="text-lg font-semibold">My Lesson Plans</div>
              <div className="text-sm text-gray-600">View and edit all your saved lesson plans</div>
              <div className="text-xs text-gray-500">📚 View all</div>
            </button>
            <button
              className="card section-card text-left space-y-2 hover:shadow-lg transition"
              onClick={() => navigate('/custom-lesson')}
            >
              <div className="text-lg font-semibold">Create Lesson from Scratch</div>
              <div className="text-sm text-gray-600">Build a custom lesson plan with full control</div>
              <div className="text-xs text-gray-500">✏️ Create new</div>
            </button>
            <button
              className="card section-card text-left space-y-2 hover:shadow-lg transition"
              onClick={() => navigate('/my-quizzes')}
            >
              <div className="text-lg font-semibold">My Quizzes</div>
              <div className="text-sm text-gray-600">View and edit all your saved quizzes</div>
              <div className="text-xs text-gray-500">📝 View all</div>
            </button>
            <button
              className="card section-card text-left space-y-2 hover:shadow-lg transition"
              onClick={() => navigate('/custom-quiz')}
            >
              <div className="text-lg font-semibold">Create Quiz from Scratch</div>
              <div className="text-sm text-gray-600">Build a custom quiz with full editing</div>
              <div className="text-xs text-gray-500">✏️ Create new</div>
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="card section-card space-y-3">
            <div className="text-sm text-gray-500">How it works</div>
            <ol className="list-decimal pl-6 text-gray-700 space-y-2">
              <li>Describe your subject and topic.</li>
              <li>Generate structured content in seconds.</li>
              <li>Copy, download, or share with your class.</li>
            </ol>
          </div>
          <div className="card section-card space-y-3">
            <div className="text-sm text-gray-500">Get started</div>
            <div className="text-gray-700">Try one of these quick starts:</div>
            <div className="flex flex-wrap gap-2">
              <button className="pill" onClick={() => navigate('/lesson')}>
                Math • Fractions
              </button>
              <button className="pill" onClick={() => navigate('/lesson')}>
                Science • Photosynthesis
              </button>
              <button className="pill" onClick={() => navigate('/quiz')}>
                History • Renaissance
              </button>
            </div>
          </div>
          <div className="card section-card space-y-3">
            <div className="text-sm text-gray-500">Designed for clarity</div>
            <div className="text-gray-700">
              Every output is sectioned and ready to use. Save time without sacrificing
              instructional quality.
            </div>
          </div>
          <div className="card section-card space-y-3">
            <div className="text-sm text-gray-500">Quiz settings</div>
            <input
              className="input w-full"
              placeholder="Grade level"
              value={quizPrefs.gradeLevel}
              onChange={(e) =>
                setQuizPrefs((prev) => ({ ...prev, gradeLevel: e.target.value }))
              }
            />
            <input
              className="input w-full"
              type="number"
              min="5"
              max="25"
              value={quizPrefs.numQuestions}
              onChange={(e) =>
                setQuizPrefs((prev) => ({ ...prev, numQuestions: e.target.value }))
              }
            />
            <select
              className="input w-full"
              value={quizPrefs.weightPreset}
              onChange={(e) =>
                setQuizPrefs((prev) => ({ ...prev, weightPreset: e.target.value }))
              }
            >
              <option value="balanced">Balanced mix</option>
              <option value="mcqHeavy">More multiple choice</option>
              <option value="writingHeavy">More writing</option>
            </select>
            <button
              className="btn btn-outline"
              onClick={() => {
                  localStorage.setItem('eztutor_quiz_prefs', JSON.stringify(quizPrefs));
                  addToast('Quiz settings saved.', 'success');
                  navigate('/quiz');
                }}
            >
              Use in Quiz
            </button>
            <button
              className="btn btn-outline"
              onClick={() => {
                const defaults = {
                  gradeLevel: 'Grade 7',
                  numQuestions: 10,
                  weightPreset: 'balanced',
                };
                setQuizPrefs(defaults);
                localStorage.removeItem('eztutor_quiz_prefs');
                addToast('Quiz settings reset.', 'success');
              }}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="card section-card space-y-3">
          <div className="text-sm text-gray-500">Recent outputs</div>
          {!user ? (
            <div className="text-gray-600">Sign in to save and view your recent outputs.</div>
          ) : recent.length === 0 ? (
            <div className="text-gray-600">
              No recent items yet. Generate a lesson or quiz to see it here.
            </div>
          ) : (
            <ul className="space-y-2">
              {recent.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold">{item.title}</div>
                    <div className="text-sm text-gray-600">{item.subtitle}</div>
                  </div>
                  <button
                    className="btn btn-outline"
                    onClick={() => navigate(item.type === 'lesson' ? '/lesson' : '/quiz')}
                  >
                    Open
                  </button>
                </li>
              ))}
            </ul>
          )}
          {user && recent.length > 0 && (
            <button
              className="btn btn-outline"
              onClick={async () => {
                const token = localStorage.getItem('eztutor_token');
                if (!token) return;
                await fetch(`${process.env.REACT_APP_API_BASE || ''}/api/recents`, {
                  method: 'DELETE',
                  headers: { Authorization: `Bearer ${token}` },
                });
                setRecent([]);
                addToast('Recents cleared.', 'success');
              }}
            >
              Clear Recents
            </button>
          )}
        </div>
      </div>
    
    </main>
  );
}

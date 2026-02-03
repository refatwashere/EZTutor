import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('eztutor_recent_outputs');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecent(parsed);
        }
      } catch (err) {
        setRecent([]);
      }
    }
  }, []);

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

        <div className="grid gap-4 md:grid-cols-2">
          <div className="card section-card space-y-3">
            <div className="text-sm text-gray-500">How it works</div>
            <ol className="list-decimal pl-6 text-gray-700 space-y-2">
              <li>Describe your subject and topic.</li>
              <li>Generate structured content in seconds.</li>
              <li>Copy, download, or share with your class.</li>
            </ol>
          </div>
          <div className="card section-card space-y-3">
            <div className="text-sm text-gray-500">Designed for clarity</div>
            <div className="text-gray-700">
              Every output is sectioned and ready to use. Save time without sacrificing
              instructional quality.
            </div>
          </div>
        </div>

        <div className="card section-card space-y-3">
          <div className="text-sm text-gray-500">Recent outputs</div>
          {recent.length === 0 ? (
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
        </div>
      </div>
    </main>
  );
}

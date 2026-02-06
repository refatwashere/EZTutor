import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LessonPlan from './pages/LessonPlan';
import QuizGenerator from './pages/QuizGenerator';
import ResourceHub from './pages/ResourceHub';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Support from './pages/Support';
import Terms from './pages/Terms';
import CookiePolicy from './pages/CookiePolicy';
import Contact from './pages/Contact';
import CustomLessonPlan from './pages/CustomLessonPlan';
import CustomQuiz from './pages/CustomQuiz';
import MyLessonPlans from './pages/MyLessonPlans';
import MyQuizzes from './pages/MyQuizzes';
import EditLessonPlan from './pages/EditLessonPlan';
import EditQuiz from './pages/EditQuiz';
import AppLayout from './components/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { Toast } from './components/Toast';

function AppContent() {
  const { addToast } = useNotification();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('google_connected')) {
      const pending = localStorage.getItem('pendingExport');
      if (pending) {
        (async () => {
          try {
            const p = JSON.parse(pending);
            const token = localStorage.getItem('eztutor_token');
            if (!token) {
              addToast('Connected to Google. Please sign in to complete pending export.', 'warning');
              localStorage.removeItem('pendingExport');
              return;
            }
            const res = await fetch(`${process.env.REACT_APP_API_BASE || ''}/api/export-to-drive`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify(p),
            });
            const j = await res.json();
            if (res.status === 401 && j.redirectUrl) {
              // still not authorized; redirect again
              window.location.href = j.redirectUrl;
              return;
            }
            if (!j || !j.success) {
              addToast('Pending export failed: ' + (j?.error || 'Unknown'), 'error');
            } else {
              addToast('Export completed — opening Drive link.', 'success');
              if (j.googleDriveUrl) window.open(j.googleDriveUrl, '_blank');
            }
          } catch (err) {
            console.error('Failed to resume pending export', err);
            addToast('Error resuming pending export', 'error');
          } finally {
            localStorage.removeItem('pendingExport');
            // remove query param from URL
            const url = new URL(window.location.href);
            url.searchParams.delete('google_connected');
            window.history.replaceState({}, document.title, url.toString());
          }
        })();
      }
    }
  }, [addToast]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="lesson" element={<LessonPlan />} />
          <Route path="quiz" element={<QuizGenerator />} />
          <Route path="resources" element={<ResourceHub />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="support" element={<Support />} />
          <Route path="terms" element={<Terms />} />
          <Route path="cookies" element={<CookiePolicy />} />
          <Route path="contact" element={<Contact />} />
          {/* Custom Content Creation */}
          <Route path="custom-lesson" element={<CustomLessonPlan />} />
          <Route path="custom-quiz" element={<CustomQuiz />} />
          {/* Saved Content Management */}
          <Route path="my-lessons" element={<MyLessonPlans />} />
          <Route path="my-quizzes" element={<MyQuizzes />} />
          {/* Edit/View */}
          <Route path="lesson-plans/:id" element={<EditLessonPlan />} />
          <Route path="lesson-plans/:id/edit" element={<EditLessonPlan />} />
          <Route path="quizzes/:id" element={<EditQuiz />} />
          <Route path="quizzes/:id/edit" element={<EditQuiz />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <Toast />
        <AppContent />
      </NotificationProvider>
    </ErrorBoundary>
  );
}


export default App;

import React from 'react';
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
import AppLayout from './components/AppLayout';

function App() {
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

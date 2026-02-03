import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LessonPlan from './pages/LessonPlan';
import QuizGenerator from './pages/QuizGenerator';
import ResourceHub from './pages/ResourceHub';
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

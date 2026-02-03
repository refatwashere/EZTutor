import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

export default function AppLayout() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="nav">
        <div className="container-wide nav-inner">
          <button className="text-lg font-semibold" onClick={() => navigate('/')}>
            EZTutor
          </button>
          <div className="nav-links">
            <NavLink to="/" end className={({ isActive }) => `btn btn-outline ${isActive ? 'active' : ''}`}>
              Dashboard
            </NavLink>
            <NavLink to="/lesson" className={({ isActive }) => `btn btn-outline ${isActive ? 'active' : ''}`}>
              Lesson Plan
            </NavLink>
            <NavLink to="/quiz" className={({ isActive }) => `btn btn-outline ${isActive ? 'active' : ''}`}>
              Quiz
            </NavLink>
            <NavLink to="/resources" className={({ isActive }) => `btn btn-outline ${isActive ? 'active' : ''}`}>
              Resources
            </NavLink>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}

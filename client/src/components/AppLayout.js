import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import AuthModal from './AuthModal';

export default function AppLayout() {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const token = localStorage.getItem('eztutor_token');

  useEffect(() => {
    const loadMe = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE || ''}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          localStorage.removeItem('eztutor_token');
        }
      } catch (err) {
        localStorage.removeItem('eztutor_token');
      }
    };
    loadMe();
  }, [token]);

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
            {user ? (
              <div className="relative">
                <button className="btn btn-outline" onClick={() => setShowMenu((v) => !v)}>
                  {user.email}
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 card section-card space-y-2">
                    <button
                      className="btn btn-outline"
                      onClick={() => {
                        localStorage.removeItem('eztutor_token');
                        setUser(null);
                        setShowMenu(false);
                        navigate('/');
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="btn btn-outline" onClick={() => setShowAuth(true)}>
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onAuth={(data) => {
            localStorage.setItem('eztutor_token', data.token);
            setShowAuth(false);
            setUser({ email: data.email });
          }}
        />
      )}
      <Outlet context={{ user }} />
      <footer className="section">
        <div className="container-wide flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
          <div>© {new Date().getFullYear()} EZTutor. All rights reserved.</div>
          <div className="flex flex-wrap gap-3">
            <Link to="/privacy" className="btn btn-outline">
              Privacy Policy
            </Link>
            <Link to="/terms" className="btn btn-outline">
              Terms
            </Link>
            <Link to="/cookies" className="btn btn-outline">
              Cookie Policy
            </Link>
            <Link to="/support" className="btn btn-outline">
              Support
            </Link>
            <Link to="/contact" className="btn btn-outline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

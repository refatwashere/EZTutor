import React, { useState } from 'react';

export default function AuthModal({ onClose, onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE || ''}/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Auth failed');
      }
      onAuth({ token: data.token, email });
    } catch (err) {
      setError(err.message || 'Auth failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="card section-card w-full max-w-md space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">{mode === 'login' ? 'Login' : 'Sign Up'}</h3>
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline" onClick={() => setMode('login')}>
            Login
          </button>
          <button className="btn btn-outline" onClick={() => setMode('signup')}>
            Sign Up
          </button>
        </div>
        <input
          className="input w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input w-full"
          type="password"
          placeholder="Password (min 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
        </button>
        {error && <div className="text-red-700 text-sm">{error}</div>}
      </div>
    </div>
  );
}

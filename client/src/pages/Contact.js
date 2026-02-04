import React, { useState } from 'react';

export default function Contact() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('');
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      topic: formData.get('topic'),
      message: formData.get('message'),
    };
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE || ''}/api/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to send message.');
      }
      setStatus('Thanks! Your message has been sent.');
      event.currentTarget.reset();
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      setError(err?.message || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <div className="container space-y-6 fade-in">
        <div className="card section-card space-y-3">
          <h1 className="text-3xl font-bold">Contact</h1>
          <p className="text-gray-600">
            Reach out with questions, feedback, or account requests. We typically respond
            within 1-2 business days.
          </p>
        </div>

        <div className="card section-card space-y-4">
          <form className="space-y-3" onSubmit={handleSubmit}>
            <input className="input w-full" placeholder="Name" name="name" required />
            <input className="input w-full" placeholder="Email" type="email" name="email" required />
            <select className="input w-full" name="topic">
              <option value="General question">General question</option>
              <option value="Account support">Account support</option>
              <option value="Privacy request">Privacy request</option>
              <option value="Bug report">Bug report</option>
            </select>
            <textarea
              className="input w-full"
              rows="5"
              placeholder="How can we help?"
              name="message"
              required
            ></textarea>
            <button className="btn btn-primary" type="submit">
              {loading ? 'Sending...' : 'Send message'}
            </button>
          </form>
          {status && <div className="pill">{status}</div>}
          {error && <div className="pill">{error}</div>}
          <div className="text-sm text-gray-600">
            Support email: <span className="font-semibold">support@eztutor.app</span>
          </div>
        </div>
      </div>
    </main>
  );
}

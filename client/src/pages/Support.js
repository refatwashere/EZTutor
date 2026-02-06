import React from 'react';

export default function Support() {
  return (
    <main className="page">
      <div className="container space-y-6 fade-in">
        <div className="card section-card space-y-3">
          <h1 className="text-3xl font-bold">Support</h1>
          <p className="text-gray-600">
            Need help? We are here to make sure EZTutor works smoothly for your classroom.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="card section-card space-y-3">
            <div className="font-semibold">Common issues</div>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Invalid API key or quota errors</li>
              <li>Database connection failures</li>
              <li>Slow or empty responses</li>
            </ul>
          </div>
          <div className="card section-card space-y-3">
            <div className="font-semibold">Recommended steps</div>
            <ol className="list-decimal pl-6 text-gray-700 space-y-1">
              <li>Confirm your environment variables are set correctly.</li>
              <li>Check the health endpoints for API readiness.</li>
              <li>Retry after a minute if the provider is rate limited.</li>
            </ol>
          </div>
        </div>

        <div className="card section-card space-y-3">
          <div className="font-semibold">FAQ</div>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Where is my data stored? Auth data and recents live in Postgres.</li>
            <li>Can I export results? Use Copy or Download in Lesson/Quiz pages.</li>
            <li>Why is the response empty? Check API status and your AI key.</li>
          </ul>
        </div>

        <div className="card section-card space-y-3">
          <div className="font-semibold">Contact support</div>
          <p className="text-gray-700">
            Email: <span className="font-semibold">support@eztutor.app</span>
          </p>
          <p className="text-gray-600">
            Replace this email with your actual support inbox.
          </p>
        </div>
      </div>
    </main>
  );
}

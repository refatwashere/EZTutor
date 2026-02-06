import React from 'react';

export default function CookiePolicy() {
  return (
    <main className="page">
      <div className="container space-y-6 fade-in">
        <div className="card section-card space-y-3">
          <h1 className="text-3xl font-bold">Cookie Policy</h1>
          <p className="text-gray-600">
            EZTutor uses minimal cookies and local storage to keep the app secure and
            functional. This page summarizes how those mechanisms are used.
          </p>
        </div>

        <div className="card section-card space-y-4">
          <div>
            <div className="font-semibold">Authentication</div>
            <p className="text-gray-700">
              We store a JWT in local storage to keep you signed in. You can log out at
              any time to remove it.
            </p>
          </div>
          <div>
            <div className="font-semibold">Preferences</div>
            <p className="text-gray-700">
              We save quiz settings locally to speed up future quiz creation. You can
              reset these from the Dashboard.
            </p>
          </div>
          <div>
            <div className="font-semibold">Third-party services</div>
            <p className="text-gray-700">
              Our AI provider may set its own operational cookies when serving requests.
              We do not use third-party advertising trackers.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

import React from 'react';

export default function Terms() {
  return (
    <main className="page">
      <div className="container space-y-6 fade-in">
        <div className="card section-card space-y-3">
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-gray-600">
            By using EZTutor, you agree to the following terms. These are provided as a
            template and should be adapted to your organization.
          </p>
        </div>

        <div className="card section-card space-y-4">
          <div>
            <div className="font-semibold">Acceptable use</div>
            <p className="text-gray-700">
              Use EZTutor for lawful, educational purposes. Do not upload sensitive
              student data or content you do not have permission to share.
            </p>
          </div>
          <div>
            <div className="font-semibold">Accounts</div>
            <p className="text-gray-700">
              You are responsible for maintaining the confidentiality of your login
              credentials and all activity under your account.
            </p>
          </div>
          <div>
            <div className="font-semibold">Service availability</div>
            <p className="text-gray-700">
              We strive for high availability but do not guarantee uninterrupted service.
              Planned maintenance or provider outages may occur.
            </p>
          </div>
          <div>
            <div className="font-semibold">Changes</div>
            <p className="text-gray-700">
              We may update these terms as the product evolves. Material changes will be
              communicated in-app or via email.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

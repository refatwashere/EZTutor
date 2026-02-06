import React from 'react';

export default function PrivacyPolicy() {
  return (
    <main className="page">
      <div className="container space-y-6 fade-in">
        <div className="card section-card space-y-3">
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-gray-600">
            EZTutor respects your privacy. This policy explains what data we collect, how
            it is used, and the choices you have.
          </p>
        </div>

        <div className="card section-card space-y-4">
          <div>
            <div className="font-semibold">Information we collect</div>
            <p className="text-gray-700">
              We collect account details (email and password hash) and your generated
              recents list. We do not store lesson or quiz content unless you choose to
              save it locally in your browser.
            </p>
          </div>
          <div>
            <div className="font-semibold">How we use data</div>
            <p className="text-gray-700">
              Data is used to authenticate your account and show your recent outputs.
              We do not sell your data or use it for advertising.
            </p>
          </div>
          <div>
            <div className="font-semibold">Data retention</div>
            <p className="text-gray-700">
              Recents are stored per user until you clear them. Account records remain
              active until you request deletion.
            </p>
          </div>
          <div>
            <div className="font-semibold">Your choices</div>
            <p className="text-gray-700">
              You can clear recents at any time from the Dashboard. For account removal
              or data access requests, contact support.
            </p>
          </div>
          <div>
            <div className="font-semibold">Support messages</div>
            <p className="text-gray-700">
              If you submit the Support form, we receive your name, email, and message
              so we can respond.
            </p>
          </div>
          <div>
            <div className="font-semibold">Contact</div>
            <p className="text-gray-700">
              For privacy requests, reach out via the Support page.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

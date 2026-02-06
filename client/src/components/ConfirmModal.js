import React from 'react';

export default function ConfirmModal({ open, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-11/12 max-w-lg p-6 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20h.01" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{message}</p>
            <div className="mt-4 flex justify-end gap-3">
              <button className="btn btn-outline" onClick={onCancel}>{cancelText}</button>
              <button className="btn btn-primary" onClick={onConfirm}>{confirmText}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

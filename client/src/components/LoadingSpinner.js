import React from 'react';

export default function LoadingSpinner({ open, message = 'Processing...' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="flex flex-col items-center gap-4 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-indigo-500 border-gray-200" />
        <div className="text-sm text-gray-700 dark:text-gray-200">{message}</div>
      </div>
    </div>
  );
}

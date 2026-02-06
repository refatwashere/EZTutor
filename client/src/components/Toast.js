import React from 'react';
import { useNotification } from '../context/NotificationContext';
import '../styles/Toast.css';

export function Toast() {
  const { toasts, removeToast } = useNotification();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <div className="toast-content">
            <span>{toast.message}</span>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

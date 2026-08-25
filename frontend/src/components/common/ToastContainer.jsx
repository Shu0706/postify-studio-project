import React, { useState, useEffect, useCallback } from 'react';
import Toast from './Toast';

/**
 * ToastContainer component for managing multiple toast notifications
 */
const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  // Add event listeners for different notification types
  useEffect(() => {
    const handleSessionExpired = () => {
      addToast('Your session has expired. Please log in again.', 'error');
    };

    const handlePermissionDenied = (e) => {
      addToast(e.detail?.message || 'Permission denied', 'error');
    };

    const handleRateLimited = (e) => {
      addToast(e.detail?.message || 'Too many requests, please try again later', 'warning');
    };

    const handleServerError = (e) => {
      addToast(e.detail?.message || 'Server error, please try again later', 'error');
    };

    // Add event listeners
    window.addEventListener('session-expired', handleSessionExpired);
    window.addEventListener('permission-denied', handlePermissionDenied);
    window.addEventListener('rate-limited', handleRateLimited);
    window.addEventListener('server-error', handleServerError);

    // Cleanup
    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
      window.removeEventListener('permission-denied', handlePermissionDenied);
      window.removeEventListener('rate-limited', handleRateLimited);
      window.removeEventListener('server-error', handleServerError);
    };
  }, []);

  // Add a toast to the stack
  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  // Remove a toast from the stack
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Global methods for adding toasts
  useEffect(() => {
    window.toast = {
      success: (message, duration) => addToast(message, 'success', duration),
      error: (message, duration) => addToast(message, 'error', duration),
      warning: (message, duration) => addToast(message, 'warning', duration),
      info: (message, duration) => addToast(message, 'info', duration),
    };

    // Cleanup
    return () => {
      delete window.toast;
    };
  }, [addToast]);

  return (
    <div className="fixed bottom-0 right-0 p-6 z-50 space-y-4">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;

// Type definitions for typescript projects
/**
 * @typedef {Object} ToastMethods
 * @property {(message: string, duration?: number) => void} success - Show success toast
 * @property {(message: string, duration?: number) => void} error - Show error toast
 * @property {(message: string, duration?: number) => void} warning - Show warning toast
 * @property {(message: string, duration?: number) => void} info - Show info toast
 */

/**
 * Global toast methods
 * @type {ToastMethods}
 */
// window.toast;

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Toast from '../components/Toast';
import './ToastContext.css';

const ToastContext = createContext(null);

/**
 * ToastProvider Component
 * Manages toast notifications across the application
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  /**
   * Add a new toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Duration in ms (default: 4000)
   */
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    setToasts((prevToasts) => [
      ...prevToasts,
      { id, message, type, duration },
    ]);

    return id;
  }, []);

  /**
   * Remove a toast by ID
   * @param {string} id - Toast ID to remove
   */
  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Show success toast
   * @param {string} message - Success message
   * @param {number} duration - Duration in ms
   */
  const showSuccess = useCallback((message, duration = 4000) => {
    return addToast(message, 'success', duration);
  }, [addToast]);

  /**
   * Show error toast
   * @param {string} message - Error message
   * @param {number} duration - Duration in ms
   */
  const showError = useCallback((message, duration = 5000) => {
    return addToast(message, 'error', duration);
  }, [addToast]);

  /**
   * Show warning toast
   * @param {string} message - Warning message
   * @param {number} duration - Duration in ms
   */
  const showWarning = useCallback((message, duration = 4000) => {
    return addToast(message, 'warning', duration);
  }, [addToast]);

  /**
   * Show info toast
   * @param {string} message - Info message
   * @param {number} duration - Duration in ms
   */
  const showInfo = useCallback((message, duration = 4000) => {
    return addToast(message, 'info', duration);
  }, [addToast]);

  /**
   * Clear all toasts
   */
  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const value = {
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook to use toast notifications
 * @returns {Object} Toast context methods
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

import api from './api';

/**
 * Setup API interceptors with toast notifications
 * This should be called once in the app initialization
 * @param {Object} toastContext - Toast context from useToast hook
 */
export const setupAPIInterceptors = (toastContext) => {
  // Response interceptor to handle errors with toast notifications
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Handle 401 errors (already handled in api.js)
      if (error.response && error.response.status === 401) {
        toastContext.showError('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Handle other errors with toast notifications
      if (error.response) {
        // Server responded with error status
        const message = error.response.data?.message || 'An error occurred';
        toastContext.showError(message);
      } else if (error.request) {
        // Request was made but no response received
        toastContext.showError('Network error. Please check your connection.');
      } else {
        // Something else happened
        toastContext.showError('An unexpected error occurred.');
      }

      return Promise.reject(error);
    }
  );
};

/**
 * Wrapper for API calls with loading state and success toast
 * @param {Function} apiCall - API function to call
 * @param {Object} options - Options for the wrapper
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {string} options.successMessage - Success toast message
 * @param {boolean} options.showSuccessToast - Whether to show success toast (default: false)
 * @returns {Function} Wrapped API call function
 */
export const withToast = (apiCall, options = {}) => {
  return async (...args) => {
    try {
      const response = await apiCall(...args);
      
      if (options.showSuccessToast && options.successMessage) {
        // Success toast will be shown by the component using useToast
      }
      
      if (options.onSuccess) {
        options.onSuccess(response.data);
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      if (options.onError) {
        options.onError(error);
      }
      
      return { success: false, error };
    }
  };
};

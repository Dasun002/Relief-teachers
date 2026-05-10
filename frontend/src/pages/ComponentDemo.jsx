import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  formatDate,
  formatDateISO,
  formatTime,
  isWeekday,
  getDayName,
  formatDateShort,
} from '../utils/dateUtils';

/**
 * Component Demo Page
 * Demonstrates the usage of LoadingSpinner, Toast notifications, and date utilities
 * This is for development/testing purposes only
 */
const ComponentDemo = () => {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const toast = useToast();

  const handleTestLoading = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.showSuccess('Loading completed!');
    }, 2000);
  };

  const handleDateValidation = () => {
    if (!selectedDate) {
      toast.showWarning('Please select a date first');
      return;
    }

    const date = new Date(selectedDate);
    const dayName = getDayName(date);
    const isValid = isWeekday(date);

    if (isValid) {
      toast.showSuccess(`${dayName} is a valid weekday!`);
    } else {
      toast.showError(`${dayName} is a weekend. Please select a weekday.`);
    }
  };

  const currentDate = new Date();

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Component Demo Page</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        This page demonstrates the loading spinner, toast notifications, and date utilities.
      </p>

      {/* Date Utilities Demo */}
      <section style={{ marginBottom: '3rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h2>Date & Time Utilities</h2>
        
        <div style={{ marginBottom: '1rem' }}>
          <strong>Current Date:</strong>
          <ul style={{ marginTop: '0.5rem' }}>
            <li>Full Format: {formatDate(currentDate)}</li>
            <li>Short Format: {formatDateShort(currentDate)}</li>
            <li>ISO Format: {formatDateISO(currentDate)}</li>
            <li>Day Name: {getDayName(currentDate)}</li>
            <li>Is Weekday: {isWeekday(currentDate) ? 'Yes' : 'No'}</li>
            <li>Current Time: {formatTime(currentDate)}</li>
          </ul>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            <strong>Test Date Validation:</strong>
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginRight: '1rem',
            }}
          />
          <button
            onClick={handleDateValidation}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Validate Weekday
          </button>
        </div>
      </section>

      {/* Loading Spinner Demo */}
      <section style={{ marginBottom: '3rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h2>Loading Spinner</h2>
        
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <p><strong>Small</strong></p>
            <LoadingSpinner size="small" />
          </div>
          <div>
            <p><strong>Medium</strong></p>
            <LoadingSpinner size="medium" />
          </div>
          <div>
            <p><strong>Large</strong></p>
            <LoadingSpinner size="large" />
          </div>
          <div>
            <p><strong>With Text</strong></p>
            <LoadingSpinner size="medium" text="Loading..." />
          </div>
        </div>

        <button
          onClick={handleTestLoading}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: loading ? '#ccc' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {loading && <LoadingSpinner size="small" color="white" />}
          {loading ? 'Loading...' : 'Test Loading (2s)'}
        </button>
      </section>

      {/* Toast Notifications Demo */}
      <section style={{ marginBottom: '3rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h2>Toast Notifications</h2>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => toast.showSuccess('This is a success message!')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Show Success
          </button>

          <button
            onClick={() => toast.showError('This is an error message!')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Show Error
          </button>

          <button
            onClick={() => toast.showWarning('This is a warning message!')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Show Warning
          </button>

          <button
            onClick={() => toast.showInfo('This is an info message!')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Show Info
          </button>

          <button
            onClick={() => {
              toast.showSuccess('First toast');
              setTimeout(() => toast.showInfo('Second toast'), 500);
              setTimeout(() => toast.showWarning('Third toast'), 1000);
            }}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Show Multiple
          </button>

          <button
            onClick={() => toast.clearAll()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Clear All
          </button>
        </div>
      </section>

      {/* Full Screen Loading Demo */}
      <section style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h2>Full Screen Loading</h2>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          Click the button below to see a full-screen loading overlay
        </p>
        <button
          onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              toast.showSuccess('Full screen loading completed!');
            }, 3000);
          }}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Test Full Screen Loading (3s)
        </button>
      </section>

      {loading && <LoadingSpinner fullScreen text="Processing..." />}
    </div>
  );
};

export default ComponentDemo;

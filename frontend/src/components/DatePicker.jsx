import { useState } from 'react';
import PropTypes from 'prop-types';
import { formatDateISO, isWeekday, getDayName } from '../utils/dateUtils';

const DatePicker = ({ selectedDate, onDateChange, disabled = false, label = "Date" }) => {
  const [error, setError] = useState('');

  const handleDateChange = (event) => {
    const dateValue = event.target.value;
    setError('');

    if (!dateValue) {
      onDateChange('');
      return;
    }

    // Validate if it's a weekday
    if (!isWeekday(dateValue)) {
      const dayName = getDayName(dateValue);
      setError(`${dayName} is a weekend. Please select a weekday (Monday-Friday).`);
      return;
    }

    onDateChange(dateValue);
  };

  // Get today's date in YYYY-MM-DD format
  const today = formatDateISO(new Date());

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor="date-picker" style={{ 
        display: 'block', 
        marginBottom: '0.5rem',
        fontWeight: 'bold'
      }}>
        {label} *
      </label>
      <input
        id="date-picker"
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
        disabled={disabled}
        max={today} // Prevent selecting future dates
        style={{
          width: '100%',
          padding: '0.5rem',
          border: error ? '2px solid #dc3545' : '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '1rem',
          backgroundColor: disabled ? '#f8f9fa' : 'white'
        }}
      />
      {error && (
        <div style={{ 
          color: '#dc3545', 
          fontSize: '0.875rem', 
          marginTop: '0.25rem',
          padding: '0.5rem',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}
      {selectedDate && !error && (
        <div style={{ 
          color: '#28a745', 
          fontSize: '0.875rem', 
          marginTop: '0.25rem',
          padding: '0.5rem',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '4px'
        }}>
          Selected: {getDayName(selectedDate)}, {new Date(selectedDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

DatePicker.propTypes = {
  selectedDate: PropTypes.string.isRequired,
  onDateChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  label: PropTypes.string
};

export default DatePicker;
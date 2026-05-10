# Usage Examples for Date Utils, Loading Spinner, and Toast Notifications

## Date and Time Utilities

### Import
```javascript
import { 
  formatDate, 
  formatDateISO, 
  formatTime, 
  isWeekday, 
  getDayName,
  formatDateShort,
  parseISODate
} from '../utils/dateUtils';
```

### Examples

#### Format Date for Display
```javascript
const date = new Date('2024-01-15');
const formatted = formatDate(date);
// Output: "Monday, January 15, 2024"

// Also works with ISO strings
const formatted2 = formatDate('2024-01-15');
// Output: "Monday, January 15, 2024"
```

#### Format Date for Storage (ISO 8601)
```javascript
const date = new Date();
const isoDate = formatDateISO(date);
// Output: "2024-01-15"

// Use this when sending dates to the backend
const attendanceData = {
  teacherId: 123,
  date: formatDateISO(new Date()),
  status: 'absent'
};
```

#### Format Time (24-hour format)
```javascript
const time1 = formatTime('09:30:00');
// Output: "09:30"

const time2 = formatTime('14:45');
// Output: "14:45"

const time3 = formatTime(new Date());
// Output: "14:30" (current time)
```

#### Check if Weekday
```javascript
const monday = new Date('2024-01-15');
const saturday = new Date('2024-01-20');

isWeekday(monday);    // true
isWeekday(saturday);  // false

// Useful for validation
if (!isWeekday(selectedDate)) {
  toast.showWarning('Please select a weekday (Monday-Friday)');
}
```

#### Get Day Name
```javascript
const date = new Date('2024-01-15');
const dayName = getDayName(date);
// Output: "Monday"
```

## Loading Spinner Component

### Import
```javascript
import LoadingSpinner from '../components/LoadingSpinner';
```

### Examples

#### Basic Usage
```javascript
function MyComponent() {
  const [loading, setLoading] = useState(false);

  return (
    <div>
      {loading && <LoadingSpinner />}
    </div>
  );
}
```

#### With Custom Size
```javascript
<LoadingSpinner size="small" />   // Small spinner
<LoadingSpinner size="medium" />  // Medium (default)
<LoadingSpinner size="large" />   // Large spinner
```

#### With Custom Color
```javascript
<LoadingSpinner color="#10b981" />  // Green
<LoadingSpinner color="#ef4444" />  // Red
```

#### With Loading Text
```javascript
<LoadingSpinner text="Loading teachers..." />
<LoadingSpinner text="Saving attendance..." size="small" />
```

#### Full Screen Overlay
```javascript
{loading && <LoadingSpinner fullScreen text="Processing..." />}
```

#### In Button
```javascript
<button disabled={loading}>
  {loading && <LoadingSpinner size="small" color="white" />}
  {loading ? 'Saving...' : 'Save'}
</button>
```

## Toast Notifications

### Import
```javascript
import { useToast } from '../contexts/ToastContext';
```

### Examples

#### Basic Usage
```javascript
function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.showSuccess('Operation completed successfully!');
  };

  const handleError = () => {
    toast.showError('Something went wrong!');
  };

  const handleWarning = () => {
    toast.showWarning('Please review your input.');
  };

  const handleInfo = () => {
    toast.showInfo('New feature available!');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
      <button onClick={handleWarning}>Warning</button>
      <button onClick={handleInfo}>Info</button>
    </div>
  );
}
```

#### With Custom Duration
```javascript
// Auto-dismiss after 3 seconds
toast.showSuccess('Saved!', 3000);

// Auto-dismiss after 10 seconds
toast.showError('Critical error!', 10000);
```

#### In Async Operations
```javascript
const handleSave = async () => {
  try {
    setLoading(true);
    await api.post('/attendance', data);
    toast.showSuccess('Attendance recorded successfully!');
  } catch (error) {
    toast.showError(error.message || 'Failed to save attendance');
  } finally {
    setLoading(false);
  }
};
```

#### Clear All Toasts
```javascript
const toast = useToast();

// Clear all active toasts
toast.clearAll();
```

## Complete Example: Attendance Form

```javascript
import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDateISO, isWeekday } from '../utils/dateUtils';
import { attendanceAPI } from '../services/api';

function AttendanceForm() {
  const [date, setDate] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [status, setStatus] = useState('present');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate weekday
    if (!isWeekday(date)) {
      toast.showWarning('Attendance can only be recorded for weekdays');
      return;
    }

    setLoading(true);

    try {
      // Format date for API
      const isoDate = formatDateISO(date);
      
      await attendanceAPI.create(teacherId, isoDate, status, '');
      
      toast.showSuccess('Attendance recorded successfully!');
      
      // Reset form
      setDate('');
      setTeacherId('');
      setStatus('present');
    } catch (error) {
      toast.showError(error.response?.data?.message || 'Failed to record attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Teacher</label>
        <select
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          required
        >
          <option value="">Select teacher</option>
          {/* Teacher options */}
        </select>
      </div>

      <div>
        <label>Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="present">Present</option>
          <option value="absent">Absent</option>
        </select>
      </div>

      <button type="submit" disabled={loading}>
        {loading && <LoadingSpinner size="small" color="white" />}
        {loading ? 'Saving...' : 'Save Attendance'}
      </button>
    </form>
  );
}
```

## Best Practices

### Date Utilities
1. Always use `formatDateISO()` when sending dates to the backend
2. Use `formatDate()` or `formatDateShort()` for display
3. Validate weekdays using `isWeekday()` before submitting attendance
4. Handle invalid dates gracefully (functions return empty strings)

### Loading Spinner
1. Show loading state within 100ms of user action
2. Use appropriate size for context (small in buttons, medium/large for page loads)
3. Provide loading text for operations that take longer than 2 seconds
4. Use fullScreen overlay for critical operations that block the entire UI

### Toast Notifications
1. Use success toasts for completed operations
2. Use error toasts for failures (auto-dismiss after 5 seconds)
3. Use warning toasts for validation issues
4. Use info toasts for general notifications
5. Keep messages concise and actionable
6. Don't show multiple toasts for the same action

import { useState } from 'react';
import { Calendar, Zap, BarChart3 } from 'lucide-react';
import DatePicker from '../components/DatePicker';
import AttendanceForm from '../components/AttendanceForm';
import PeriodAttendanceForm from '../components/PeriodAttendanceForm';
import AttendanceHistory from '../components/AttendanceHistory';
import { formatDateISO } from '../utils/dateUtils';
import './AttendancePage.css';

const AttendancePage = () => {
  const [selectedDate, setSelectedDate] = useState(formatDateISO(new Date()));
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('period'); // 'period', 'simple', or 'history'

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleAttendanceSubmitted = () => {
    // Trigger refresh of history component
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="attendance-page">
      {/* Header */}
      <div className="attendance-header">
        <h1 className="attendance-title">Teacher Attendance</h1>
        <p className="attendance-subtitle">
          Record attendance by period or full day, and view attendance history
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="attendance-tabs">
        <button
          onClick={() => setActiveTab('period')}
          className={`attendance-tab ${activeTab === 'period' ? 'active' : ''}`}
          title="Mark attendance for specific periods"
        >
          <Calendar size={18} style={{ marginRight: '0.5rem' }} /> Period-Based Attendance
        </button>
        <button
          onClick={() => setActiveTab('simple')}
          className={`attendance-tab ${activeTab === 'simple' ? 'active' : ''}`}
          title="Quick full-day attendance marking"
        >
          <Zap size={18} style={{ marginRight: '0.5rem' }} /> Quick Attendance
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`attendance-tab ${activeTab === 'history' ? 'active' : ''}`}
        >
          <BarChart3 size={18} style={{ marginRight: '0.5rem' }} /> View History
        </button>
      </div>

      {/* Period-Based Attendance Tab */}
      {activeTab === 'period' && (
        <div>
          {/* Date Selector */}
          <div className="attendance-date-selector">
            <h3>Select Date</h3>
            <div className="attendance-date-input-wrapper">
              <DatePicker
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                label="Attendance Date"
              />
            </div>
          </div>

          {/* Period Attendance Form */}
          <PeriodAttendanceForm
            selectedDate={selectedDate}
            onAttendanceSubmitted={handleAttendanceSubmitted}
          />
        </div>
      )}

      {/* Simple/Quick Attendance Tab */}
      {activeTab === 'simple' && (
        <div>
          {/* Date Selector */}
          <div className="attendance-date-selector">
            <h3>Select Date</h3>
            <div className="attendance-date-input-wrapper">
              <DatePicker
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                label="Attendance Date"
              />
            </div>
          </div>

          {/* Simple Attendance Form */}
          <AttendanceForm
            selectedDate={selectedDate}
            onAttendanceSubmitted={handleAttendanceSubmitted}
          />
        </div>
      )}

      {/* Attendance History Tab */}
      {activeTab === 'history' && (
        <AttendanceHistory refreshTrigger={refreshTrigger} />
      )}
    </div>
  );
};

export default AttendancePage;
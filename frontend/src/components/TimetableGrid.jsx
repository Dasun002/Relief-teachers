import { useState } from 'react';
import PropTypes from 'prop-types';
import { Users, LayoutGrid, List } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { formatTime } from '../utils/dateUtils';
import './TimetableGrid.css';

const TimetableGrid = ({ timetableEntries, loading = false, error = null }) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [expandedCells, setExpandedCells] = useState({});

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <LoadingSpinner />
        <p style={{ marginTop: '1rem', color: '#666' }}>Loading timetable...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{
          color: '#dc3545',
          fontSize: '1.1rem',
          marginBottom: '1rem'
        }}>
          Error loading timetable
        </div>
        <p style={{ color: '#666' }}>{error}</p>
      </div>
    );
  }

  if (!timetableEntries || timetableEntries.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>No timetable entries found</p>
        <p style={{ color: '#999', fontSize: '0.9rem' }}>
          Try adjusting your filters or import a timetable.
        </p>
      </div>
    );
  }

  // Group entries by day and period for grid display
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  // Get period times from first entry of each period
  const periodTimes = {};
  timetableEntries.forEach(entry => {
    if (!periodTimes[entry.period] && entry.startTime && entry.endTime) {
      periodTimes[entry.period] = {
        start: entry.startTime,
        end: entry.endTime
      };
    }
  });

  const groupedEntries = {};
  timetableEntries.forEach(entry => {
    const key = `${entry.day}-${entry.period}`;
    if (!groupedEntries[key]) {
      groupedEntries[key] = [];
    }
    groupedEntries[key].push(entry);
  });

  // Group entries by class for better organization
  const groupByClass = (entries) => {
    const grouped = {};
    entries.forEach(entry => {
      if (!grouped[entry.class]) {
        grouped[entry.class] = [];
      }
      grouped[entry.class].push(entry);
    });
    return grouped;
  };

  const toggleCellExpansion = (key) => {
    setExpandedCells(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderCellContent = (entries, cellKey) => {
    if (entries.length === 0) return null;

    const byClass = groupByClass(entries);
    const classes = Object.keys(byClass).sort();
    const isExpanded = expandedCells[cellKey];
    const showExpand = entries.length > 3;

    return (
      <div className="cell-content">
        {classes.slice(0, isExpanded ? classes.length : 3).map(className => {
          const classEntries = byClass[className];
          const teachers = classEntries.map(e => e.teacher?.name || 'No teacher').filter((v, i, a) => a.indexOf(v) === i);
          const subject = classEntries[0].subject;

          return (
            <div key={className} className="timetable-entry-compact">
              <div className="entry-header-compact">
                <span className="entry-class-badge">{className}</span>
                {classEntries.length > 1 && (
                  <span className="co-teacher-badge" title={`${classEntries.length} co-teachers`}>
                    <Users size={14} style={{ marginRight: '0.25rem' }} /> {classEntries.length}
                  </span>
                )}
              </div>
              <div className="entry-subject-compact">{subject}</div>
              {teachers.length === 1 ? (
                <div className="entry-teacher-compact">{teachers[0]}</div>
              ) : (
                <div className="entry-teachers-compact" title={teachers.join(', ')}>
                  {teachers.slice(0, 2).join(', ')}
                  {teachers.length > 2 && ` +${teachers.length - 2}`}
                </div>
              )}
            </div>
          );
        })}
        
        {showExpand && (
          <button
            onClick={() => toggleCellExpansion(cellKey)}
            className="expand-button"
          >
            {isExpanded ? '▲ Show Less' : `▼ Show ${classes.length - 3} More`}
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '1rem 1.5rem',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h3 style={{ margin: 0 }}>
          Timetable ({timetableEntries.length} entries)
        </h3>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: viewMode === 'grid' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            <LayoutGrid size={18} style={{ marginRight: '0.5rem' }} /> Grid View
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: viewMode === 'list' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            <List size={18} style={{ marginRight: '0.5rem' }} /> List View
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="desktop-grid-view" style={{ overflowX: 'auto', padding: '1rem' }}>
          <table className="timetable-table-improved">
            <thead>
              <tr>
                <th className="period-header-improved">Period</th>
                {days.map(day => (
                  <th key={day} className="day-header-improved">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map(period => (
                <tr key={period}>
                  <td className="period-cell-improved">
                    <div className="period-number">{period}</div>
                    {periodTimes[period] && (
                      <div className="period-time">
                        {formatTime(periodTimes[period].start)}<br/>
                        {formatTime(periodTimes[period].end)}
                      </div>
                    )}
                  </td>
                  {days.map(day => {
                    const entries = groupedEntries[`${day}-${period}`] || [];
                    const cellKey = `${day}-${period}`;
                    return (
                      <td key={cellKey} className="schedule-cell-improved">
                        {renderCellContent(entries, cellKey)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="list-view-improved" style={{ padding: '1rem' }}>
          {days.map(day => {
            const dayEntries = timetableEntries.filter(e => e.day === day);
            if (dayEntries.length === 0) return null;

            return (
              <div key={day} className="day-section">
                <h4 className="day-title">{day}</h4>
                <div className="day-periods">
                  {periods.map(period => {
                    const periodEntries = dayEntries.filter(e => e.period === period);
                    if (periodEntries.length === 0) return null;

                    const byClass = groupByClass(periodEntries);
                    const classes = Object.keys(byClass).sort();

                    return (
                      <div key={period} className="period-section">
                        <div className="period-header-list">
                          <span className="period-badge">Period {period}</span>
                          {periodTimes[period] && (
                            <span className="time-badge">
                              {formatTime(periodTimes[period].start)} - {formatTime(periodTimes[period].end)}
                            </span>
                          )}
                        </div>
                        <div className="period-classes">
                          {classes.map(className => {
                            const classEntries = byClass[className];
                            const teachers = classEntries.map(e => e.teacher?.name || 'No teacher');
                            const subject = classEntries[0].subject;

                            return (
                              <div key={className} className="class-entry-list">
                                <div className="class-header-list">
                                  <span className="class-name-list">{className}</span>
                                  <span className="subject-name-list">{subject}</span>
                                </div>
                                <div className="teachers-list">
                                  {teachers.map((teacher, idx) => (
                                    <span key={idx} className="teacher-chip">
                                      {teacher}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mobile View */}
      <div className="mobile-list-view" style={{ padding: '1rem' }}>
        {timetableEntries.map((entry, index) => (
          <div key={index} className="mobile-entry-card">
            <div className="mobile-entry-header">
              <div className="mobile-entry-class">
                {entry.class}
              </div>
              <div className="mobile-entry-badge">
                {entry.day} - Period {entry.period}
              </div>
            </div>
            
            <div className="mobile-entry-content">
              <div className="mobile-entry-subject">
                {entry.subject}
              </div>
              <div className="mobile-entry-teacher">
                Teacher: {entry.teacher?.name || 'No teacher assigned'}
              </div>
            </div>

            {entry.startTime && entry.endTime && (
              <div className="mobile-entry-time">
                Time: {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

TimetableGrid.propTypes = {
  timetableEntries: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string,
    class: PropTypes.string.isRequired,
    period: PropTypes.number.isRequired,
    day: PropTypes.string.isRequired,
    teacher: PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string
    }),
    subject: PropTypes.string.isRequired,
    startTime: PropTypes.string,
    endTime: PropTypes.string
  })),
  loading: PropTypes.bool,
  error: PropTypes.string
};

export default TimetableGrid;
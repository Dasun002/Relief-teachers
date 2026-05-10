import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from './LoadingSpinner';
import { formatDate, formatDateISO } from '../utils/dateUtils';
import { teachersAPI, attendanceAPI } from '../services/api';

const AttendanceHistory = ({ refreshTrigger }) => {
  const toast = useToast();
  const [teachers, setTeachers] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    teacherId: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (refreshTrigger) {
      fetchAttendanceHistory();
    }
  }, [refreshTrigger]);

  const fetchTeachers = async () => {
    try {
      const response = await teachersAPI.getAll();
      setTeachers(response.data.data.teachers || []);
    } catch (err) {
      console.error('Failed to load teachers:', err);
    }
  };

  const fetchAttendanceHistory = async () => {
    if (!filters.teacherId || !filters.startDate || !filters.endDate) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await attendanceAPI.getAll({
        teacherId: filters.teacherId,
        startDate: filters.startDate,
        endDate: filters.endDate
      });

      const records = response.data.data.attendance || [];
      setAttendanceRecords(records);
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to load attendance history';
      setError(errorMessage);
      toast.showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    if (!filters.teacherId) {
      toast.showError('Please select a teacher');
      return;
    }
    if (!filters.startDate || !filters.endDate) {
      toast.showError('Please select both start and end dates');
      return;
    }
    if (new Date(filters.startDate) > new Date(filters.endDate)) {
      toast.showError('Start date must be before end date');
      return;
    }
    fetchAttendanceHistory();
  };

  const clearFilters = () => {
    setFilters({
      teacherId: '',
      startDate: '',
      endDate: ''
    });
    setAttendanceRecords([]);
    setError(null);
  };

  // Set default date range (last 30 days)
  const setDefaultDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    setFilters(prev => ({
      ...prev,
      startDate: formatDateISO(startDate),
      endDate: formatDateISO(endDate)
    }));
  };

  const getAttendanceSummary = () => {
    const present = attendanceRecords.filter(record => record.status === 'present').length;
    const absent = attendanceRecords.filter(record => record.status === 'absent').length;
    const total = attendanceRecords.length;
    const presentPercentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    return { present, absent, total, presentPercentage };
  };

  const selectedTeacher = teachers.find(t => t._id === filters.teacherId);
  const summary = getAttendanceSummary();

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.5rem',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6'
      }}>
        <h3 style={{ margin: 0 }}>Attendance History</h3>
      </div>

      {/* Filters */}
      <div style={{ padding: '1.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          {/* Teacher Filter */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}>
              Teacher *
            </label>
            <select
              value={filters.teacherId}
              onChange={(e) => handleFilterChange('teacherId', e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                backgroundColor: loading ? '#f8f9fa' : 'white'
              }}
            >
              <option value="">Select Teacher</option>
              {teachers.map(teacher => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}>
              Start Date *
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                backgroundColor: loading ? '#f8f9fa' : 'white'
              }}
            />
          </div>

          {/* End Date */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}>
              End Date *
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                backgroundColor: loading ? '#f8f9fa' : 'white'
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleSearch}
            disabled={loading || !filters.teacherId || !filters.startDate || !filters.endDate}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: (!filters.teacherId || !filters.startDate || !filters.endDate || loading) 
                ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (!filters.teacherId || !filters.startDate || !filters.endDate || loading) 
                ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Search
          </button>
          <button
            onClick={setDefaultDateRange}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Last 30 Days
          </button>
          <button
            onClick={clearFilters}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <LoadingSpinner />
          <p style={{ marginTop: '1rem', color: '#666' }}>Loading attendance history...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{ padding: '1.5rem' }}>
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '1rem',
            borderRadius: '4px',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && !error && attendanceRecords.length > 0 && (
        <div>
          {/* Summary */}
          <div style={{
            padding: '1rem 1.5rem',
            backgroundColor: '#e3f2fd',
            borderTop: '1px solid #dee2e6',
            borderBottom: '1px solid #dee2e6'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>{selectedTeacher?.name}</strong> - Attendance Summary
            </div>
            <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem' }}>
              <span style={{ color: '#28a745' }}>Present: {summary.present}</span>
              <span style={{ color: '#dc3545' }}>Absent: {summary.absent}</span>
              <span style={{ color: '#666' }}>Total: {summary.total} days</span>
              <span style={{ color: '#007bff' }}>Attendance Rate: {summary.presentPercentage}%</span>
            </div>
          </div>

          {/* Records Table */}
          <div style={{ padding: '1rem' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                    <th style={{
                      textAlign: 'left',
                      padding: '0.75rem',
                      fontWeight: 'bold',
                      color: '#495057'
                    }}>
                      Date
                    </th>
                    <th style={{
                      textAlign: 'center',
                      padding: '0.75rem',
                      fontWeight: 'bold',
                      color: '#495057'
                    }}>
                      Status
                    </th>
                    <th style={{
                      textAlign: 'left',
                      padding: '0.75rem',
                      fontWeight: 'bold',
                      color: '#495057'
                    }}>
                      Recorded
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((record, index) => (
                    <tr 
                      key={index}
                      style={{ 
                        borderBottom: '1px solid #dee2e6',
                        backgroundColor: record.status === 'absent' ? '#fff5f5' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '0.75rem' }}>
                        {formatDate(record.date)}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <span style={{
                          backgroundColor: record.status === 'present' ? '#28a745' : '#dc3545',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#666', fontSize: '0.875rem' }}>
                        {new Date(record.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && attendanceRecords.length === 0 && filters.teacherId && filters.startDate && filters.endDate && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
          <p>No attendance records found for the selected criteria.</p>
        </div>
      )}
    </div>
  );
};

AttendanceHistory.propTypes = {
  refreshTrigger: PropTypes.number
};

export default AttendanceHistory;
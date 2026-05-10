import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { teachersAPI } from '../services/api';

const TimetableFilters = ({ onFilterChange, loading = false }) => {
  const [filters, setFilters] = useState({
    class: '',
    teacher: '',
    day: '',
    period: ''
  });
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  const classes = [
    '6A', '6B', '6C',
    '7A', '7B', '7C',
    '8A', '8B', '8C',
    '9A', '9B', '9C',
    '10A', '10B', '10C',
    '11A', '11B', '11C',
    '12A', '12B', '12C',
    '13A', '13B', '13C'
  ];

  const days = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
  ];

  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoadingTeachers(true);
      const response = await teachersAPI.getAll();
      setTeachers(response.data.data.teachers || []);
    } catch (error) {
      console.error('Failed to load teachers:', error);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      class: '',
      teacher: '',
      day: '',
      period: ''
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '1.5rem'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Filter Timetable</h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        {/* Class Filter */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem',
            fontWeight: 'bold',
            fontSize: '0.9rem'
          }}>
            Class
          </label>
          <select
            value={filters.class}
            onChange={(e) => handleFilterChange('class', e.target.value)}
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
            <option value="">All Classes</option>
            {classes.map(className => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
        </div>

        {/* Teacher Filter */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem',
            fontWeight: 'bold',
            fontSize: '0.9rem'
          }}>
            Teacher
          </label>
          <select
            value={filters.teacher}
            onChange={(e) => handleFilterChange('teacher', e.target.value)}
            disabled={loading || loadingTeachers}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              backgroundColor: (loading || loadingTeachers) ? '#f8f9fa' : 'white'
            }}
          >
            <option value="">All Teachers</option>
            {teachers.map(teacher => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.name}
              </option>
            ))}
          </select>
          {loadingTeachers && (
            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
              Loading teachers...
            </div>
          )}
        </div>

        {/* Day Filter */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem',
            fontWeight: 'bold',
            fontSize: '0.9rem'
          }}>
            Day
          </label>
          <select
            value={filters.day}
            onChange={(e) => handleFilterChange('day', e.target.value)}
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
            <option value="">All Days</option>
            {days.map(day => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        {/* Period Filter */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem',
            fontWeight: 'bold',
            fontSize: '0.9rem'
          }}>
            Period
          </label>
          <select
            value={filters.period}
            onChange={(e) => handleFilterChange('period', e.target.value)}
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
            <option value="">All Periods</option>
            {periods.map(period => (
              <option key={period} value={period}>
                Period {period}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      <div style={{ textAlign: 'right' }}>
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
          Clear Filters
        </button>
      </div>
    </div>
  );
};

TimetableFilters.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default TimetableFilters;
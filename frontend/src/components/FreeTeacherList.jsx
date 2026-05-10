import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from './LoadingSpinner';
import { teachersAPI } from '../services/api';
import { getDayName } from '../utils/dateUtils';

const FreeTeacherList = ({ selectedDate, period, onSelectTeacher, onCancel }) => {
  const { showError } = useToast();
  const [freeTeachers, setFreeTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFreeTeachers = useCallback(async () => {
    if (!selectedDate || !period) return;
    
    try {
      setLoading(true);
      setError(null);

      const dayName = getDayName(selectedDate);
      
      const response = await teachersAPI.getFree(selectedDate, period, dayName);
      const teachers = response.data.data.teachers || [];

      setFreeTeachers(teachers);

    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to load free teachers';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, period, showError]);

  useEffect(() => {
    fetchFreeTeachers();
  }, [fetchFreeTeachers]);

  const handleSelectTeacher = (teacher) => {
    onSelectTeacher(teacher);
  };

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
        <p style={{ marginTop: '1rem', color: '#666' }}>Loading available teachers...</p>
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
        <div style={{ color: '#dc3545', fontSize: '1.1rem', marginBottom: '1rem' }}>
          Error loading free teachers
        </div>
        <p style={{ color: '#666', marginBottom: '1rem' }}>{error}</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={fetchFreeTeachers}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Retry
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

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
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: 0 }}>
            Available Teachers ({freeTeachers.length})
          </h3>
          <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
            {getDayName(selectedDate)}, Period {period} - {new Date(selectedDate).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={onCancel}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Cancel
        </button>
      </div>

      {/* Teachers List */}
      <div style={{ padding: '1rem' }}>
        {freeTeachers.length === 0 ? (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#666'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😔</div>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>No Available Teachers</h4>
            <p style={{ margin: 0 }}>
              All teachers are either scheduled or absent during this period.
            </p>
            <button
              onClick={onCancel}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Go Back
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            {freeTeachers.map((teacher) => (
              <div
                key={teacher._id}
                style={{
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  padding: '1rem',
                  backgroundColor: '#f8fff8',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Teacher Info */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <h4 style={{ margin: 0, color: '#28a745' }}>
                      {teacher.name}
                    </h4>
                    <span style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem'
                    }}>
                      Available
                    </span>
                  </div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>
                    <strong>Subjects:</strong> {teacher.subjects.join(', ')}
                  </div>
                </div>

                {/* Select Button */}
                <button
                  onClick={() => handleSelectTeacher(teacher)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#218838';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#28a745';
                  }}
                >
                  Select Teacher
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

FreeTeacherList.propTypes = {
  selectedDate: PropTypes.string.isRequired,
  period: PropTypes.number.isRequired,
  onSelectTeacher: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default FreeTeacherList;
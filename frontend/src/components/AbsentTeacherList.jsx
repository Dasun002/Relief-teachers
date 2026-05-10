import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { PartyPopper, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from './LoadingSpinner';
import { attendanceAPI, timetableAPI, substitutionsAPI } from '../services/api';

const AbsentTeacherList = ({ selectedDate, onAllocateSubstitute }) => {
  const { showError } = useToast();
  const [absentTeachers, setAbsentTeachers] = useState([]);
  const [timetableData, setTimetableData] = useState([]);
  const [substitutions, setSubstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAbsentTeachersData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get day name from date
      const dayName = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });

      // Fetch attendance for the selected date
      const attendanceResponse = await attendanceAPI.getAll({ date: selectedDate });
      const attendanceRecords = attendanceResponse.data.data.attendance || [];

      // Filter absent teachers (either full day absent or has absent periods)
      const absentTeachersList = attendanceRecords.filter(record => 
        record.status === 'absent' || (record.absentPeriods && record.absentPeriods.length > 0)
      );

      if (absentTeachersList.length === 0) {
        setAbsentTeachers([]);
        setTimetableData([]);
        setSubstitutions([]);
        return;
      }

      // Fetch timetable for the day
      const timetableResponse = await timetableAPI.getAll();
      const allTimetable = timetableResponse.data.data.timetable || [];
      
      // Filter timetable for the selected day
      const dayTimetable = allTimetable.filter(entry => entry.day === dayName);

      // Fetch existing substitutions for the date
      const substitutionsResponse = await substitutionsAPI.getAll({ date: selectedDate });
      const existingSubstitutions = substitutionsResponse.data.data.substitutions || [];

      setAbsentTeachers(absentTeachersList);
      setTimetableData(dayTimetable);
      setSubstitutions(existingSubstitutions);

    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to load absent teachers data';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, showError]);

  useEffect(() => {
    if (selectedDate) {
      fetchAbsentTeachersData();
    }
  }, [selectedDate, fetchAbsentTeachersData]);

  const getTeacherSchedule = (teacherId, absentPeriods) => {
    const allSchedule = timetableData.filter(entry => entry.teacher && entry.teacher._id === teacherId);
    
    // If absentPeriods is provided and not empty, filter to only show those periods
    if (absentPeriods && absentPeriods.length > 0) {
      return allSchedule.filter(entry => absentPeriods.includes(entry.period));
    }
    
    // Otherwise show all schedule (for full day absence)
    return allSchedule;
  };

  const getSubstitutionForPeriod = (teacherId, period) => {
    return substitutions.find(sub => 
      sub.absentTeacher._id === teacherId && sub.period === period
    );
  };

  const handleAllocateClick = (absentTeacher, scheduleEntry, existingSubstitution = null) => {
    onAllocateSubstitute({
      absentTeacher,
      scheduleEntry,
      date: selectedDate,
      existingSubstitution
    });
  };

  if (!selectedDate) {
    return (
      <div style={{
        backgroundColor: '#fff3cd',
        color: '#856404',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #ffeaa7',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0 }}>Please select a date to view absent teachers.</p>
      </div>
    );
  }

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
        <p style={{ marginTop: '1rem', color: '#666' }}>Loading absent teachers...</p>
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
          Error loading data
        </div>
        <p style={{ color: '#666', marginBottom: '1rem' }}>{error}</p>
        <button
          onClick={fetchAbsentTeachersData}
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
      </div>
    );
  }

  if (absentTeachers.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{ color: 'var(--success-700)', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PartyPopper size={20} /> Great News!
        </div>
        <p style={{ color: '#666' }}>
          No teachers are marked absent for {new Date(selectedDate).toLocaleDateString()}.
        </p>
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
        borderBottom: '1px solid #dee2e6'
      }}>
        <h3 style={{ margin: 0 }}>
          Absent Teachers ({absentTeachers.length})
        </h3>
        <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
          {new Date(selectedDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Absent Teachers List */}
      <div style={{ padding: '1rem' }}>
        {absentTeachers.map((attendanceRecord, index) => {
          const teacher = attendanceRecord.teacher;
          const schedule = getTeacherSchedule(teacher._id, attendanceRecord.absentPeriods);

          return (
            <div
              key={index}
              style={{
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
                backgroundColor: '#fff5f5'
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
                  <h4 style={{ margin: 0, color: '#dc3545' }}>
                    {teacher.name}
                  </h4>
                  <span style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem'
                  }}>
                    Absent
                  </span>
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>
                  Subjects: {teacher.subjects.join(', ')}
                </div>
              </div>

              {/* Schedule */}
              {schedule.length === 0 ? (
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '4px',
                  textAlign: 'center',
                  color: '#666'
                }}>
                  No scheduled classes for this day
                </div>
              ) : (
                <div>
                  <div style={{ 
                    fontWeight: 'bold', 
                    marginBottom: '0.5rem',
                    color: '#495057'
                  }}>
                    Scheduled Classes:
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '0.5rem'
                  }}>
                    {schedule
                      .sort((a, b) => a.period - b.period)
                      .map((scheduleEntry, scheduleIndex) => {
                        const substitution = getSubstitutionForPeriod(teacher._id, scheduleEntry.period);
                        const hasCoverage = !!substitution;

                        return (
                          <div
                            key={scheduleIndex}
                            style={{
                              border: '1px solid #dee2e6',
                              borderRadius: '4px',
                              padding: '0.75rem',
                              backgroundColor: hasCoverage ? '#d4edda' : '#fff3cd'
                            }}
                          >
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '0.5rem'
                            }}>
                              <div style={{ fontWeight: 'bold' }}>
                                Period {scheduleEntry.period}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                {scheduleEntry.startTime} - {scheduleEntry.endTime}
                              </div>
                            </div>
                            
                            <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                              <div><strong>Class:</strong> {scheduleEntry.class}</div>
                              <div><strong>Subject:</strong> {scheduleEntry.subject}</div>
                            </div>

                            {hasCoverage ? (
                              <div>
                                <div style={{
                                  backgroundColor: '#28a745',
                                  color: 'white',
                                  padding: '0.5rem',
                                  borderRadius: '4px',
                                  fontSize: '0.8rem',
                                  textAlign: 'center',
                                  marginBottom: '0.5rem'
                                }}>
                                  <CheckCircle size={16} style={{ marginRight: '0.25rem' }} /> Covered by {substitution.substituteTeacher.name}
                                </div>
                                <button
                                  onClick={() => handleAllocateClick(teacher, scheduleEntry, substitution)}
                                  style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    backgroundColor: '#17a2b8',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  Change Substitute
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleAllocateClick(teacher, scheduleEntry)}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  backgroundColor: '#ffc107',
                                  color: '#212529',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: 'bold'
                                }}
                              >
                                Allocate Substitute
                              </button>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

AbsentTeacherList.propTypes = {
  selectedDate: PropTypes.string.isRequired,
  onAllocateSubstitute: PropTypes.func.isRequired
};

export default AbsentTeacherList;
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from './LoadingSpinner';
import { teachersAPI, attendanceAPI, substitutionsAPI } from '../services/api';
import './PeriodAttendanceForm.css';

const PeriodAttendanceForm = ({ selectedDate, onAttendanceSubmitted }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);
  const [absentPeriods, setAbsentPeriods] = useState([]);
  const [selectedSubstitutes, setSelectedSubstitutes] = useState({});
  const [freeTeachers, setFreeTeachers] = useState({});
  const [loadingFreeTeachers, setLoadingFreeTeachers] = useState({});
  const [allocatingSubstitutes, setAllocatingSubstitutes] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (selectedDate) {
      fetchTeachers();
      // Reset teacher selection and schedule when date changes
      setSelectedTeacher(null);
      setScheduleData(null);
      setAbsentPeriods([]);
      setSelectedSubstitutes({});
      setFreeTeachers({});
    }
  }, [selectedDate]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await teachersAPI.getAll();
      const teachersList = response.data.data.teachers || [];
      setTeachers(teachersList);
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to load teachers';
      setError(errorMessage);
      toast.showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSelect = async (teacher) => {
    setSelectedTeacher(teacher);
    setScheduleData(null);
    setAbsentPeriods([]);
    setSelectedSubstitutes({});
    setFreeTeachers({});
    
    try {
      setLoadingSchedule(true);
      const response = await attendanceAPI.getScheduleWithAttendance(teacher._id, selectedDate);
      const data = response.data.data;
      setScheduleData(data);
      
      // Set initial absent periods from existing attendance
      setAbsentPeriods(data.absentPeriods || []);
      
      // Load free teachers for already absent periods
      if (data.absentPeriods && data.absentPeriods.length > 0) {
        for (const period of data.absentPeriods) {
          await fetchFreeTeachersForPeriod(teacher._id, period, data.day);
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to load schedule';
      toast.showError(errorMessage);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const fetchFreeTeachersForPeriod = async (absentTeacherId, period, day) => {
    const key = period;
    setLoadingFreeTeachers(prev => ({ ...prev, [key]: true }));
    
    try {
      const response = await teachersAPI.getFree(selectedDate, period, day);
      const availableTeachers = response.data.data.teachers || [];
      
      // Filter out the absent teacher
      const filteredTeachers = availableTeachers.filter(t => t._id !== absentTeacherId);
      
      setFreeTeachers(prev => ({
        ...prev,
        [period]: filteredTeachers
      }));
    } catch (err) {
      console.error(`Failed to fetch free teachers for period ${period}:`, err);
      toast.showError(`Failed to load available teachers for period ${period}`);
    } finally {
      setLoadingFreeTeachers(prev => ({ ...prev, [key]: false }));
    }
  };

  const handlePeriodToggle = async (period) => {
    const isCurrentlyAbsent = absentPeriods.includes(period);
    
    if (isCurrentlyAbsent) {
      // Remove from absent periods
      setAbsentPeriods(prev => prev.filter(p => p !== period));
      // Clear substitute selection for this period
      setSelectedSubstitutes(prev => {
        const updated = { ...prev };
        delete updated[period];
        return updated;
      });
      // Clear free teachers for this period
      setFreeTeachers(prev => {
        const updated = { ...prev };
        delete updated[period];
        return updated;
      });
    } else {
      // Add to absent periods
      setAbsentPeriods(prev => [...prev, period].sort((a, b) => a - b));
      // Load free teachers for this period
      if (scheduleData) {
        await fetchFreeTeachersForPeriod(selectedTeacher._id, period, scheduleData.day);
      }
    }
  };

  const handleMarkAllAbsent = async () => {
    if (!scheduleData || !scheduleData.schedule) return;
    
    const allPeriods = scheduleData.schedule.map(s => s.period);
    setAbsentPeriods(allPeriods);
    
    // Load free teachers for all periods
    for (const entry of scheduleData.schedule) {
      await fetchFreeTeachersForPeriod(selectedTeacher._id, entry.period, scheduleData.day);
    }
  };

  const handleMarkAllPresent = () => {
    setAbsentPeriods([]);
    setSelectedSubstitutes({});
    setFreeTeachers({});
  };

  const handleSelectSubstitute = (period, substituteId) => {
    setSelectedSubstitutes(prev => ({
      ...prev,
      [period]: substituteId
    }));
  };

  const handleAllocateSubstitute = async (period, scheduleEntry) => {
    const substituteId = selectedSubstitutes[period];
    
    if (!substituteId) {
      toast.showWarning('Please select a substitute teacher first');
      return;
    }

    const key = period;
    setAllocatingSubstitutes(prev => ({ ...prev, [key]: true }));

    try {
      await substitutionsAPI.create(
        selectedTeacher._id,
        substituteId,
        selectedDate,
        period,
        scheduleEntry.class,
        scheduleEntry.subject
      );

      const substituteName = freeTeachers[period]?.find(t => t._id === substituteId)?.name;
      toast.showSuccess(`Substitute allocated: ${substituteName} for Period ${period}`);
      
      // Mark as allocated by clearing the free teachers list
      setFreeTeachers(prev => ({
        ...prev,
        [period]: []
      }));
    } catch (err) {
      console.error('Allocation error:', err);
      const errorMessage = err.response?.data?.error?.message || 'Failed to allocate substitute';
      toast.showError(errorMessage);
    } finally {
      setAllocatingSubstitutes(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleSaveAttendance = async () => {
    if (!selectedTeacher) {
      toast.showError('Please select a teacher first');
      return;
    }

    try {
      setSaving(true);
      
      await attendanceAPI.markPeriodAttendance(
        selectedTeacher._id,
        selectedDate,
        absentPeriods
      );

      if (absentPeriods.length === 0) {
        toast.showSuccess(`${selectedTeacher.name} marked as present for all periods`);
      } else if (absentPeriods.length === 8) {
        toast.showSuccess(`${selectedTeacher.name} marked as absent for full day`);
      } else {
        toast.showSuccess(`${selectedTeacher.name} marked as absent for ${absentPeriods.length} period(s)`);
      }

      // Reset selection
      setSelectedTeacher(null);
      setScheduleData(null);
      setAbsentPeriods([]);
      setSelectedSubstitutes({});
      setFreeTeachers({});

      if (onAttendanceSubmitted) {
        onAttendanceSubmitted();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to save attendance';
      toast.showError(errorMessage);
    } finally {
      setSaving(false);
    }
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
        <p style={{ margin: 0 }}>Please select a date to record attendance.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{
        backgroundColor: '#fff3cd',
        color: '#856404',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #ffeaa7',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0 }}>Administrator privileges required to record attendance.</p>
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
        <p style={{ marginTop: '1rem', color: '#666' }}>Loading teachers...</p>
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
          onClick={fetchTeachers}
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
        <h3 style={{ margin: 0 }}>Period-Based Attendance</h3>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>
          Select a teacher to mark attendance for specific periods
        </p>
      </div>

      <div style={{ padding: '1.5rem' }}>
        {/* Teacher Selection */}
        {!selectedTeacher ? (
          <div>
            <h4 style={{ marginTop: 0, color: 'var(--color-text-primary)' }}>Select Teacher:</h4>
            <div className="teacher-grid">
              {teachers.map(teacher => (
                <button
                  key={teacher._id}
                  onClick={() => handleTeacherSelect(teacher)}
                  className="teacher-card"
                >
                  <div className="teacher-card-name">
                    {teacher.name}
                  </div>
                  <div className="teacher-card-subjects">
                    {teacher.subjects.join(', ')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {/* Selected Teacher Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              padding: '1rem',
              backgroundColor: '#e7f3ff',
              borderRadius: '8px'
            }}>
              <div>
                <h4 style={{ margin: 0 }}>{selectedTeacher.name}</h4>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#666' }}>
                  Subjects: {selectedTeacher.subjects.join(', ')}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedTeacher(null);
                  setScheduleData(null);
                  setAbsentPeriods([]);
                  setSelectedSubstitutes({});
                  setFreeTeachers({});
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ← Back to Teacher List
              </button>
            </div>

            {/* Loading Schedule */}
            {loadingSchedule && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <LoadingSpinner />
                <p style={{ marginTop: '1rem', color: '#666' }}>Loading schedule...</p>
              </div>
            )}

            {/* Schedule with Period Attendance */}
            {scheduleData && !loadingSchedule && (
              <div>
                {/* Quick Actions */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <button
                    onClick={handleMarkAllAbsent}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Mark All Periods Absent
                  </button>
                  <button
                    onClick={handleMarkAllPresent}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Mark All Periods Present
                  </button>
                </div>

                {/* Schedule List */}
                {scheduleData.schedule.length === 0 ? (
                  <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    color: '#666'
                  }}>
                    No classes scheduled for {scheduleData.day}
                  </div>
                ) : (
                  <div style={{ marginBottom: '1.5rem' }}>
                    {scheduleData.schedule.map((entry) => {
                      const isAbsent = absentPeriods.includes(entry.period);
                      const isLoading = loadingFreeTeachers[entry.period];
                      const availableTeachers = freeTeachers[entry.period] || [];
                      const selectedSubId = selectedSubstitutes[entry.period];
                      const isAllocating = allocatingSubstitutes[entry.period];
                      const isAllocated = isAbsent && availableTeachers.length === 0 && freeTeachers[entry.period] !== undefined;

                      return (
                        <div
                          key={entry.period}
                          className="period-item"
                          style={{
                            borderColor: isAbsent ? '#dc3545' : '#28a745',
                            borderWidth: '2px',
                            backgroundColor: isAbsent ? '#fff5f5' : '#f8fff8'
                          }}
                        >
                          {/* Period Header with Checkbox */}
                          <div className="period-header">
                            <input
                              type="checkbox"
                              className="period-checkbox"
                              checked={isAbsent}
                              onChange={() => handlePeriodToggle(entry.period)}
                            />
                            <div className="period-info">
                              <div className="period-title">
                                Period {entry.period} ({entry.startTime} - {entry.endTime})
                              </div>
                              <div className="period-details">
                                Class: {entry.class} | Subject: {entry.subject}
                              </div>
                            </div>
                            <div className={`period-status-badge ${isAbsent ? 'absent' : 'present'}`}>
                              {isAbsent ? 'ABSENT' : 'PRESENT'}
                            </div>
                          </div>

                          {/* Substitute Selection (only if absent) */}
                          {isAbsent && (
                            <div style={{
                              marginTop: '0.75rem',
                              padding: '0.75rem',
                              backgroundColor: 'white',
                              borderRadius: '4px',
                              border: '1px solid #ffc107'
                            }}>
                              {isAllocated ? (
                                <div style={{
                                  padding: '0.75rem',
                                  backgroundColor: '#d4edda',
                                  border: '1px solid #c3e6cb',
                                  borderRadius: '4px',
                                  color: '#155724',
                                  textAlign: 'center'
                                }}>
                                  ✅ Substitute already allocated for this period
                                </div>
                              ) : isLoading ? (
                                <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                                  <LoadingSpinner size="small" />
                                  <span style={{ marginLeft: '0.5rem', color: '#666' }}>
                                    Loading available teachers...
                                  </span>
                                </div>
                              ) : availableTeachers.length === 0 ? (
                                <div style={{
                                  padding: '0.75rem',
                                  backgroundColor: '#f8d7da',
                                  border: '1px solid #f5c6cb',
                                  borderRadius: '4px',
                                  color: '#721c24',
                                  textAlign: 'center',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.5rem'
                                }}>
                                  <AlertTriangle size={16} /> No teachers available for this period
                                </div>
                              ) : (
                                <div>
                                  <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: 'bold',
                                    fontSize: '0.875rem'
                                  }}>
                                    Select Substitute Teacher:
                                  </label>
                                  <select
                                    value={selectedSubId || ''}
                                    onChange={(e) => handleSelectSubstitute(entry.period, e.target.value)}
                                    disabled={isAllocating}
                                    style={{
                                      width: '100%',
                                      padding: '0.5rem',
                                      marginBottom: '0.5rem',
                                      border: '1px solid #ced4da',
                                      borderRadius: '4px',
                                      fontSize: '0.875rem'
                                    }}
                                  >
                                    <option value="">-- Select a teacher --</option>
                                    {availableTeachers.map(t => (
                                      <option key={t._id} value={t._id}>
                                        {t.name} ({t.subjects.join(', ')})
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => handleAllocateSubstitute(entry.period, entry)}
                                    disabled={!selectedSubId || isAllocating}
                                    style={{
                                      width: '100%',
                                      padding: '0.5rem',
                                      backgroundColor: !selectedSubId || isAllocating ? '#6c757d' : '#28a745',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: !selectedSubId || isAllocating ? 'not-allowed' : 'pointer',
                                      fontWeight: 'bold',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '0.5rem'
                                    }}
                                  >
                                    {isAllocating && <LoadingSpinner size="small" />}
                                    {isAllocating ? 'Allocating...' : 'Allocate Substitute'}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Save Button */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '1rem',
                  paddingTop: '1rem',
                  borderTop: '2px solid #dee2e6'
                }}>
                  <button
                    onClick={handleSaveAttendance}
                    disabled={saving}
                    style={{
                      padding: '0.75rem 2rem',
                      backgroundColor: saving ? '#6c757d' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {saving && <LoadingSpinner size="small" />}
                    {saving ? 'Saving Attendance...' : 'Save Attendance'}
                  </button>
                </div>

                {/* Summary */}
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <strong>Summary:</strong> {absentPeriods.length === 0 ? (
                    <span className="summary-present"> Present for all periods</span>
                  ) : absentPeriods.length === scheduleData.schedule.length ? (
                    <span className="summary-absent-full"> Absent for all {absentPeriods.length} periods (Full Day)</span>
                  ) : (
                    <span className="summary-absent-partial">
                      {' '}Absent for {absentPeriods.length} period(s): {absentPeriods.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

PeriodAttendanceForm.propTypes = {
  selectedDate: PropTypes.string.isRequired,
  onAttendanceSubmitted: PropTypes.func
};

export default PeriodAttendanceForm;

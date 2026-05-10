import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Calendar, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from './LoadingSpinner';
import { teachersAPI, attendanceAPI, timetableAPI, substitutionsAPI } from '../services/api';

const AttendanceForm = ({ selectedDate, onAttendanceSubmitted }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [teachers, setTeachers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [absentTeacherSchedules, setAbsentTeacherSchedules] = useState({});
  const [freeTeachers, setFreeTeachers] = useState({}); // { teacherId: { period: [freeTeachers] } }
  const [selectedSubstitutes, setSelectedSubstitutes] = useState({}); // { teacherId: { period: substituteId } }
  const [loadingFreeTeachers, setLoadingFreeTeachers] = useState({});
  const [allocatingSubstitutes, setAllocatingSubstitutes] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (selectedDate) {
      fetchTeachersAndAttendance();
    }
  }, [selectedDate]);

  const fetchTeachersAndAttendance = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all teachers
      const teachersResponse = await teachersAPI.getAll();
      const teachersList = teachersResponse.data.data.teachers || [];
      setTeachers(teachersList);

      // Fetch existing attendance for the selected date
      const attendanceResponse = await attendanceAPI.getAll({ date: selectedDate });
      const attendanceRecords = attendanceResponse.data.data.attendance || [];

      // Create attendance map with existing data
      const attendanceMap = {};
      teachersList.forEach(teacher => {
        const existingRecord = attendanceRecords.find(record => 
          record.teacher._id === teacher._id
        );
        attendanceMap[teacher._id] = existingRecord ? existingRecord.status : 'present';
      });

      setAttendance(attendanceMap);
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to load data';
      setError(errorMessage);
      toast.showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = async (teacherId, status) => {
    setAttendance(prev => ({
      ...prev,
      [teacherId]: status
    }));

    // If marking as absent, auto-submit attendance and fetch teacher's schedule
    if (status === 'absent') {
      try {
        // First, submit attendance for this teacher
        await attendanceAPI.create(teacherId, selectedDate, status);
        toast.showInfo(`${teachers.find(t => t._id === teacherId)?.name} marked as absent`);

        const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
        const response = await timetableAPI.getAll({ teacher: teacherId, day: dayOfWeek });
        const schedule = response.data.data.timetable || [];
        
        setAbsentTeacherSchedules(prev => ({
          ...prev,
          [teacherId]: schedule
        }));

        // Fetch free teachers for each period
        if (schedule.length > 0) {
          toast.showInfo(`Loading available substitutes for ${schedule.length} period(s)...`);
          
          const freeTeachersMap = {};
          for (const entry of schedule) {
            await fetchFreeTeachersForPeriod(teacherId, entry.period, dayOfWeek, freeTeachersMap);
          }
        }
      } catch (err) {
        console.error('Failed to process absence:', err);
        console.error('Error response:', err.response?.data);
        
        // Show the actual error message from the server
        let errorMessage = 'Failed to mark teacher as absent. Please try again.';
        if (err.response?.data?.error?.message) {
          errorMessage = err.response.data.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        toast.showError(errorMessage);
        
        // Revert the attendance status
        setAttendance(prev => ({
          ...prev,
          [teacherId]: 'present'
        }));
      }
    } else {
      // If marking as present, submit attendance and clear their schedule
      try {
        await attendanceAPI.create(teacherId, selectedDate, status);
        toast.showInfo(`${teachers.find(t => t._id === teacherId)?.name} marked as present`);
        
        setAbsentTeacherSchedules(prev => {
          const updated = { ...prev };
          delete updated[teacherId];
          return updated;
        });
        setFreeTeachers(prev => {
          const updated = { ...prev };
          delete updated[teacherId];
          return updated;
        });
        setSelectedSubstitutes(prev => {
          const updated = { ...prev };
          delete updated[teacherId];
          return updated;
        });
      } catch (err) {
        console.error('Failed to mark as present:', err);
        
        // Show the actual error message from the server
        let errorMessage = 'Failed to update attendance. Please try again.';
        if (err.response?.data?.error?.message) {
          errorMessage = err.response.data.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        toast.showError(errorMessage);
      }
    }
  };

  const fetchFreeTeachersForPeriod = async (absentTeacherId, period, day, freeTeachersMap) => {
    const key = `${absentTeacherId}-${period}`;
    setLoadingFreeTeachers(prev => ({ ...prev, [key]: true }));
    
    try {
      const response = await teachersAPI.getFree(selectedDate, period, day);
      const availableTeachers = response.data.data.teachers || [];
      
      // Filter out the absent teacher from the list
      const filteredTeachers = availableTeachers.filter(t => t._id !== absentTeacherId);
      
      setFreeTeachers(prev => ({
        ...prev,
        [absentTeacherId]: {
          ...(prev[absentTeacherId] || {}),
          [period]: filteredTeachers
        }
      }));
      
      if (freeTeachersMap) {
        freeTeachersMap[period] = filteredTeachers;
      }
    } catch (err) {
      console.error(`Failed to fetch free teachers for period ${period}:`, err);
      toast.showError(`Failed to load available teachers for period ${period}`);
    } finally {
      setLoadingFreeTeachers(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleSelectSubstitute = (absentTeacherId, period, substituteId) => {
    setSelectedSubstitutes(prev => ({
      ...prev,
      [absentTeacherId]: {
        ...(prev[absentTeacherId] || {}),
        [period]: substituteId
      }
    }));
  };

  const handleAllocateSubstitute = async (absentTeacherId, period, scheduleEntry) => {
    const substituteId = selectedSubstitutes[absentTeacherId]?.[period];
    
    if (!substituteId) {
      toast.showWarning('Please select a substitute teacher first');
      return;
    }

    const key = `${absentTeacherId}-${period}`;
    setAllocatingSubstitutes(prev => ({ ...prev, [key]: true }));

    try {
      console.log('Allocating substitute with params:', {
        absentTeacherId,
        substituteId,
        date: selectedDate,
        period,
        className: scheduleEntry.class,
        subject: scheduleEntry.subject
      });

      const response = await substitutionsAPI.create(
        absentTeacherId,
        substituteId,
        selectedDate,
        period,
        scheduleEntry.class,
        scheduleEntry.subject
      );

      console.log('Allocation successful:', response.data);

      const substituteName = freeTeachers[absentTeacherId]?.[period]?.find(t => t._id === substituteId)?.name;
      toast.showSuccess(`Substitute allocated: ${substituteName} for Period ${period}`);
      
      // Mark as allocated by clearing the free teachers list
      setFreeTeachers(prev => ({
        ...prev,
        [absentTeacherId]: {
          ...prev[absentTeacherId],
          [period]: [] // Clear to show it's been allocated
        }
      }));
    } catch (err) {
      console.error('Allocation error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error message:', err.message);
      
      // Show the actual error message from the server
      let errorMessage = 'Failed to allocate substitute';
      if (err.response?.data?.error?.message) {
        errorMessage = err.response.data.error.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.showError(errorMessage);
    } finally {
      setAllocatingSubstitutes(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate) {
      toast.showError('Please select a date first');
      return;
    }

    try {
      setSubmitting(true);
      
      // Submit attendance for teachers who haven't been auto-submitted yet
      // (Only teachers marked present need to be submitted, absent ones are already submitted)
      const promises = teachers
        .filter(teacher => attendance[teacher._id] === 'present')
        .map(teacher => 
          attendanceAPI.create(teacher._id, selectedDate, attendance[teacher._id])
        );

      if (promises.length > 0) {
        await Promise.all(promises);
        toast.showSuccess(`Attendance recorded for ${promises.length} teacher(s)`);
      } else {
        toast.showInfo('All attendance already recorded');
      }
      
      if (onAttendanceSubmitted) {
        onAttendanceSubmitted();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to submit attendance';
      toast.showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getAttendanceSummary = () => {
    const present = Object.values(attendance).filter(status => status === 'present').length;
    const absent = Object.values(attendance).filter(status => status === 'absent').length;
    return { present, absent, total: teachers.length };
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
        <p style={{ marginTop: '1rem', color: '#666' }}>Loading teachers and attendance...</p>
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
          onClick={fetchTeachersAndAttendance}
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

  const summary = getAttendanceSummary();

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      {/* Header with Summary */}
      <div style={{
        padding: '1rem 1.5rem',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Teacher Attendance</h3>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
            <span style={{ color: '#28a745' }}>Present: {summary.present}</span>
            <span style={{ color: '#dc3545' }}>Absent: {summary.absent}</span>
            <span style={{ color: '#666' }}>Total: {summary.total}</span>
          </div>
        </div>
      </div>

      {/* Teacher List */}
      <div style={{ padding: '1rem' }}>
        {teachers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            No teachers found. Please add teachers first.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            {teachers.map(teacher => (
              <div
                key={teacher._id}
                style={{
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  padding: '1rem',
                  backgroundColor: attendance[teacher._id] === 'absent' ? '#fff5f5' : '#f8fff8'
                }}
              >
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {teacher.name}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    Subjects: {teacher.subjects.join(', ')}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleAttendanceChange(teacher._id, 'present')}
                    disabled={submitting}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: attendance[teacher._id] === 'present' ? '#28a745' : '#e9ecef',
                      color: attendance[teacher._id] === 'present' ? 'white' : '#495057',
                      border: attendance[teacher._id] === 'present' ? '2px solid #28a745' : '1px solid #ced4da',
                      borderRadius: '4px',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: attendance[teacher._id] === 'present' ? 'bold' : 'normal'
                    }}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => handleAttendanceChange(teacher._id, 'absent')}
                    disabled={submitting}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: attendance[teacher._id] === 'absent' ? '#dc3545' : '#e9ecef',
                      color: attendance[teacher._id] === 'absent' ? 'white' : '#495057',
                      border: attendance[teacher._id] === 'absent' ? '2px solid #dc3545' : '1px solid #ced4da',
                      borderRadius: '4px',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: attendance[teacher._id] === 'absent' ? 'bold' : 'normal'
                    }}
                  >
                    Absent
                  </button>
                </div>

                {/* Show schedule when marked absent */}
                {attendance[teacher._id] === 'absent' && absentTeacherSchedules[teacher._id] && (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '4px'
                  }}>
                    <div style={{ 
                      fontWeight: 'bold', 
                      fontSize: '0.875rem', 
                      marginBottom: '0.5rem',
                      color: 'var(--warning-800)'
                    }}>
                      <Calendar size={18} style={{ marginRight: '0.5rem' }} /> Scheduled Periods Today - Select Substitutes:
                    </div>
                    {absentTeacherSchedules[teacher._id].length === 0 ? (
                      <div style={{ fontSize: '0.875rem', color: '#666' }}>
                        ✅ No periods scheduled for today - No substitution needed
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.875rem' }}>
                        {absentTeacherSchedules[teacher._id].map((entry, idx) => {
                          const key = `${teacher._id}-${entry.period}`;
                          const isLoading = loadingFreeTeachers[key];
                          const isAllocating = allocatingSubstitutes[key];
                          const availableTeachers = freeTeachers[teacher._id]?.[entry.period] || [];
                          const selectedSubId = selectedSubstitutes[teacher._id]?.[entry.period];
                          const isAllocated = availableTeachers.length === 0 && freeTeachers[teacher._id]?.[entry.period] !== undefined;

                          return (
                            <div key={idx} style={{ 
                              padding: '0.75rem',
                              marginBottom: '0.5rem',
                              backgroundColor: 'white',
                              borderRadius: '4px',
                              border: isAllocated ? '2px solid #28a745' : '1px solid #ffc107'
                            }}>
                              <div style={{ marginBottom: '0.5rem' }}>
                                <strong>Period {entry.period}</strong> ({entry.startTime} - {entry.endTime})
                                <br />
                                <span style={{ color: '#666' }}>
                                  Class: {entry.class} | Subject: {entry.subject}
                                </span>
                              </div>

                              {isAllocated ? (
                                <div style={{
                                  padding: '0.5rem',
                                  backgroundColor: '#d4edda',
                                  border: '1px solid #c3e6cb',
                                  borderRadius: '4px',
                                  color: '#155724',
                                  fontSize: '0.875rem'
                                }}>
                                  ✅ Substitute allocated successfully!
                                </div>
                              ) : isLoading ? (
                                <div style={{ 
                                  padding: '0.5rem',
                                  textAlign: 'center',
                                  color: '#666'
                                }}>
                                  <LoadingSpinner size="small" />
                                  <span style={{ marginLeft: '0.5rem' }}>Loading available teachers...</span>
                                </div>
                              ) : availableTeachers.length === 0 ? (
                                <div style={{
                                  padding: '0.5rem',
                                  backgroundColor: '#f8d7da',
                                  border: '1px solid #f5c6cb',
                                  borderRadius: '4px',
                                  color: '#721c24',
                                  fontSize: '0.875rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem'
                                }}>
                                  <AlertTriangle size={16} /> No teachers available for this period
                                </div>
                              ) : (
                                <div>
                                  <label style={{ 
                                    display: 'block',
                                    marginBottom: '0.25rem',
                                    fontWeight: 'bold',
                                    fontSize: '0.875rem'
                                  }}>
                                    Select Substitute Teacher:
                                  </label>
                                  <select
                                    value={selectedSubId || ''}
                                    onChange={(e) => handleSelectSubstitute(teacher._id, entry.period, e.target.value)}
                                    disabled={isAllocating}
                                    style={{
                                      width: '100%',
                                      padding: '0.5rem',
                                      marginBottom: '0.5rem',
                                      border: '1px solid #ced4da',
                                      borderRadius: '4px',
                                      fontSize: '0.875rem',
                                      cursor: isAllocating ? 'not-allowed' : 'pointer'
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
                                    onClick={() => handleAllocateSubstitute(teacher._id, entry.period, entry)}
                                    disabled={!selectedSubId || isAllocating}
                                    style={{
                                      width: '100%',
                                      padding: '0.5rem',
                                      backgroundColor: !selectedSubId || isAllocating ? '#6c757d' : '#28a745',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: !selectedSubId || isAllocating ? 'not-allowed' : 'pointer',
                                      fontSize: '0.875rem',
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
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        {teachers.length > 0 && (
          <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #dee2e6' }}>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: submitting ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: '0 auto'
              }}
            >
              {submitting && <LoadingSpinner size="small" />}
              {submitting ? 'Submitting Attendance...' : 'Submit Attendance'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

AttendanceForm.propTypes = {
  selectedDate: PropTypes.string.isRequired,
  onAttendanceSubmitted: PropTypes.func
};

export default AttendanceForm;
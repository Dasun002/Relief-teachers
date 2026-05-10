import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import TeacherForm from '../components/TeacherForm';
import TeacherList from '../components/TeacherList';
import { teachersAPI } from '../services/api';

const TeacherManagementPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await teachersAPI.getAll();
      setTeachers(response.data.data.teachers || []);
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to load teachers';
      setError(errorMessage);
      toast.showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (teacherData) => {
    try {
      setSubmitting(true);
      const response = await teachersAPI.create(teacherData);
      const newTeacher = response.data.data.teacher;
      
      setTeachers(prev => [...prev, newTeacher]);
      toast.showSuccess(`Teacher "${newTeacher.name}" added successfully!`);
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to add teacher';
      toast.showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #ffeaa7',
          textAlign: 'center'
        }}>
          <h2 style={{ margin: '0 0 0.5rem 0' }}>Access Denied</h2>
          <p style={{ margin: 0 }}>
            You need administrator privileges to access teacher management.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #eee'
      }}>
        <h1 style={{ margin: '0 0 0.5rem 0' }}>Teacher Management</h1>
        <p style={{ color: '#666', margin: 0 }}>
          Add and manage teachers in the system
        </p>
      </div>

      {/* Add Teacher Form */}
      <TeacherForm 
        onSubmit={handleAddTeacher}
        loading={submitting}
      />

      {/* Teachers List */}
      <TeacherList 
        teachers={teachers}
        loading={loading}
        error={error}
      />

      {/* Refresh Button */}
      {error && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
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
            Retry Loading Teachers
          </button>
        </div>
      )}
    </div>
  );
};

export default TeacherManagementPage;
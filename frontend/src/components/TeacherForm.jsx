import { useState } from 'react';
import PropTypes from 'prop-types';
import LoadingSpinner from './LoadingSpinner';

const TeacherForm = ({ onSubmit, loading = false }) => {
  const [name, setName] = useState('');
  const [subjects, setSubjects] = useState(['']);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (name.trim().length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    // Validate subjects
    const validSubjects = subjects.filter(subject => subject.trim());
    if (validSubjects.length === 0) {
      newErrors.subjects = 'At least one subject is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const validSubjects = subjects.filter(subject => subject.trim());
      onSubmit({
        name: name.trim(),
        subjects: validSubjects
      });
    }
  };

  const addSubject = () => {
    setSubjects([...subjects, '']);
  };

  const removeSubject = (index) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const updateSubject = (index, value) => {
    const newSubjects = [...subjects];
    newSubjects[index] = value;
    setSubjects(newSubjects);
  };

  const resetForm = () => {
    setName('');
    setSubjects(['']);
    setErrors({});
  };

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '2rem'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Add New Teacher</h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="name" style={{ 
            display: 'block', 
            marginBottom: '0.5rem',
            fontWeight: 'bold'
          }}>
            Teacher Name *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: errors.name ? '2px solid #dc3545' : '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
            placeholder="Enter teacher's full name"
          />
          {errors.name && (
            <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.name}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem',
            fontWeight: 'bold'
          }}>
            Subjects *
          </label>
          {subjects.map((subject, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '0.5rem' 
            }}>
              <input
                type="text"
                value={subject}
                onChange={(e) => updateSubject(index, e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  marginRight: '0.5rem'
                }}
                placeholder={`Subject ${index + 1}`}
              />
              {subjects.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSubject(index)}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addSubject}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              marginTop: '0.5rem'
            }}
          >
            Add Subject
          </button>
          {errors.subjects && (
            <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {errors.subjects}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: loading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {loading && <LoadingSpinner size="small" />}
            {loading ? 'Adding Teacher...' : 'Add Teacher'}
          </button>
          
          <button
            type="button"
            onClick={resetForm}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem'
            }}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

TeacherForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default TeacherForm;
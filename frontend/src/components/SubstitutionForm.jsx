import { useState } from 'react';
import PropTypes from 'prop-types';
import { Info } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from './LoadingSpinner';
import { substitutionsAPI } from '../services/api';
import { formatDate, formatTime } from '../utils/dateUtils';

const SubstitutionForm = ({ allocationData, onSuccess, onCancel }) => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  const { absentTeacher, scheduleEntry, substituteTeacher, date, existingSubstitution } = allocationData;
  const isUpdate = !!existingSubstitution;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      if (isUpdate) {
        // Update existing substitution
        await substitutionsAPI.update(
          existingSubstitution._id,
          { substituteTeacherId: substituteTeacher._id }
        );
        showSuccess(`Successfully changed substitute to ${substituteTeacher.name}`);
      } else {
        // Create new substitution
        await substitutionsAPI.create(
          absentTeacher._id,
          substituteTeacher._id,
          date,
          scheduleEntry.period,
          scheduleEntry.class,
          scheduleEntry.subject
        );
        showSuccess(`Successfully allocated ${substituteTeacher.name} to cover ${absentTeacher.name}'s class`);
      }

      onSuccess();

    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to allocate substitute';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
          {isUpdate ? 'Change Substitute Teacher' : 'Confirm Substitution Allocation'}
        </h3>
        <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
          {isUpdate 
            ? 'Select a new substitute teacher to replace the current one'
            : 'Please review the details before confirming the allocation'
          }
        </p>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
        {/* Date and Period Info */}
        <div style={{
          backgroundColor: '#e3f2fd',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#1976d2' }}>
            Class Details
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <strong>Date:</strong> {formatDate(date)}
            </div>
            <div>
              <strong>Period:</strong> {scheduleEntry.period}
            </div>
            <div>
              <strong>Time:</strong> {formatTime(scheduleEntry.startTime)} - {formatTime(scheduleEntry.endTime)}
            </div>
            <div>
              <strong>Class:</strong> {scheduleEntry.class}
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <strong>Subject:</strong> {scheduleEntry.subject}
            </div>
          </div>
        </div>

        {/* Teacher Information */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {/* Absent Teacher */}
          <div style={{
            border: '1px solid #dc3545',
            borderRadius: '8px',
            padding: '1rem',
            backgroundColor: '#fff5f5'
          }}>
            <h5 style={{ margin: '0 0 0.5rem 0', color: '#dc3545' }}>
              Absent Teacher
            </h5>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {absentTeacher.name}
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>
              Subjects: {absentTeacher.subjects.join(', ')}
            </div>
          </div>

          {/* Substitute Teacher */}
          <div style={{
            border: '1px solid #28a745',
            borderRadius: '8px',
            padding: '1rem',
            backgroundColor: '#f8fff8'
          }}>
            <h5 style={{ margin: '0 0 0.5rem 0', color: '#28a745' }}>
              Substitute Teacher
            </h5>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {substituteTeacher.name}
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>
              Subjects: {substituteTeacher.subjects.join(', ')}
            </div>
          </div>
        </div>

        {/* Substitution Notice */}
        <div style={{
          backgroundColor: '#e8f5e9',
          border: '1px solid #a5d6a7',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ color: 'var(--success-700)', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Info size={18} /> Substitution Information
          </div>
          <p style={{ margin: 0, color: '#2e7d32', fontSize: '0.9rem' }}>
            Any available teacher can substitute for this class. Subject expertise is not required for substitution.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end',
          paddingTop: '1rem',
          borderTop: '1px solid #dee2e6'
        }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              opacity: loading ? 0.6 : 1
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              opacity: loading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {loading && <LoadingSpinner size="small" />}
            {loading ? (isUpdate ? 'Changing...' : 'Allocating...') : (isUpdate ? 'Confirm Change' : 'Confirm Allocation')}
          </button>
        </div>
      </form>
    </div>
  );
};

SubstitutionForm.propTypes = {
  allocationData: PropTypes.shape({
    absentTeacher: PropTypes.object.isRequired,
    scheduleEntry: PropTypes.object.isRequired,
    substituteTeacher: PropTypes.object.isRequired,
    date: PropTypes.string.isRequired
  }).isRequired,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default SubstitutionForm;
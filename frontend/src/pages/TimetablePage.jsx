import { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import TimetableFilters from '../components/TimetableFilters';
import TimetableGrid from '../components/TimetableGrid';
import TimetableImport from '../components/TimetableImport';
import { timetableAPI } from '../services/api';

const TimetablePage = () => {
  const toast = useToast();
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFilters, setCurrentFilters] = useState({
    class: '',
    teacher: '',
    day: '',
    period: ''
  });

  useEffect(() => {
    fetchTimetable();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [timetableEntries, currentFilters]);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await timetableAPI.getAll();
      const entries = response.data.data.timetable || [];
      setTimetableEntries(entries);
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to load timetable';
      setError(errorMessage);
      toast.showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...timetableEntries];

    // Apply class filter
    if (currentFilters.class) {
      filtered = filtered.filter(entry => entry.class === currentFilters.class);
    }

    // Apply teacher filter
    if (currentFilters.teacher) {
      filtered = filtered.filter(entry => 
        entry.teacher && entry.teacher._id === currentFilters.teacher
      );
    }

    // Apply day filter
    if (currentFilters.day) {
      filtered = filtered.filter(entry => entry.day === currentFilters.day);
    }

    // Apply period filter
    if (currentFilters.period) {
      filtered = filtered.filter(entry => 
        entry.period === parseInt(currentFilters.period)
      );
    }

    setFilteredEntries(filtered);
  };

  const handleFilterChange = (filters) => {
    setCurrentFilters(filters);
  };

  const handleImportSuccess = (importResult) => {
    // Refresh the timetable after successful import
    console.log('Import success, refreshing timetable...');
    fetchTimetable();
    
    // Show success toast (already shown in TimetableImport component)
    // toast.showSuccess(`Import completed: ${importResult.summary?.imported || 0} new entries, ${importResult.summary?.updated || 0} updated`);
  };

  const handleClearTimetable = async () => {
    if (!window.confirm('Are you sure you want to delete ALL timetable entries? This action cannot be undone!')) {
      return;
    }

    try {
      setLoading(true);
      const response = await timetableAPI.deleteAll();
      
      toast.showSuccess(`Timetable cleared: ${response.data.data.deletedCount} entries deleted`);
      
      // Refresh the timetable list
      fetchTimetable();
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to clear timetable';
      toast.showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getActiveFiltersCount = () => {
    return Object.values(currentFilters).filter(value => value !== '').length;
  };

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #eee'
      }}>
        <h1 style={{ margin: '0 0 0.5rem 0' }}>Timetable</h1>
        <p style={{ color: '#666', margin: 0 }}>
          View and filter the school timetable
        </p>
      </div>

      {/* Import Component */}
      <TimetableImport onImportSuccess={handleImportSuccess} />

      {/* Clear Timetable Button */}
      {!loading && timetableEntries.length > 0 && (
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong>Danger Zone:</strong> Clear all timetable entries from the database
          </div>
          <button
            onClick={handleClearTimetable}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}
          >
            Clear All Timetable
          </button>
        </div>
      )}

      {/* Filters */}
      <TimetableFilters 
        onFilterChange={handleFilterChange}
        loading={loading}
      />

      {/* Filter Summary */}
      {getActiveFiltersCount() > 0 && (
        <div style={{
          backgroundColor: '#e3f2fd',
          border: '1px solid #2196f3',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Active Filters ({getActiveFiltersCount()}):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {currentFilters.class && (
              <span style={{
                backgroundColor: '#2196f3',
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.875rem'
              }}>
                Class: {currentFilters.class}
              </span>
            )}
            {currentFilters.teacher && (
              <span style={{
                backgroundColor: '#2196f3',
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.875rem'
              }}>
                Teacher: {currentFilters.teacher}
              </span>
            )}
            {currentFilters.day && (
              <span style={{
                backgroundColor: '#2196f3',
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.875rem'
              }}>
                Day: {currentFilters.day}
              </span>
            )}
            {currentFilters.period && (
              <span style={{
                backgroundColor: '#2196f3',
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.875rem'
              }}>
                Period: {currentFilters.period}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Results Summary */}
      {!loading && !error && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '0.75rem 1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          Showing {filteredEntries.length} of {timetableEntries.length} timetable entries
        </div>
      )}

      {/* Timetable Grid */}
      <TimetableGrid 
        timetableEntries={filteredEntries}
        loading={loading}
        error={error}
      />

      {/* Refresh Button */}
      {error && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            onClick={fetchTimetable}
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
            Retry Loading Timetable
          </button>
        </div>
      )}
    </div>
  );
};

export default TimetablePage;
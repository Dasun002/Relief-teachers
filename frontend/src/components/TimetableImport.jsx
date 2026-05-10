import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { FileText, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from './LoadingSpinner';
import { timetableAPI } from '../services/api';

const TimetableImport = ({ onImportSuccess }) => {
  const { user } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importProgress, setImportProgress] = useState('');
  const [progressPercentage, setProgressPercentage] = useState(0);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.xml')) {
        toast.showError('Please select an XML file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.showError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.showError('Please select an XML file first');
      return;
    }

    try {
      setImporting(true);
      setImportResult(null);
      setImportProgress('Uploading file...');
      setProgressPercentage(0);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);

      console.log('Uploading file:', selectedFile.name);
      setImportProgress('Processing XML file...');
      setProgressPercentage(33);

      // Call the import API with FormData
      const response = await fetch('http://localhost:5000/api/timetable/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
          // Don't set Content-Type - browser will set it with boundary for multipart/form-data
        },
        body: formData
      });

      console.log('Response status:', response.status);
      setImportProgress('Parsing response...');
      setProgressPercentage(66);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Import error response:', errorData);
        throw new Error(errorData.error?.message || 'Import failed');
      }

      const result = await response.json();
      console.log('Import result:', result);
      console.log('Import result.data:', result.data);
      console.log('Import result.data type:', typeof result.data);
      
      setImportProgress('Import completed!');
      setProgressPercentage(100);
      setImportResult(result.data);
      
      // Show detailed success message
      const summary = result.data.summary;
      if (summary) {
        toast.showSuccess(
          `Import completed! ${summary.imported || 0} new entries, ${summary.updated || 0} updated, ${summary.errors || 0} errors`
        );
      } else {
        toast.showSuccess('Timetable imported successfully!');
      }
      
      // Clear the selected file
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Notify parent component
      if (onImportSuccess) {
        onImportSuccess(result.data);
      }

    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error.message || 'Failed to import timetable';
      setImportProgress('Import failed');
      setProgressPercentage(0);
      toast.showError(errorMessage);
    } finally {
      setImporting(false);
      // Clear progress after a delay
      setTimeout(() => {
        setImportProgress('');
        setProgressPercentage(0);
      }, 3000);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isAdmin) {
    return (
      <div style={{
        backgroundColor: '#fff3cd',
        color: '#856404',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #ffeaa7',
        textAlign: 'center',
        marginBottom: '1.5rem'
      }}>
        <p style={{ margin: 0 }}>
          Administrator privileges required to import timetables.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '1.5rem'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Import Timetable</h3>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Upload an XML file exported from aSc Timetables software to import the school timetable.
        </p>

        {/* File Input */}
        <div style={{ marginBottom: '1rem' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xml"
            onChange={handleFileSelect}
            disabled={importing}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '2px dashed #ddd',
              borderRadius: '4px',
              backgroundColor: importing ? '#f8f9fa' : 'white',
              cursor: importing ? 'not-allowed' : 'pointer'
            }}
          />
        </div>

        {/* Selected File Info */}
        {selectedFile && (
          <div style={{
            backgroundColor: '#e3f2fd',
            border: '1px solid #2196f3',
            borderRadius: '4px',
            padding: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 'bold' }}>{selectedFile.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  Size: {(selectedFile.size / 1024).toFixed(1)} KB
                </div>
              </div>
              <button
                onClick={clearFile}
                disabled={importing}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: importing ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Import Button */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleImport}
            disabled={!selectedFile || importing}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: (!selectedFile || importing) ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (!selectedFile || importing) ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {importing && <LoadingSpinner size="small" />}
            {importing ? 'Importing...' : 'Import Timetable'}
          </button>
        </div>
      </div>

      {/* Import Progress/Result */}
      {importing && (
        <div style={{
          backgroundColor: '#e3f2fd',
          border: '2px solid #2196f3',
          borderRadius: '8px',
          padding: '1.5rem',
          marginTop: '1rem',
          animation: 'pulse 1.5s ease-in-out infinite'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <LoadingSpinner size="small" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1976d2' }}>
                Importing Timetable...
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                {importProgress || 'Processing...'}
              </div>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1976d2' }}>
              {progressPercentage}%
            </div>
          </div>
          
          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '24px',
            backgroundColor: '#fff',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '1rem',
            border: '1px solid #2196f3'
          }}>
            <div style={{
              width: `${progressPercentage}%`,
              height: '100%',
              backgroundColor: '#2196f3',
              transition: 'width 0.3s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}>
              {progressPercentage > 10 && `${progressPercentage}%`}
            </div>
          </div>

          <div style={{
            backgroundColor: '#fff',
            borderRadius: '4px',
            padding: '0.75rem',
            fontSize: '0.85rem',
            color: '#666'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <FileText size={18} /> File: {selectedFile?.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={18} /> Size: {(selectedFile?.size / 1024).toFixed(1)} KB
            </div>
            <div style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>
              Please wait while we process your timetable...
            </div>
          </div>
        </div>
      )}

      {/* Import Result */}
      {importResult && importResult.summary && (
        <div style={{
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          padding: '1rem',
          marginTop: '1rem'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#155724' }}>
            Import Completed Successfully!
          </h4>
          
          <div style={{ fontSize: '0.9rem', color: '#155724' }}>
            <div style={{ marginBottom: '0.25rem' }}>
              <strong>Summary:</strong>
            </div>
            <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
              <li>Total entries processed: {importResult.summary?.total || 0}</li>
              <li>New entries imported: {importResult.summary?.imported || 0}</li>
              <li>Existing entries updated: {importResult.summary?.updated || 0}</li>
              <li>Errors encountered: {importResult.summary?.errors || 0}</li>
            </ul>
          </div>

          {/* Show errors if any */}
          {importResult.errors && Array.isArray(importResult.errors) && importResult.errors.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#721c24' }}>
                Errors ({importResult.errors.length}):
              </div>
              <div style={{
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb',
                borderRadius: '4px',
                padding: '0.5rem',
                maxHeight: '150px',
                overflowY: 'auto'
              }}>
                {importResult.errors.map((error, index) => (
                  <div key={index} style={{ 
                    fontSize: '0.8rem', 
                    color: '#721c24',
                    marginBottom: '0.25rem'
                  }}>
                    {typeof error === 'string' ? error : JSON.stringify(error)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '1rem',
        marginTop: '1rem'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Instructions:</h4>
        <ol style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
          <li>Export your timetable from aSc Timetables as an XML file</li>
          <li>Select the XML file using the file input above</li>
          <li>Click "Import Timetable" to upload and process the file</li>
          <li>The system will automatically create teachers and timetable entries</li>
          <li>Existing entries will be updated if they already exist</li>
        </ol>
      </div>
    </div>
  );
};

TimetableImport.propTypes = {
  onImportSuccess: PropTypes.func
};

export default TimetableImport;
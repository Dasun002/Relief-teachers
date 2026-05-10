import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ClipboardList, Search, Download } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from './LoadingSpinner';
import { substitutionsAPI } from '../services/api';
import { formatDate } from '../utils/dateUtils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './SubstitutionSummary.css';

const SubstitutionSummary = ({ selectedDate }) => {
  const { showError, showSuccess } = useToast();
  const [substitutions, setSubstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [classFilter, setClassFilter] = useState('');
  const [availableClasses, setAvailableClasses] = useState([]);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const fetchSubstitutions = useCallback(async () => {
    if (!selectedDate) return;
    
    try {
      setLoading(true);
      setError(null);

      const response = await substitutionsAPI.getAll({ date: selectedDate });
      const substitutionsList = response.data.data.substitutions || [];

      setSubstitutions(substitutionsList);

      // Extract unique classes for filter
      const classes = [...new Set(substitutionsList.map(sub => sub.class))].sort();
      setAvailableClasses(classes);

    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to load substitutions';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, showError]);

  useEffect(() => {
    fetchSubstitutions();
  }, [fetchSubstitutions]);

  // Filter and sort substitutions
  const filteredSubstitutions = substitutions
    .filter(sub => !classFilter || sub.class === classFilter)
    .sort((a, b) => {
      // Sort by period first, then by class
      if (a.period !== b.period) {
        return parseInt(a.period) - parseInt(b.period);
      }
      return a.class.localeCompare(b.class);
    });

  // Generate PDF function
  const generatePDF = () => {
    try {
      setGeneratingPDF(true);

      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Anuruddha Balika Vidyalaya', 105, 15, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text('Teachers for the Relief Periods', 105, 23, { align: 'center' });
      
      // Add date
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${formatDate(selectedDate)}`, 14, 32);
      
      // Add filter info if applied
      if (classFilter) {
        doc.text(`Class: ${classFilter}`, 14, 38);
      }

      // Prepare table data
      const tableData = filteredSubstitutions.map(sub => [
        `Period ${sub.period}`,
        sub.class,
        sub.subject,
        sub.absentTeacher.name,
        sub.substituteTeacher.name,
        '' // Empty signature column
      ]);

      // Generate table using autoTable
      autoTable(doc, {
        startY: classFilter ? 42 : 38,
        head: [['Period', 'Class', 'Subject', 'Absent Teacher', 'Substitute Teacher', 'Signature']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [98, 125, 152], // Primary color
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center'
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
          overflow: 'linebreak',
          halign: 'left'
        },
        columnStyles: {
          0: { cellWidth: 25, halign: 'center' }, // Period
          1: { cellWidth: 20, halign: 'center' }, // Class
          2: { cellWidth: 35 }, // Subject
          3: { cellWidth: 40 }, // Absent Teacher
          4: { cellWidth: 40 }, // Substitute Teacher
          5: { cellWidth: 30, halign: 'center' } // Signature
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { top: 10, left: 14, right: 14 }
      });

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text(
          `Generated on ${new Date().toLocaleString()}`,
          14,
          doc.internal.pageSize.height - 10
        );
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width - 30,
          doc.internal.pageSize.height - 10
        );
      }

      // Save PDF
      const fileName = `Substitution_Summary_${selectedDate.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);

      showSuccess('PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF generation error:', err);
      showError('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (!selectedDate) {
    return (
      <div className="substitution-summary-warning">
        <p>Please select a date to view substitutions summary.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="substitution-summary-loading">
        <LoadingSpinner />
        <p>Loading substitutions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="substitution-summary-error">
        <div className="error-title">Error loading substitutions</div>
        <p>{error}</p>
        <button onClick={fetchSubstitutions} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="substitution-summary-container">
      {/* Header */}
      <div className="substitution-summary-header">
        <div>
          <h3>Substitutions Summary ({substitutions.length})</h3>
          <p className="summary-date">{formatDate(selectedDate)}</p>
        </div>
        
        <div className="header-actions">
          {/* Class Filter */}
          {availableClasses.length > 0 && (
            <div className="class-filter">
              <label>Filter by class:</label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <option value="">All Classes</option>
                {availableClasses.map(className => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* PDF Download Button */}
          {filteredSubstitutions.length > 0 && (
            <button
              onClick={generatePDF}
              disabled={generatingPDF}
              className="pdf-download-button"
              title="Download PDF"
            >
              <Download size={18} />
              {generatingPDF ? 'Generating...' : 'Download PDF'}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="substitution-summary-content">
        {substitutions.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={48} />
            <h4>No Substitutions</h4>
            <p>No substitute teachers have been allocated for this date.</p>
          </div>
        ) : filteredSubstitutions.length === 0 ? (
          <div className="empty-state">
            <Search size={48} />
            <h4>No Results</h4>
            <p>No substitutions found for class "{classFilter}".</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="substitution-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Class</th>
                  <th>Subject</th>
                  <th>Absent Teacher</th>
                  <th>Substitute Teacher</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubstitutions.map((substitution, index) => (
                  <tr key={index}>
                    <td className="period-cell" data-label="Period">
                      <span className="period-badge">Period {substitution.period}</span>
                    </td>
                    <td className="class-cell" data-label="Class">
                      <strong>{substitution.class}</strong>
                    </td>
                    <td className="subject-cell" data-label="Subject">{substitution.subject}</td>
                    <td className="absent-teacher-cell" data-label="Absent Teacher">
                      <span className="teacher-name absent">
                        {substitution.absentTeacher.name}
                      </span>
                    </td>
                    <td className="substitute-teacher-cell" data-label="Substitute Teacher">
                      <span className="teacher-name substitute">
                        {substitution.substituteTeacher.name}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

SubstitutionSummary.propTypes = {
  selectedDate: PropTypes.string.isRequired
};

export default SubstitutionSummary;
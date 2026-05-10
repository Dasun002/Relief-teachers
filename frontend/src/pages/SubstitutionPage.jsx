import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import DatePicker from '../components/DatePicker';
import AbsentTeacherList from '../components/AbsentTeacherList';
import FreeTeacherList from '../components/FreeTeacherList';
import SubstitutionForm from '../components/SubstitutionForm';
import SubstitutionSummary from '../components/SubstitutionSummary';
import { formatDateISO, isWeekday } from '../utils/dateUtils';
import './SubstitutionPage.css';

const SubstitutionPage = () => {
  const { user } = useAuth();
  const { showWarning } = useToast();
  const [selectedDate, setSelectedDate] = useState(formatDateISO(new Date()));
  const [activeTab, setActiveTab] = useState('absent');
  const [allocationFlow, setAllocationFlow] = useState({
    step: null, // 'selectTeacher' | 'confirmAllocation'
    data: null
  });

  const isAdmin = user?.role === 'admin';

  const handleDateChange = (date) => {
    const dateStr = formatDateISO(date);
    setSelectedDate(dateStr);
    
    // Reset allocation flow when date changes
    setAllocationFlow({ step: null, data: null });

    // Show warning for weekends
    if (!isWeekday(date)) {
      showWarning('Selected date is a weekend. Schools typically operate on weekdays.');
    }
  };

  const handleAllocateSubstitute = (allocationData) => {
    if (!isAdmin) {
      showWarning('Only administrators can allocate substitute teachers.');
      return;
    }

    setAllocationFlow({
      step: 'selectTeacher',
      data: allocationData
    });
  };

  const handleSelectTeacher = (teacher) => {
    setAllocationFlow({
      step: 'confirmAllocation',
      data: {
        ...allocationFlow.data,
        substituteTeacher: teacher
      }
    });
  };

  const handleAllocationSuccess = () => {
    // Reset flow and refresh data
    setAllocationFlow({ step: null, data: null });
    
    // Force refresh by updating a key or triggering re-render
    // The AbsentTeacherList will automatically refresh when the allocation flow resets
  };

  const handleCancelAllocation = () => {
    setAllocationFlow({ step: null, data: null });
  };

  const renderAllocationFlow = () => {
    if (!allocationFlow.step) return null;

    switch (allocationFlow.step) {
      case 'selectTeacher':
        return (
          <div style={{ marginBottom: '2rem' }}>
            <FreeTeacherList
              selectedDate={selectedDate}
              period={allocationFlow.data.scheduleEntry.period}
              onSelectTeacher={handleSelectTeacher}
              onCancel={handleCancelAllocation}
            />
          </div>
        );

      case 'confirmAllocation':
        return (
          <div style={{ marginBottom: '2rem' }}>
            <SubstitutionForm
              allocationData={allocationFlow.data}
              onSuccess={handleAllocationSuccess}
              onCancel={handleCancelAllocation}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="substitution-page">
      {/* Header */}
      <div className="substitution-header">
        <h1 className="substitution-title">Teacher Substitutions</h1>
        <p className="substitution-subtitle">
          Manage teacher absences and allocate substitute teachers
        </p>
      </div>

      {/* Date Selector */}
      <div className="substitution-date-selector">
        <div className="substitution-date-selector-content">
          <label className="substitution-date-label">
            Select Date:
          </label>
          <DatePicker
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />
        </div>
      </div>

      {/* Allocation Flow (Modal-like overlay) */}
      {allocationFlow.step && (
        <div className="substitution-modal-overlay">
          <div className="substitution-modal-content">
            {renderAllocationFlow()}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="substitution-tabs">
        <button
          onClick={() => setActiveTab('absent')}
          className={`substitution-tab ${activeTab === 'absent' ? 'active' : ''}`}
        >
          Absent Teachers
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`substitution-tab ${activeTab === 'summary' ? 'active' : ''}`}
        >
          Substitutions Summary
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'absent' && (
        <AbsentTeacherList
          selectedDate={selectedDate}
          onAllocateSubstitute={handleAllocateSubstitute}
          key={`absent-${selectedDate}-${allocationFlow.step}`} // Force refresh after allocation
        />
      )}

      {activeTab === 'summary' && (
        <SubstitutionSummary
          selectedDate={selectedDate}
          key={`summary-${selectedDate}-${allocationFlow.step}`} // Force refresh after allocation
        />
      )}

      {/* Admin Notice */}
      {!isAdmin && (
        <div className="substitution-admin-notice">
          <p>
            <strong>Note:</strong> Only administrators can allocate substitute teachers. 
            You can view absent teachers and substitution summaries.
          </p>
        </div>
      )}
    </div>
  );
};

export default SubstitutionPage;
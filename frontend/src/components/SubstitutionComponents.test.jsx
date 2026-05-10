import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../contexts/ToastContext';
import FreeTeacherList from './FreeTeacherList';
import SubstitutionForm from './SubstitutionForm';
import SubstitutionSummary from './SubstitutionSummary';

// Mock API calls
vi.mock('../services/api', () => ({
  teachersAPI: {
    getFree: vi.fn(() => Promise.resolve({ data: { data: { teachers: [] } } }))
  },
  substitutionsAPI: {
    create: vi.fn(() => Promise.resolve({ data: { data: { substitution: {} } } })),
    getAll: vi.fn(() => Promise.resolve({ data: { data: { substitutions: [] } } }))
  }
}));

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ToastProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ToastProvider>
  </BrowserRouter>
);

describe('Substitution Components', () => {
  it('should render FreeTeacherList without crashing', () => {
    const mockProps = {
      selectedDate: '2024-01-15',
      period: 1,
      onSelectTeacher: vi.fn(),
      onCancel: vi.fn()
    };

    expect(() => {
      render(
        <TestWrapper>
          <FreeTeacherList {...mockProps} />
        </TestWrapper>
      );
    }).not.toThrow();
  });

  it('should render SubstitutionForm without crashing', () => {
    const mockProps = {
      allocationData: {
        absentTeacher: { _id: '1', name: 'John Doe', subjects: ['Math'] },
        scheduleEntry: { 
          period: 1, 
          class: '10A', 
          subject: 'Math',
          startTime: '09:00',
          endTime: '10:00'
        },
        substituteTeacher: { _id: '2', name: 'Jane Smith', subjects: ['Math'] },
        date: '2024-01-15'
      },
      onSuccess: vi.fn(),
      onCancel: vi.fn()
    };

    expect(() => {
      render(
        <TestWrapper>
          <SubstitutionForm {...mockProps} />
        </TestWrapper>
      );
    }).not.toThrow();
  });

  it('should render SubstitutionSummary without crashing', () => {
    const mockProps = {
      selectedDate: '2024-01-15'
    };

    expect(() => {
      render(
        <TestWrapper>
          <SubstitutionSummary {...mockProps} />
        </TestWrapper>
      );
    }).not.toThrow();
  });
});
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../contexts/ToastContext';
import SubstitutionPage from './SubstitutionPage';

// Mock API calls
vi.mock('../services/api', () => ({
  attendanceAPI: {
    getAll: vi.fn(() => Promise.resolve({ data: { data: { attendance: [] } } }))
  },
  timetableAPI: {
    getAll: vi.fn(() => Promise.resolve({ data: { data: { timetable: [] } } }))
  },
  substitutionsAPI: {
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

describe('SubstitutionPage', () => {
  it('should render without crashing', () => {
    expect(() => {
      render(
        <TestWrapper>
          <SubstitutionPage />
        </TestWrapper>
      );
    }).not.toThrow();
  });

  it('should display the page title', () => {
    render(
      <TestWrapper>
        <SubstitutionPage />
      </TestWrapper>
    );

    expect(screen.getByText('Teacher Substitutions')).toBeInTheDocument();
  });

  it('should display tab navigation', () => {
    render(
      <TestWrapper>
        <SubstitutionPage />
      </TestWrapper>
    );

    expect(screen.getByText('Absent Teachers')).toBeInTheDocument();
    expect(screen.getByText('Substitutions Summary')).toBeInTheDocument();
  });

  it('should display date selector', () => {
    render(
      <TestWrapper>
        <SubstitutionPage />
      </TestWrapper>
    );

    expect(screen.getByText('Select Date:')).toBeInTheDocument();
  });
});
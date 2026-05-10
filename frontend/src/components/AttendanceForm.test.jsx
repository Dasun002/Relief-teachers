import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AttendanceForm from './AttendanceForm';
import * as api from '../services/api';

// Mock the API
vi.mock('../services/api', () => ({
  teachersAPI: {
    getAll: vi.fn()
  },
  attendanceAPI: {
    getAll: vi.fn(),
    create: vi.fn()
  }
}));

// Mock LoadingSpinner
vi.mock('./LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AttendanceForm', () => {
  const mockTeachers = [
    { _id: 't1', name: 'Mrs Perera Pradeepa', subjects: ['General'] },
    { _id: 't2', name: 'Mrs Perera Srima', subjects: ['General'] },
    { _id: 't3', name: 'Pinto Gayathri', subjects: ['General'] }
  ];

  const mockAttendanceRecords = [
    { teacher: { _id: 't1' }, status: 'present', date: '2026-05-09' },
    { teacher: { _id: 't2' }, status: 'absent', date: '2026-05-09' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock AuthContext to return admin user
    vi.mock('../contexts/AuthContext', () => ({
      useAuth: () => ({
        user: { role: 'admin', _id: 'admin123' },
        token: 'mock-token'
      })
    }));

    // Mock ToastContext
    vi.mock('../contexts/ToastContext', () => ({
      useToast: () => ({
        showError: vi.fn(),
        showSuccess: vi.fn(),
        showWarning: vi.fn(),
        showInfo: vi.fn()
      })
    }));
    
    // Default mock implementations
    api.teachersAPI.getAll.mockResolvedValue({
      data: { data: { teachers: mockTeachers } }
    });
    
    api.attendanceAPI.getAll.mockResolvedValue({
      data: { data: { attendance: mockAttendanceRecords } }
    });
    
    api.attendanceAPI.create.mockResolvedValue({
      data: { success: true }
    });
  });

  it('should render attendance form with teachers', async () => {
    renderWithRouter(
      <AttendanceForm selectedDate="2026-05-09" />
    );

    // Should show loading initially
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    // Wait for teachers to load
    await waitFor(() => {
      expect(screen.getByText('Mrs Perera Pradeepa')).toBeInTheDocument();
      expect(screen.getByText('Mrs Perera Srima')).toBeInTheDocument();
      expect(screen.getByText('Pinto Gayathri')).toBeInTheDocument();
    });

    // Should show submit button
    expect(screen.getByText('Submit Attendance')).toBeInTheDocument();
  });

  it('should load existing attendance records', async () => {
    renderWithRouter(
      <AttendanceForm selectedDate="2026-05-09" />
    );

    await waitFor(() => {
      expect(api.teachersAPI.getAll).toHaveBeenCalled();
      expect(api.attendanceAPI.getAll).toHaveBeenCalledWith({ date: '2026-05-09' });
    });
  });

  it('should display attendance summary', async () => {
    renderWithRouter(
      <AttendanceForm selectedDate="2026-05-09" />
    );

    await waitFor(() => {
      expect(screen.getByText(/Present:/)).toBeInTheDocument();
      expect(screen.getByText(/Absent:/)).toBeInTheDocument();
      expect(screen.getByText(/Total: 3/)).toBeInTheDocument();
    });
  });

  it('should allow changing attendance status', async () => {
    renderWithRouter(
      <AttendanceForm selectedDate="2026-05-09" />
    );

    await waitFor(() => {
      expect(screen.getByText('Mrs Perera Pradeepa')).toBeInTheDocument();
    });

    // Find all Present and Absent buttons
    const absentButtons = screen.getAllByText('Absent');
    
    // Click absent button for first teacher
    fireEvent.click(absentButtons[0]);

    // Summary should update
    await waitFor(() => {
      const summaryText = screen.getByText(/Absent:/);
      expect(summaryText).toBeInTheDocument();
    });
  });

  it('should submit attendance successfully', async () => {
    const mockOnSubmitted = vi.fn();
    
    renderWithRouter(
      <AttendanceForm 
        selectedDate="2026-05-09" 
        onAttendanceSubmitted={mockOnSubmitted}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Submit Attendance')).toBeInTheDocument();
    });

    // Click submit button
    const submitButton = screen.getByText('Submit Attendance');
    fireEvent.click(submitButton);

    // Should call API for each teacher
    await waitFor(() => {
      expect(api.attendanceAPI.create).toHaveBeenCalledTimes(3);
      expect(mockOnSubmitted).toHaveBeenCalled();
    });
  });

  it('should handle API errors gracefully', async () => {
    api.teachersAPI.getAll.mockRejectedValue(
      new Error('Failed to load teachers')
    );

    renderWithRouter(
      <AttendanceForm selectedDate="2026-05-09" />
    );

    await waitFor(() => {
      expect(screen.getByText('Error loading data')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('should show warning when no date selected', () => {
    renderWithRouter(
      <AttendanceForm selectedDate="" />
    );

    expect(screen.getByText('Please select a date to record attendance.')).toBeInTheDocument();
  });

  it('should show warning for non-admin users', () => {
    // Override the auth mock for this test
    vi.mock('../contexts/AuthContext', () => ({
      useAuth: () => ({
        user: { role: 'teacher', _id: 'teacher123' },
        token: 'mock-token'
      })
    }));

    renderWithRouter(
      <AttendanceForm selectedDate="2026-05-09" />
    );

    expect(screen.getByText(/Administrator privileges required/)).toBeInTheDocument();
  });

  it('should disable buttons while submitting', async () => {
    // Make the API call slow
    api.attendanceAPI.create.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );

    renderWithRouter(
      <AttendanceForm selectedDate="2026-05-09" />
    );

    await waitFor(() => {
      expect(screen.getByText('Submit Attendance')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Submit Attendance');
    fireEvent.click(submitButton);

    // Button should show submitting state
    await waitFor(() => {
      expect(screen.getByText('Submitting Attendance...')).toBeInTheDocument();
    });
  });

  it('should show empty state when no teachers exist', async () => {
    api.teachersAPI.getAll.mockResolvedValue({
      data: { data: { teachers: [] } }
    });

    renderWithRouter(
      <AttendanceForm selectedDate="2026-05-09" />
    );

    await waitFor(() => {
      expect(screen.getByText('No teachers found. Please add teachers first.')).toBeInTheDocument();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TimetablePage from './TimetablePage';
import * as api from '../services/api';

// Mock the API
vi.mock('../services/api', () => ({
  timetableAPI: {
    getAll: vi.fn()
  }
}));

// Mock the contexts
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { role: 'admin' },
    token: 'mock-token'
  })
}));

vi.mock('../contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn()
  })
}));

// Mock components to avoid complex dependencies
vi.mock('../components/TimetableFilters', () => ({
  default: ({ onFilterChange }) => (
    <div data-testid="timetable-filters">
      <button onClick={() => onFilterChange({ class: '6A' })}>
        Filter by 6A
      </button>
    </div>
  )
}));

vi.mock('../components/TimetableGrid', () => ({
  default: ({ timetableEntries, loading, error }) => (
    <div data-testid="timetable-grid">
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {timetableEntries && (
        <div>Entries: {timetableEntries.length}</div>
      )}
    </div>
  )
}));

vi.mock('../components/TimetableImport', () => ({
  default: ({ onImportSuccess }) => (
    <div data-testid="timetable-import">
      <button onClick={() => onImportSuccess({ summary: { imported: 5, updated: 2 } })}>
        Import Success
      </button>
    </div>
  )
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('TimetablePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render timetable page components', async () => {
    // Mock successful API response
    api.timetableAPI.getAll.mockResolvedValue({
      data: {
        data: {
          timetable: [
            {
              _id: '1',
              class: '6A',
              period: 1,
              day: 'Monday',
              subject: 'Mathematics',
              teacher: { _id: 't1', name: 'John Doe' },
              startTime: '08:00',
              endTime: '08:40'
            }
          ]
        }
      }
    });

    renderWithRouter(<TimetablePage />);

    // Check if main components are rendered
    expect(screen.getByText('Timetable')).toBeInTheDocument();
    expect(screen.getByTestId('timetable-import')).toBeInTheDocument();
    expect(screen.getByTestId('timetable-filters')).toBeInTheDocument();
    expect(screen.getByTestId('timetable-grid')).toBeInTheDocument();

    // Wait for API call to complete
    await waitFor(() => {
      expect(screen.getByText('Entries: 1')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    // Mock API error
    api.timetableAPI.getAll.mockRejectedValue(new Error('Network error'));

    renderWithRouter(<TimetablePage />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    // Mock pending API response
    api.timetableAPI.getAll.mockImplementation(() => new Promise(() => {}));

    renderWithRouter(<TimetablePage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display filter summary when filters are active', async () => {
    // Mock successful API response
    api.timetableAPI.getAll.mockResolvedValue({
      data: {
        data: {
          timetable: [
            {
              _id: '1',
              class: '6A',
              period: 1,
              day: 'Monday',
              subject: 'Mathematics',
              teacher: { _id: 't1', name: 'John Doe' }
            }
          ]
        }
      }
    });

    renderWithRouter(<TimetablePage />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Entries: 1')).toBeInTheDocument();
    });

    // Apply filter
    const filterButton = screen.getByText('Filter by 6A');
    filterButton.click();

    // Check if filter summary appears
    await waitFor(() => {
      expect(screen.getByText(/Active Filters/)).toBeInTheDocument();
      expect(screen.getByText(/Class: 6A/)).toBeInTheDocument();
    });
  });

  it('should handle import success', async () => {
    // Mock successful API response
    api.timetableAPI.getAll.mockResolvedValue({
      data: {
        data: {
          timetable: []
        }
      }
    });

    renderWithRouter(<TimetablePage />);

    // Trigger import success
    const importButton = screen.getByText('Import Success');
    importButton.click();

    // Should trigger a refetch of timetable data
    await waitFor(() => {
      expect(api.timetableAPI.getAll).toHaveBeenCalledTimes(2); // Initial load + refetch after import
    });
  });

  it('should show results summary', async () => {
    // Mock successful API response with multiple entries
    api.timetableAPI.getAll.mockResolvedValue({
      data: {
        data: {
          timetable: [
            { _id: '1', class: '6A', period: 1, day: 'Monday', subject: 'Math', teacher: { name: 'John' } },
            { _id: '2', class: '6B', period: 1, day: 'Monday', subject: 'English', teacher: { name: 'Jane' } }
          ]
        }
      }
    });

    renderWithRouter(<TimetablePage />);

    await waitFor(() => {
      expect(screen.getByText('Showing 2 of 2 timetable entries')).toBeInTheDocument();
    });
  });
});
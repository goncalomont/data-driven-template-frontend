// app/(dashboard)/page.test.tsx
import React from 'react';
import { render, screen } from '../../tests/utils/renderWithProviders';
import { vi } from 'vitest';

// Mock the actual content component to isolate the page structure test
// This prevents testing the internals of DashboardContent here
vi.mock('./DashboardContent', () => ({
  __esModule: true, // Use if it's an ES module
  default: () => <div data-testid="mock-dashboard-content">Mock Dashboard Content</div>,
}));

// Import the Page component *after* mocking its dependencies
import DashboardPage from './page';

describe('Dashboard Page', () => {
  it('should render the DashboardContent component', () => {
    // Render the page component itself
    render(<DashboardPage />);

    // Check if the mocked content component is rendered
    expect(screen.getByTestId('mock-dashboard-content')).toBeInTheDocument();
    expect(screen.getByText('Mock Dashboard Content')).toBeInTheDocument();
  });

  // Add more tests here if the page component itself had more logic,
  // like specific data fetching or parameter handling unique to this page file.
});
// tests/mocks/next-auth.ts
import { vi } from 'vitest';
import type { Session } from 'next-auth';

/**
 * Mocks the 'next-auth/react' module, particularly useSession.
 * Call vi.mock('next-auth/react'); before tests.
 * Use vi.mocked(useSession).mockReturnValue({ data: mockSession, status: 'authenticated' });
 * within individual tests or describe blocks to set the session state.
 */

// You need to explicitly mock the module *before* importing useSession from it
vi.mock('next-auth/react');

// Example mock session data
export const mockUnauthenticatedSession = null;
export const mockAuthenticatedSession: Session = {
  user: {
    name: 'Test User',
    email: 'test@example.com',
    image: null, // Or provide a URL
    id: 'test-user-id', // Add id if your type includes it
  },
  expires: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Example expiry
};


// How to use in tests:
/*
import { vi } from 'vitest';
import { useSession } from 'next-auth/react'; // Import after mocking
import { mockAuthenticatedSession, mockUnauthenticatedSession } from '../mocks/next-auth'; // Adjust path

// Mock the module (if not done globally in setup)
// vi.mock('next-auth/react');

describe('Component requiring auth', () => {
  it('renders welcome message when logged in', () => {
    // Mock useSession for this specific test
    vi.mocked(useSession).mockReturnValue({
      data: mockAuthenticatedSession,
      status: 'authenticated',
      update: vi.fn(),
    });

    render(<MyComponent />);
    expect(screen.getByText(/Welcome, Test User/)).toBeInTheDocument();
  });

   it('renders login button when logged out', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });

    render(<MyComponent />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});
*/
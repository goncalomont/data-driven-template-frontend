// app/layout.test.tsx
import React from 'react';
import { render, screen, waitFor, act } from '../tests/utils/renderWithProviders';
import { vi } from 'vitest';
import type { Session } from 'next-auth';
import RootLayout from './layout';

// Mock the auth function
vi.mock('../auth', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../auth')>();
    return { ...actual, auth: vi.fn() };
});

// Other mocks (fonts, providers) are global in setupTests.ts

describe('RootLayout', () => {
  const mockAuthenticatedSession: Session = {
    user: { name: 'Test User', email: 'test@example.com', id: '123' },
    expires: 'some-future-date',
  };

  beforeEach(() => {
      vi.clearAllMocks();
      document.documentElement.removeAttribute('lang');
      document.documentElement.removeAttribute('class');
      document.documentElement.removeAttribute('data-toolpad-color-scheme');
  });

  it('should render children correctly', async () => {
    const { auth } = await import('../auth');
    vi.mocked<() => Promise<Session | null>>(auth).mockResolvedValue(null);

    let layoutContent: React.ReactNode;
    await act(async () => {
      layoutContent = await RootLayout({
        children: <div data-testid="mock-child">Hello World</div>,
      });
    });
    const element = layoutContent as React.ReactElement;
    render(element);

    await waitFor(() => {
      expect(screen.getByTestId('mock-child')).toBeInTheDocument();
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });
  });

  it('should apply font class and lang to html tag', async () => {
    const { auth } = await import('../auth');
    vi.mocked<() => Promise<Session | null>>(auth).mockResolvedValue(null);

    let layoutContent: React.ReactNode;
    await act(async () => {
      layoutContent = await RootLayout({
        children: <div>Child</div>,
      });
    });
    const element = layoutContent as React.ReactElement;
    render(element);

    const htmlElement = document.documentElement;

    await waitFor(() => {
        expect(htmlElement).not.toBeNull();
    });

    expect(htmlElement).toHaveAttribute('lang', 'en');
    
    expect(htmlElement).toHaveClass('--font-montserrat'); 
 
    expect(htmlElement).toHaveAttribute('data-toolpad-color-scheme', 'light');
  });

  it('should render children correctly when authenticated', async () => {
    const { auth } = await import('../auth');
    vi.mocked<() => Promise<Session | null>>(auth)
      .mockResolvedValue(mockAuthenticatedSession);

    let layoutContent: React.ReactNode;
    await act(async () => {
      layoutContent = await RootLayout({
        children: <div data-testid="mock-child">Authenticated Content</div>,
      });
    });
    const element = layoutContent as React.ReactElement;
    render(element, { session: mockAuthenticatedSession });

    await waitFor(() => {
      expect(screen.getByTestId('mock-child')).toBeInTheDocument();
      expect(screen.getByText('Authenticated Content')).toBeInTheDocument();
    });
  });
});
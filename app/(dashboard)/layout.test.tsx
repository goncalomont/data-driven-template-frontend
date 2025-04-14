// app/(dashboard)/layout.test.tsx
import React from 'react';
import { render, screen } from '../../tests/utils/renderWithProviders';
import { vi } from 'vitest';
import { mockNextNavigation } from '../../tests/mocks/next-navigation';

// --- Mocks for child components ---
vi.mock('./SidebarFooterAccount', () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="mock-sidebar-footer">Mock Sidebar Footer</div>),
  ToolbarAccountOverride: vi.fn(() => null),
}));
vi.mock('../components/Copyright', () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="mock-copyright">Mock Copyright</div>),
}));

// --- Inline Mock for PageContainer ---
vi.mock('@toolpad/core/PageContainer', () => ({
  __esModule: true,
  PageContainer: vi.fn(({ title, children }: { title?: string; children: React.ReactNode }) => {
    return <div data-testid="mock-page-container">{children}</div>;
  }),
}));
// Import the mocked PageContainer so we can inspect its calls.
import { PageContainer as MockedPageContainer } from '@toolpad/core/PageContainer';

// A simple child element to be rendered inside the layout.
const mockChild = <div data-testid="mock-dashboard-child">Dashboard Child Content</div>;

describe('Dashboard Layout', () => {
  // Reset mocks and modules before each test.
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    document.title = '';
  });

  it('should render children and Copyright', async () => {
    // Set up the navigation mock for a base page (pathname: '/')
    vi.doMock('next/navigation', () => mockNextNavigation({ pathname: '/' }));
    // Import the layout component after configuring the mock.
    const { default: DashboardLayoutComponent } = await import('./layout');

    render(<DashboardLayoutComponent>{mockChild}</DashboardLayoutComponent>);

    // Assert that the child content and mocked components are rendered.
    expect(screen.getByTestId('mock-dashboard-child')).toBeInTheDocument();
    expect(screen.getByTestId('mock-copyright')).toBeInTheDocument();
    expect(screen.getByTestId('mock-page-container')).toBeInTheDocument();
  });

  it('should pass correct title prop for employee detail page', async () => {
    // Configure the navigation mock for employee detail page.
    vi.doMock('next/navigation', () =>
      mockNextNavigation({
        pathname: '/employees/5',
        params: { segments: ['employees', '5'] },
      })
    );
    vi.resetModules();
    const { default: DashboardLayoutComponent } = await import('./layout');

    render(<DashboardLayoutComponent>{mockChild}</DashboardLayoutComponent>);

    // Since our mocked PageContainer receives its props as the first argument and context as the second (which is undefined),
    // we assert the title in the first argument and check that the second argument is indeed undefined.
    expect(vi.mocked(MockedPageContainer)).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Employee 5' }),
      undefined
    );
  });

  it('should pass correct title prop for employee edit page', async () => {
    // Configure the navigation mock for employee edit page.
    vi.doMock('next/navigation', () =>
      mockNextNavigation({
        pathname: '/employees/10/edit',
        params: { segments: ['employees', '10', 'edit'] },
      })
    );
    vi.resetModules();
    const { default: DashboardLayoutComponent } = await import('./layout');

    render(<DashboardLayoutComponent>{mockChild}</DashboardLayoutComponent>);

    expect(vi.mocked(MockedPageContainer)).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Employee 10 - Edit' }),
      undefined
    );
  });

  it('should pass correct title prop for new employee page', async () => {
    // Configure the navigation mock for new employee page.
    vi.doMock('next/navigation', () =>
      mockNextNavigation({
        pathname: '/employees/new',
        params: { segments: ['employees', 'new'] },
      })
    );
    vi.resetModules();
    const { default: DashboardLayoutComponent } = await import('./layout');

    render(<DashboardLayoutComponent>{mockChild}</DashboardLayoutComponent>);

    expect(vi.mocked(MockedPageContainer)).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New Employee' }),
      undefined
    );
  });

  it('should pass undefined title prop for base dashboard page', async () => {
    // Configure the navigation mock for the base dashboard page.
    vi.doMock('next/navigation', () =>
      mockNextNavigation({
        pathname: '/',
        params: { segments: [] },
      })
    );
    vi.resetModules();
    const { default: DashboardLayoutComponent } = await import('./layout');

    render(<DashboardLayoutComponent>{mockChild}</DashboardLayoutComponent>);

    // Check the props passed to the last call of PageContainer.
    const calls = vi.mocked(MockedPageContainer).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const lastCallProps = calls[calls.length - 1][0];
    expect(lastCallProps.title).toBeUndefined();
  });
});

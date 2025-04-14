import { vi } from 'vitest';

/**
 * Mocks the 'next/navigation' module.
 * Call vi.mock('next/navigation', () => mockNextNavigation()); in your test file.
 *
 * @param options - Optional overrides for pathname, query, params, etc.
 */
export const mockNextNavigation = (options?: {
  pathname?: string;
  query?: Record<string, string | string[] | undefined>;
  params?: Record<string, string | string[] | undefined>;
  push?: ReturnType<typeof vi.fn>;
  replace?: ReturnType<typeof vi.fn>;
  back?: ReturnType<typeof vi.fn>;
  forward?: ReturnType<typeof vi.fn>;
  prefetch?: ReturnType<typeof vi.fn>;
}) => {
  const routerPush = options?.push ?? vi.fn();
  const routerReplace = options?.replace ?? vi.fn();
  const routerBack = options?.back ?? vi.fn();
  const routerForward = options?.forward ?? vi.fn();
  const routerPrefetch = options?.prefetch ?? vi.fn();

  return {
    useRouter: () => ({
      push: routerPush,
      replace: routerReplace,
      back: routerBack,
      forward: routerForward,
      prefetch: routerPrefetch,
      query: options?.query ?? {},
      pathname: options?.pathname ?? '/',
      asPath: options?.pathname ?? '/', // Simplified
      route: options?.pathname ?? '/', // Simplified
      basePath: '',
      isFallback: false,
      isPreview: false,
      isReady: true,
      reload: vi.fn(),
      events: {
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
      },
    }),
    usePathname: () => options?.pathname ?? '/',
    useSearchParams: () => new URLSearchParams(options?.query as Record<string, string>), // Basic implementation
    useParams: () => options?.params ?? {},
    // Add other exports if needed, e.g., redirect, notFound
    redirect: vi.fn((url: string) => {
      // In tests, you might assert this mock was called with the correct URL
      console.log(`Mock redirect to: ${url}`);
    }),
    notFound: vi.fn(() => {
      // Assert this was called in tests for notFound scenarios
       console.log('Mock notFound called');
    }),
  };
};

// Example Usage in a test file:
// import { vi } from 'vitest';
// import { mockNextNavigation } from '../mocks/next-navigation'; // Adjust path
// vi.mock('next/navigation', () => mockNextNavigation({ pathname: '/dashboard/some-page' }));
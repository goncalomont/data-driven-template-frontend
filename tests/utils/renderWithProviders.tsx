// tests/utils/renderWithProviders.tsx
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { SessionProvider, SessionProviderProps } from 'next-auth/react';
import { NextAppProvider } from '@toolpad/core/nextjs';
// No next-router-mock imports needed here
import theme from '../../theme'; // Adjust path if needed
import type { AppProviderProps } from '@toolpad/core/AppProvider';

// Minimal config for testing
const testBranding: AppProviderProps['branding'] = { title: 'Test App' };
const testNavigation: AppProviderProps['navigation'] = [];
const testAuthentication: AppProviderProps['authentication'] = {
    signIn: async () => { console.log("Mock signIn called"); },
    signOut: async () => { console.log("Mock signOut called"); },
};

// Remove the 'router' option
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: SessionProviderProps['session'];
}

// Define the wrapper component without MemoryRouterProvider or routerOptions
const AllTheProviders: React.FC<{
   children: React.ReactNode;
   session: SessionProviderProps['session'];
}> = ({
  children,
  session,
}) => {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <SessionProvider session={session || null}>
        {/* Use the globally mocked NextAppProvider from setupTests.ts */}
        <NextAppProvider
          theme={theme}
          branding={testBranding}
          navigation={testNavigation}
          session={session || null}
          authentication={testAuthentication}
        >
          {children}
        </NextAppProvider>
      </SessionProvider>
    </AppRouterCacheProvider>
  );
};

// Define the custom render function without router options logic
const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const { session, ...restOptions } = options || {};
  return render(ui, {
    wrapper: (props) => <AllTheProviders {...props} session={session} />,
    ...restOptions,
  });
};

// Re-export everything from testing-library
export * from '@testing-library/react';
// Do NOT re-export from next-router-mock here
// Override the render method with our custom one
export { customRender as render };
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setupTests.ts'],
    include: ['app/**/*.{test,spec}.{ts,tsx}'],
    exclude: [ /* ... keep your excludes as needed ... */ ],
    alias: {
      '@toolpad/core/nextjs': path.resolve(__dirname, 'node_modules/@toolpad/core/nextjs'),
      '@mui/material-nextjs/v15-appRouter': path.resolve(
        __dirname,
        'node_modules/@mui/material-nextjs/v15-appRouter'
      ),
    },
    server: {
      deps: {
        inline: [
          'next-auth',
          '@toolpad/core', // Add other dependencies if necessary
        ],
      },
    },
    testTimeout: 10000,
  },
});

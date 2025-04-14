// tests/setupTests.ts
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Runs cleanup after each test
afterEach(() => {
  cleanup();
});

// Clears mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// --- MOCK EXTERNAL PROVIDERS WITHOUT JSX ---
// Instead of using JSX syntax, we use React.createElement to render children.
vi.mock('@toolpad/core/nextjs', () => ({
  NextAppProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

vi.mock('@mui/material-nextjs/v15-appRouter', () => ({
  AppRouterCacheProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

// --- ORIGINAL GLOBAL MOCKS ---

// Mock localStorage and sessionStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem(key: string): string | null {
      return store[key] ?? null;
    },
    setItem(key: string, value: string) {
      store[key] = value;
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key(index: number): string | null {
      const keys = Object.keys(store);
      return keys[index] ?? null;
    },
  };
})();
vi.stubGlobal('localStorage', localStorageMock);
vi.stubGlobal('sessionStorage', localStorageMock);

// Mock matchMedia
const matchMediaMock = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));
vi.stubGlobal('matchMedia', matchMediaMock);

// Mock next/font/google globally
vi.mock('next/font/google', () => ({
  Montserrat: () => ({
    className: 'mock-montserrat-font',
    variable: '--font-montserrat',
    style: {
      fontFamily: 'mock-montserrat, sans-serif',
    },
  }),
}));

// Mock next/server globally
vi.mock('next/server', () => ({
  NextResponse: {
    next: vi.fn(() => ({
      ok: true,
      status: 200,
      headers: new Headers(),
    })),
    redirect: vi.fn((url: string) => ({
      url,
      status: 307,
      headers: new Headers(),
    })),
    json: vi.fn((data: any) => ({
      json: () => Promise.resolve(data),
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
    })),
  },
  NextRequest: class {
    constructor(input: any) {
      // Minimal implementation for tests
    }
  },
}));

console.log("Test setup file executed: Global mocks applied.");

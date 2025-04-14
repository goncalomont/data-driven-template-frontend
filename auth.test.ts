import { describe, it, expect, vi } from 'vitest';
import { authorizeCredentials, isAuthorized } from './auth'; 
import type { NextURL } from 'next/dist/server/web/next-url';
import type { Session } from 'next-auth';

describe('Authentication Logic (auth.ts)', () => {
  // --- authorizeCredentials ---
  describe('authorizeCredentials (Credentials Provider)', () => {
    it('should return user object for valid credentials', async () => {
      const credentials = {
        email: 'template@devoteam.com',
        password: '@demo1',
      };
      const user = await authorizeCredentials(credentials);
      expect(user).not.toBeNull();
      expect(user?.email).toBe('template@devoteam.com');
      expect(user?.name).toBe('Toolpad Demo');
      expect(user?.id).toBe('test-user-id-creds');
    });

    it('should return null for invalid password', async () => {
      const credentials = {
        email: 'template@devoteam.com',
        password: 'wrongpassword',
      };
      const user = await authorizeCredentials(credentials);
      expect(user).toBeNull();
    });

    it('should return null for invalid email', async () => {
      const credentials = {
        email: 'wrong@devoteam.com',
        password: '@demo1',
      };
      const user = await authorizeCredentials(credentials);
      expect(user).toBeNull();
    });

    it('should return null for missing email', async () => {
      const credentials = { password: '@demo1' };
      const user = await authorizeCredentials(credentials);
      expect(user).toBeNull();
    });

    it('should return null for missing password', async () => {
      const credentials = { email: 'template@devoteam.com' };
      const user = await authorizeCredentials(credentials);
      expect(user).toBeNull();
    });

     it('should return null for empty credentials object', async () => {
      const credentials = {};
      const user = await authorizeCredentials(credentials);
      expect(user).toBeNull();
    });
  });

  // --- isAuthorized (Callback) ---
  describe('isAuthorized (Callback)', () => {
    const mockAuthenticatedSession: Session = {
      user: { name: 'Test', email: 'test@test.com', id: '1' },
      expires: 'date',
    };

    // Helper to create mock request object
    const createMockRequest = (pathname: string): { request: { nextUrl: NextURL } } => ({
      request: {
        // Mock the NextURL object structure expected by the callback
        nextUrl: {
          pathname,
          host: 'localhost:3001',
          hostname: 'localhost',
          port: '3001',
          protocol: 'http:',
          search: '',
          searchParams: new URLSearchParams(),
          hash: '',
          href: `http://localhost:3001${pathname}`,
          // Add other properties if your logic depends on them
        } as NextURL,
      },
    });

    it('should return true if user is logged in (session exists)', () => {
      const result = isAuthorized({
        auth: mockAuthenticatedSession,
        ...createMockRequest('/dashboard'), // Accessing a protected page
      });
      expect(result).toBe(true);
    });

    it('should return false if user is not logged in and accessing protected page', () => {
      const result = isAuthorized({
        auth: null,
        ...createMockRequest('/dashboard/settings'), // Accessing a protected page
      });
      expect(result).toBe(false);
    });

     it('should return true if user is not logged in but accessing a public page', () => {
      const result = isAuthorized({
        auth: null,
        ...createMockRequest('/public/about'), // Accessing a public page
      });
      expect(result).toBe(true);
    });

     it('should return true if user is logged in and accessing a public page', () => {
       const result = isAuthorized({
         auth: mockAuthenticatedSession,
         ...createMockRequest('/public/terms'), // Accessing a public page
       });
       expect(result).toBe(true);
     });

      it('should return false for root path if not logged in and root is not public', () => {
       const result = isAuthorized({
         auth: null,
         ...createMockRequest('/'), // Accessing root
       });
       expect(result).toBe(false); // Assuming '/' is protected
     });
  });
});
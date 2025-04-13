// auth.ts
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import MicrosoftEntraId from 'next-auth/providers/microsoft-entra-id';
import Credentials from 'next-auth/providers/credentials';
import type { Provider } from 'next-auth/providers';

const providers: Provider[] = [
  MicrosoftEntraId({
    clientId: process.env.MICROSOFT_ENTRA_ID_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_ENTRA_ID_CLIENT_SECRET,
    authorization: {
      params: {
        scope: "openid profile email User.Read",
      },
      url: `https://login.microsoftonline.com/${process.env.MICROSOFT_ENTRA_ID_TENANT_ID}/oauth2/v2.0/authorize`
    },
    token: `https://login.microsoftonline.com/${process.env.MICROSOFT_ENTRA_ID_TENANT_ID}/oauth2/v2.0/token`,
    userinfo: `https://graph.microsoft.com/oidc/userinfo`,
  }),
  GitHub({
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  }),
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
  Credentials({
    credentials: {
      email: { label: 'Email Address', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) { // Make sure 'credentials' argument is received

      // Ensure credentials object is not null/undefined before accessing properties
      if (!credentials?.email || !credentials?.password) {
          console.error("[Auth.js Debug] Authorize failed: Missing email or password in credentials object.");
          return null;
      }

      if (credentials.password === '@demo1' && credentials.email === 'template@devoteam.com') {
        const user = {
          id: 'test',
          name: 'Toolpad Demo',
          email: String(credentials.email),
        };

        return user;
      }

      console.log("[Auth.js Debug] Authorize failed: Credentials do not match.");

      return null; // Return null if credentials don't match
    },
  }),
];

export const providerMap = providers.map((provider) => {
  if (typeof provider === 'function') {
    const providerData = provider();
    return { id: providerData.id, name: providerData.name };
  }
  return { id: provider.id, name: provider.name };
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/auth/signin', // Ensure this points to your sign-in page
  },
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {

      // --- REMOVE OR COMMENT OUT THE BYPASS ---
      // console.warn("⚠️ DEVELOPMENT: Authentication TEMPORARILY Bypassed in auth.ts!");
      // return true; // <-- REMOVE THIS LINE
      // --- END OF REMOVAL ---


      // --- THIS IS THE CORRECT LOGIC ---
      const isLoggedIn = !!session?.user;
      // You might want a way to define public pages if needed in the future
      const isPublicPage = nextUrl.pathname.startsWith('/public'); // Example: Adjust if you have public pages

      // Allow access if the user is logged in OR if it's a public page
      if (isPublicPage || isLoggedIn) {
        return true;
      }

      // Otherwise, redirect unauthenticated users to the login page
      return false;
      // --- END OF CORRECT LOGIC ---
    },
  },
});
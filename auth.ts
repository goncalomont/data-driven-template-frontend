// auth.ts
import NextAuth, { NextAuthConfig, Session, User } from 'next-auth';
import type { NextURL } from 'next/dist/server/web/next-url'; // Correct import for NextURL type
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import MicrosoftEntraId from 'next-auth/providers/microsoft-entra-id';
import Credentials from 'next-auth/providers/credentials';
import type { Provider } from 'next-auth/providers';

// --- 1. Exported Authorize Logic for Credentials Provider ---
export async function authorizeCredentials(credentials: Partial<Record<string, unknown>>): Promise<User | null> {
    // Ensure credentials object is not null/undefined before accessing properties
    if (!credentials?.email || !credentials?.password) {
        console.error("[Auth.js Debug] Authorize failed: Missing email or password in credentials object.");
        return null;
    }

    // Check against your specific demo credentials
    if (credentials.password === '@demo1' && credentials.email === 'template@devoteam.com') {
        // Return the user object expected by NextAuth
        const user: User = {
            id: 'demo-user-id-from-creds', // Provide a stable ID for the demo user
            name: 'Toolpad Demo',
            email: String(credentials.email),
            // image: null, // Optional: Add if you have an image URL
        };
        console.log("[Auth.js Debug] Authorize successful for demo user.");
        return user;
    }

    console.log("[Auth.js Debug] Authorize failed: Credentials do not match.");
    // IMPORTANT: Add logic here to verify users against your actual database or identity provider
    // if you are not using only the demo credentials.
    return null; // Return null if credentials don't match or verification fails
}
// --- End Authorize Logic ---


// --- 2. Define Providers ---
const credentialsProvider = Credentials({
    // The name to display on the sign in form (e.g. "Sign in with...")
    name: "Credentials",
    // `credentials` is used to generate a form on the sign-in page.
    credentials: {
        email: { label: 'Email Address', type: 'email', placeholder: 'template@devoteam.com' },
        password: { label: 'Password', type: 'password' },
    },
    // Use the exported, testable function here
    authorize: authorizeCredentials,
});

const providers: Provider[] = [
    // Add your configured OAuth providers
    MicrosoftEntraId({
        clientId: process.env.MICROSOFT_ENTRA_ID_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_ENTRA_ID_CLIENT_SECRET,
        //tenantId: process.env.MICROSOFT_ENTRA_ID_TENANT_ID, // Use tenantId option
        authorization: {
            params: {
                scope: "openid profile email User.Read",
            },
            // The URL generation is usually handled internally if tenantId is provided
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
    // Add the configured Credentials provider
    credentialsProvider,
];
// --- End Providers ---


// --- 3. Provider Map for Sign-In Page ---
export const providerMap = providers.map((provider) => {
    // Handle case where provider is a function (like Credentials)
    if (typeof provider === 'function') {
        const providerData = provider();
        return { id: providerData.id, name: providerData.name };
    }
    // Handle case where provider is an object (like GitHub, Google)
    return { id: provider.id, name: provider.name };
});
// --- End Provider Map ---


// --- 4. Exported Authorized Logic for Callback ---
export function isAuthorized({ auth: session, request: { nextUrl } }: { auth: Session | null, request: { nextUrl: NextURL } }): boolean {
    const isLoggedIn = !!session?.user;

    // --- REMOVE OR COMMENT OUT THE BYPASS ---
    // console.warn("⚠️ DEVELOPMENT: Authentication TEMPORARILY Bypassed in auth.ts!");
    // return true; // <-- REMOVE THIS LINE FOR PRODUCTION
    // --- END OF REMOVAL ---

    // --- THIS IS THE CORRECT LOGIC ---
    // Define which paths are public (accessible without login)
    // Example: Allow access to sign-in page itself, maybe a landing page
    const isPublicPage = nextUrl.pathname.startsWith('/auth/signin') ||
                         nextUrl.pathname.startsWith('/public'); // Add any other public paths

    // Allow access if the user is logged in OR if it's a defined public page
    if (isPublicPage || isLoggedIn) {
        return true;
    }

    // Otherwise, redirect unauthenticated users (returning false triggers redirect to signIn page)
    console.log(`[Auth.js Debug] Unauthorized access attempt to ${nextUrl.pathname}. Redirecting.`);
    return false;
    // --- END OF CORRECT LOGIC ---
}
// --- End Authorized Logic ---


// --- 5. Main NextAuth Configuration ---
export const authConfig: NextAuthConfig = {
    providers, // Use the array of providers defined above
    secret: process.env.AUTH_SECRET, // Essential for production security
    pages: {
        signIn: '/auth/signin', // Custom sign-in page
        // error: '/auth/error', // Optional: Custom error page
        // signOut: '/auth/signout', // Optional: Custom sign-out page
    },
    // Session strategy (jwt is default and recommended)
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        // Use the exported, testable function
        authorized: isAuthorized,

        // Optional: Customize JWT and Session callbacks if needed
        // async jwt({ token, user, account, profile }) {
        //   // Add custom claims to the JWT token
        //   if (account?.provider === 'github' && profile) {
        //      // Example: add GitHub username
        //      token.githubUsername = (profile as any).login;
        //   }
        //   if (user) {
        //       token.id = user.id; // Persist user ID in the token
        //   }
        //   return token;
        // },
        // async session({ session, token }) {
        //   // Add custom properties to the session object from the token
        //   if (token.id && session.user) {
        //       session.user.id = token.id as string;
        //   }
        //   if (token.githubUsername && session.user) {
        //       (session.user as any).githubUsername = token.githubUsername;
        //   }
        //   return session;
        // },
    },
    // Optional: Enable debug messages in development
    // debug: process.env.NODE_ENV === 'development',
};
// --- End Main Configuration ---


// --- 6. Export NextAuth Handlers and Helpers ---
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
// --- End Exports ---
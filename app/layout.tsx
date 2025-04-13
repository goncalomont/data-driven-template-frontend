import * as React from 'react';
import { NextAppProvider } from '@toolpad/core/nextjs';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import type { AppProviderProps, Navigation } from '@toolpad/core/AppProvider';
import { SessionProvider, signIn, signOut } from 'next-auth/react';
import theme from '../theme';
import { auth } from '../auth';
import Image from 'next/image';
import { Metadata } from 'next';
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  variable: "--font-montserrat", // Define CSS variable
  subsets: ["latin"],
  weight: ['300', '400', '500', '700'], // Load required weights
  style: ['normal', 'italic'], // Load normal and italic styles
  display: 'swap', // Improve font loading performance
});

export const metadata: Metadata = {
  title: "Devoteam",
  description: "Next.js app integrated with MUI Toolpad Core using Devoteam branding",
  icons: {
    icon: [
      {
        url: 'icon.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: 'logo-dark.png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  },
};

// Define Branding (Optional, can be customized)
const BRANDING: AppProviderProps['branding'] = {
  title: 'Devoteam',
  logo: <Image src="/logo-light.png" alt="Devoteam Logo" width={40} height={40} />,
};

const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'orders',
    title: 'Orders',
    icon: <ShoppingCartIcon />,
  },
  {
    segment: 'employees',
    title: 'Employees',
    icon: <PersonIcon />,
    pattern: 'employees{/:employeeId}*',
  },
];

const AUTHENTICATION = {
  signIn,
  signOut,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  return (
    <html lang="en" data-toolpad-color-scheme="light" className={montserrat.variable} suppressHydrationWarning>
      <body>
        <SessionProvider session={session}>
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <NextAppProvider
              theme={theme}
              branding={BRANDING}
              navigation={NAVIGATION}
              session={session}
              authentication={AUTHENTICATION}
            >
              {children}
            </NextAppProvider>
          </AppRouterCacheProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

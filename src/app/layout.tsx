import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { GoogleDriveSyncProvider } from '@/context/GoogleDriveSyncContext';

export const viewport: Viewport = {
  themeColor: '#ECE5D8', // Matches the Warm Vintage Linen canvas & navigation header (--pub-bg / --nav-bg)
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
};

const basePath = process.env.NODE_ENV === 'production' ? '/aquavitaeum' : '';

export const metadata: Metadata = {
  title: 'Aqua Vitaeum · Fine Spirits Journal',
  description:
    'A premium fine spirits tasting journal. Record and explore tasting notes for Single Malt Scotch, Bourbon, Rum, Gin, Tequila, and more.',
  icons: {
    icon: [
      { url: `${basePath}/favicon.svg`, type: 'image/svg+xml' },
      { url: `${basePath}/icons/icon-192x192.png`, sizes: '192x192', type: 'image/png' },
      { url: `${basePath}/icons/icon-512x512.png`, sizes: '512x512', type: 'image/png' },
    ],
    shortcut: `${basePath}/favicon.svg`,
    apple: [
      { url: `${basePath}/apple-touch-icon.png`, sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Aqua Vitaeum',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href={`${basePath}/favicon.svg`} />
        <link rel="shortcut icon" href={`${basePath}/favicon.svg`} />
        <link rel="apple-touch-icon" sizes="180x180" href={`${basePath}/apple-touch-icon.png`} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
        >
          {`
            (function() {
              try {
                var theme = localStorage.getItem('av-theme');
                if (theme === 'pub-dark') {
                  document.documentElement.setAttribute('data-theme', 'pub-dark');
                }
              } catch (e) {}
            })();
          `}
        </Script>
        <Script
          id="sw-registration"
          strategy="afterInteractive"
        >
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                var isProd = window.location.hostname !== 'localhost';
                var prefix = isProd ? '/aquavitaeum' : '';
                navigator.serviceWorker.register(prefix + '/sw.js').then(
                  function(reg) {},
                  function(err) {
                    console.warn('Aqua Vitaeum: ServiceWorker registration failed: ', err);
                  }
                );
              });
            }
          `}
        </Script>
        <ThemeProvider>
          <LanguageProvider>
            <GoogleDriveSyncProvider>{children}</GoogleDriveSyncProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

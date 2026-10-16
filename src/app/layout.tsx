import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { GoogleDriveSyncProvider } from '@/context/GoogleDriveSyncContext';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ECE5D8' },
    { media: '(prefers-color-scheme: dark)', color: '#0D1115' },
  ],
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
                  document.documentElement.style.colorScheme = 'dark';
                  document.documentElement.style.backgroundColor = '#0D1115';
                  var metas = document.querySelectorAll('meta[name="theme-color"]');
                  metas.forEach(function(m) {
                    m.removeAttribute('media');
                    m.setAttribute('content', '#0D1115');
                  });
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
              var isLocalhost = Boolean(
                window.location.hostname === 'localhost' ||
                window.location.hostname === '[::1]' ||
                window.location.hostname.match(/^127(?:\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
              );

              if (isLocalhost) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (var i = 0; i < registrations.length; i++) {
                    registrations[i].unregister();
                  }
                });
                if ('caches' in window) {
                  caches.keys().then(function(names) {
                    for (var i = 0; i < names.length; i++) {
                      caches.delete(names[i]);
                    }
                  });
                }
              } else {
                window.addEventListener('load', function() {
                  var prefix = '/aquavitaeum';
                  navigator.serviceWorker.register(prefix + '/sw.js').then(
                    function(reg) {},
                    function(err) {
                      console.warn('Aqua Vitaeum: ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
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

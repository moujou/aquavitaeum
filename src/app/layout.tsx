import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { GoogleDriveSyncProvider } from '@/context/GoogleDriveSyncContext';

export const viewport: Viewport = {
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
      { url: `${basePath}/icons/icon-256x256.png`, sizes: '256x256', type: 'image/png' },
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
        <meta name="theme-color" content="#ECE5D8" id="av-theme-color" />
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
                var isDark = theme === 'pub-dark' || (!theme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
                var targetColor = isDark ? '#0D1115' : '#ECE5D8';
                if (isDark) {
                  document.documentElement.setAttribute('data-theme', 'pub-dark');
                  document.documentElement.style.colorScheme = 'dark';
                  document.documentElement.style.backgroundColor = targetColor;
                } else {
                  document.documentElement.removeAttribute('data-theme');
                  document.documentElement.style.colorScheme = 'light';
                  document.documentElement.style.backgroundColor = targetColor;
                }
                if (document.body) {
                  if (isDark) {
                    document.body.setAttribute('data-theme', 'pub-dark');
                    document.body.style.colorScheme = 'dark';
                    document.body.style.backgroundColor = targetColor;
                  } else {
                    document.body.removeAttribute('data-theme');
                    document.body.style.colorScheme = 'light';
                    document.body.style.backgroundColor = targetColor;
                  }
                }
                var primaryMeta = document.getElementById('av-theme-color');
                var metas = document.querySelectorAll('meta[name="theme-color"]');
                metas.forEach(function(m) {
                  if (primaryMeta && m !== primaryMeta) {
                    m.remove();
                  } else {
                    m.removeAttribute('media');
                    m.setAttribute('content', targetColor);
                  }
                });
                if (!primaryMeta && metas.length > 0) {
                  metas[0].setAttribute('id', 'av-theme-color');
                  metas[0].removeAttribute('media');
                  metas[0].setAttribute('content', targetColor);
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

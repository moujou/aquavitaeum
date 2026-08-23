import type { Metadata, Viewport } from 'next';
import './globals.css';
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
      { url: `${basePath}/whisky-logo-with-circle-v5.svg`, type: 'image/svg+xml' },
    ],
    shortcut: `${basePath}/whisky-logo-with-circle-v5.svg`,
    apple: `${basePath}/whisky-logo-maskable-v5.svg`,
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
        <link rel="icon" type="image/svg+xml" href={`${basePath}/whisky-logo-with-circle-v5.svg`} />
        <link rel="shortcut icon" href={`${basePath}/whisky-logo-with-circle-v5.svg`} />
        <link rel="apple-touch-icon" href={`${basePath}/whisky-logo-maskable-v5.svg`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  const isProd = window.location.hostname !== 'localhost';
                  const prefix = isProd ? '/aquavitaeum' : '';
                  navigator.serviceWorker.register(prefix + '/sw.js').then(
                    function(reg) {

                    },
                    function(err) {
                      console.warn('Aqua Vitaeum: ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <LanguageProvider>
          <GoogleDriveSyncProvider>{children}</GoogleDriveSyncProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

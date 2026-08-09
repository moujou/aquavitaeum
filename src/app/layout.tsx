import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';

export const viewport: Viewport = {
  themeColor: '#311e15', // Matches the refined wood-accent brown
};

export const metadata: Metadata = {
  title: 'Aqua Vitaeum · Fine Spirits Journal',
  description:
    'A premium fine spirits tasting journal. Record and explore tasting notes for Single Malt Scotch, Bourbon, Rum, Gin, Tequila, and more.',
  icons: {
    icon: [
      { url: '/whisky-logo-with-circle.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/whisky-logo-with-circle.svg',
    apple: '/whisky-logo-maskable.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Aqua Vitaeum',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="pub-dark" className="h-full antialiased">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  const isProd = window.location.hostname !== 'localhost';
                  const prefix = isProd ? '/aquavitaeum' : '';
                  navigator.serviceWorker.register(prefix + '/sw.js').then(
                    function(reg) {
                      console.log('Aqua Vitaeum: ServiceWorker registered successfully with scope: ', reg.scope);
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
      <body className="min-h-full flex flex-col">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}

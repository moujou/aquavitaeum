import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  const isProd = process.env.NODE_ENV === 'production';
  const prefix = isProd ? '/aquavitaeum' : '';

  return {
    name: 'Aqua Vitaeum',
    short_name: 'AquaVitaeum',
    description: 'Fine spirits tasting journal & sensory analytics suite.',
    start_url: `${prefix}/`,
    scope: `${prefix}/`,
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ECE5D8', // matches --pub-bg
    theme_color: '#ECE5D8',      // matches --nav-bg and top-menu searchbar
    icons: [
      {
        src: `${prefix}/icons/icon-192x192.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `${prefix}/icons/icon-512x512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `${prefix}/icons/icon-maskable-192x192.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: `${prefix}/icons/icon-maskable-512x512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: `${prefix}/favicon.svg`,
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}

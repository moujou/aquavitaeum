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
    background_color: '#0c1a0e', // matches --pub-bg
    theme_color: '#2A1B12',      // matches --wood-accent
    icons: [
      {
        src: `${prefix}/whisky-logo-with-circle.svg?v=2`,
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: `${prefix}/whisky-logo-maskable.svg?v=2`,
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: `${prefix}/whisky-logo-with-circle.svg?v=2`,
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'monochrome',
      },
    ],
  };
}

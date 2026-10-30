import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Portfoliofy',
    short_name: 'Portfoliofy',
    description: 'A drag-and-drop portfolio builder for professionals.',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    // Also the Android app's splash screen and status bar colour.
    background_color: '#222222',
    theme_color: '#222222',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}

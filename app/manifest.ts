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
    display_override: ['standalone'],
    orientation: 'portrait',
    lang: 'en',
    dir: 'ltr',
    categories: ['productivity', 'business'],
    prefer_related_applications: false,
    // Reopen the running app instead of starting a second copy.
    launch_handler: { client_mode: 'focus-existing' },
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
    // Shown in Android's install prompt.
    screenshots: [
      ['01-profile', 'Your profile'],
      ['02-work', 'Work experience'],
      ['03-writing', 'Writing'],
      ['04-post', 'A post'],
      ['05-private', 'Private pages'],
      ['06-light-dark', 'Light and dark themes'],
    ].map(([file, label]) => ({
      src: `/screenshots/${file}.png`,
      sizes: '1080x1920',
      type: 'image/png',
      form_factor: 'narrow' as const,
      label,
    })),
  };
}

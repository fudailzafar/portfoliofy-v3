import type React from 'react';
import { Inter, Fraunces, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ReactQueryClientProvider } from '@/components/providers/ReactQueryClientProvider';
import { Metadata, Viewport } from 'next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import Script from 'next/script';
import { ClientLayoutWrapper } from '@/components/layout/ClientLayoutWrapper';
import { SessionProviderWrapper } from '@/components/providers/SessionProviderWrapper';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ThemeColorSync } from '@/components/providers/ThemeColorSync';
import { SITE_URL, classifyHost } from '@/lib/site';

// 600 is only for emphasis inside the landing-page search tile
const fontSans = Inter({
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-body',
});

const fontSerif = Fraunces({
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-serif-display',
});

const fontMono = JetBrains_Mono({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-code',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Portfoliofy - Customizable professional profiles',
  description:
    'Portfoliofy is a drag-and-drop portfolio builder that helps professionals put together a polished, customizable profile in minutes.',
  alternates: {
    canonical: '/',
  },
  icons: {
    other: [
      {
        rel: 'mask-icon',
        url: '/mask-icon.svg',
        color: '#000000',
      },
    ],
  },
  openGraph: {
    title: 'Portfoliofy - Customizable professional profiles',
    description:
      'Portfoliofy is a drag-and-drop portfolio builder that helps professionals put together a polished, customizable profile in minutes.',
    url: '/',
    siteName: 'Portfoliofy',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
  other: {
    'og:logo': `${SITE_URL}/favicon.ico`,
  },
  verification: {
    google: 'QgVm-W9_sWA8B47coaItOUCg-3pX84KbM2wEtP9Jpm4',
  },
  appleWebApp: {
    capable: true,
    title: 'Portfoliofy',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#222222' },
  ],
  colorScheme: 'light dark',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-B99MN9ZMBL';

  const headersList = await require('next/headers').headers();
  // A user's own subdomain or custom domain renders without the app chrome.
  const isCustomDomain = classifyHost(headersList.get('host')).kind !== 'main';

  return (
    <SessionProviderWrapper>
      <ReactQueryClientProvider>
        <html
          lang="en"
          className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable}`}
        >
          <head>
            {/* Registered in the HTML so install checks find it before React loads. */}
            <script
              dangerouslySetInnerHTML={{
                __html: `if('serviceWorker' in navigator&&location.protocol==='https:'){navigator.serviceWorker.register('/sw.js')}`,
              }}
            />
            {/* rest of your scripts go under */}
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaId}');`}
            </Script>
          </head>
          <body className="flex min-h-screen flex-col font-sans antialiased">
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <ThemeColorSync />
              <main className="flex flex-1 flex-col">
                {isCustomDomain ? (
                  children
                ) : (
                  <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
                )}
                <SpeedInsights />
                <Analytics />
              </main>
              <Toaster richColors position="top-right" />
            </ThemeProvider>
          </body>
        </html>
      </ReactQueryClientProvider>
    </SessionProviderWrapper>
  );
}

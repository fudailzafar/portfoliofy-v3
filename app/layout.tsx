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
import { SITE_URL } from '@/lib/site';

const graphik = Inter({
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-graphik',
});

const signifier = Fraunces({
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-signifier',
});

const diatypeMono = JetBrains_Mono({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-diatype-mono',
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
  themeColor: '#ffffff',
  colorScheme: 'light dark',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-B99MN9ZMBL';

  const headersList = await require('next/headers').headers();
  const rawHostname = headersList.get('host') || '';
  const hostname = rawHostname.split(':')[0]; // Strip port for local testing
  const isMainDomain =
    hostname === 'portfoliofy.me' || hostname === 'www.portfoliofy.me';
  const isVercelDomain = hostname.endsWith('.vercel.app');
  const isLocalhost = hostname.includes('localhost');
  const isCustomDomain = !isMainDomain && !isVercelDomain && !isLocalhost;

  return (
    <SessionProviderWrapper>
      <ReactQueryClientProvider>
        <html
          lang="en"
          className={`${graphik.variable} ${signifier.variable} ${diatypeMono.variable}`}
        >
          <head>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Organization',
                  url: SITE_URL,
                  logo: `${SITE_URL}/logo.png`,
                  name: 'Portfoliofy',
                  description:
                    'Portfoliofy is a drag-and-drop portfolio builder for professionals.',
                  dateModified: new Date().toISOString(),
                }),
              }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  mainEntity: [
                    {
                      '@type': 'Question',
                      name: 'What is Portfoliofy?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Portfoliofy is a drag-and-drop portfolio builder that helps professionals put together a polished, customizable profile in minutes.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'How do I create a profile?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'You can create a profile by signing up and building it out with our drag-and-drop editor — most people have something worth sharing in just a few minutes.',
                      },
                    },
                  ],
                }),
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

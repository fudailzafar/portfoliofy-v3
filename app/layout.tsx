import type React from 'react';
import localFont from 'next/font/local';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ReactQueryClientProvider } from '@/components/ReactQueryClientProvider';
import { Metadata, Viewport } from 'next';
import PlausibleProvider from 'next-plausible';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import Script from 'next/script';
import { ClientLayoutWrapper } from '@/components/ClientLayoutWrapper';
import { SessionProviderWrapper } from '@/components/SessionProviderWrapper';

const graphik = localFont({
  src: [
    {
      path: '../public/fonts/Graphik-Regular.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Graphik-Medium.woff',
      weight: '500',
      style: 'normal',
    },
  ],
  variable: '--font-graphik',
});

const signifier = localFont({
  src: [
    {
      path: '../public/fonts/Signifier-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Signifier-Medium.otf',
      weight: '500',
      style: 'normal',
    },
  ],
  variable: '--font-signifier',
});

const diatypeMono = localFont({
  src: [
    {
      path: '../public/fonts/DiatypeMono-Regular.woff',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-diatype-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://portfoliofy-v3.vercel.app'),
  title: 'Portfoliofy - Mindful professional profiles',
  description: 'Portfoliofy is a progressive platform used by thousands of people to create more mindful professional profiles.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Portfoliofy - Mindful professional profiles',
    description: 'Portfoliofy is a progressive platform used by thousands of people to create more mindful professional profiles.',
    url: '/',
    siteName: 'Portfoliofy',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
      }
    ],
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  colorScheme: 'light dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-B99MN9ZMBL';

  return (
    <SessionProviderWrapper>
      <PlausibleProvider domain="portfoliofy-v3.vercel.app">
        <ReactQueryClientProvider>
          <html lang="en" className={`${graphik.variable} ${signifier.variable} ${diatypeMono.variable}`}>
            <head>
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    "url": "https://portfoliofy-v3.vercel.app",
                    "logo": "https://portfoliofy-v3.vercel.app/logo.png",
                    "name": "Portfoliofy",
                    "description": "Portfoliofy is a progressive platform for mindful professional profiles.",
                    "dateModified": new Date().toISOString()
                  })
                }}
              />
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "mainEntity": [
                      {
                        "@type": "Question",
                        "name": "What is Portfoliofy?",
                        "acceptedAnswer": {
                          "@type": "Answer",
                          "text": "Portfoliofy is a progressive platform used by thousands of people to create more mindful professional profiles."
                        }
                      },
                      {
                        "@type": "Question",
                        "name": "How do I create a profile?",
                        "acceptedAnswer": {
                          "@type": "Answer",
                          "text": "You can create a profile by signing up and using our intuitive editor to craft your mindful professional profile in minutes."
                        }
                      }
                    ]
                  })
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
            <body className="min-h-screen flex flex-col font-sans antialiased light">
              <main className="flex-1 flex flex-col">
                <ClientLayoutWrapper>
                  {children}
                </ClientLayoutWrapper>
                <SpeedInsights />
                <Analytics />
              </main>
              <Toaster richColors position="bottom-center" />
            </body>
          </html>
        </ReactQueryClientProvider>
      </PlausibleProvider>
    </SessionProviderWrapper>
  );
}

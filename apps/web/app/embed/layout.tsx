import type { Metadata } from 'next';

// Pages in here exist only to be loaded by the mobile app.
export const metadata: Metadata = {
  title: 'Portfoliofy editor',
  robots: { index: false, follow: false },
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

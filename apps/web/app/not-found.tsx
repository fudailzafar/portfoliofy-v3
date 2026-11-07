import { Metadata } from 'next';
import { NotFoundEmojiArt } from '@/components/composite/NotFoundEmojiArt';

const TITLE = 'Page not found';
const DESCRIPTION =
  'Portfoliofy is a drag-and-drop portfolio builder that helps professionals put together a polished, customizable profile in minutes.';
const IMAGE = { url: '/opengraph-image.png', width: 1200, height: 630 };

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: 'Portfoliofy',
    images: [IMAGE],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [IMAGE.url],
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface-1 px-6 text-center font-sans">
      <NotFoundEmojiArt />
    </div>
  );
}

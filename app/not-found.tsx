import { Metadata } from 'next';
import { NotFoundEmojiArt } from '@/components/composite/NotFoundEmojiArt';

export const metadata: Metadata = {
  title: 'Page Not Found',
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface-1 px-6 text-center font-sans">
      <NotFoundEmojiArt />
    </div>
  );
}

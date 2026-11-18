import type { Metadata } from 'next';
import { ExplorePage } from './ExplorePage';

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Find and explore profiles on Portfoliofy',
  openGraph: {
    title: 'Explore',
    description: 'Find and explore profiles on Portfoliofy',
  },
};

export default function Page() {
  return <ExplorePage />;
}

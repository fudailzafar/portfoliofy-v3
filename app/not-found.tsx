import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found | Portfoliofy',
  description: 'This page could not be found on Portfoliofy.',
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-1 px-6 text-center font-sans">
      <p className="text-sm font-medium text-content-muted">404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-content-primary">
        This page could not be found
      </h1>
      <p className="mt-2 max-w-sm text-[15px] text-content-secondary">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved.
      </p>
      <Link
        href="/"
        className="mt-6 text-sm font-medium text-content-primary hover:underline hover:underline-offset-4"
      >
        Back to Portfoliofy
      </Link>
    </div>
  );
}

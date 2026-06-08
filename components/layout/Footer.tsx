import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-16 w-full bg-surface-1 px-6 py-12 font-sans">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-center">
        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-8 text-[15px] text-content-muted">
          <Link
            href="/"
            className="transition-colors hover:text-content-primary"
          >
            About
          </Link>
          <Link
            href="/terms"
            className="transition-colors hover:text-content-primary"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="transition-colors hover:text-content-primary"
          >
            Privacy
          </Link>
          <Link
            href="/faq"
            className="transition-colors hover:text-content-primary"
          >
            FAQ
          </Link>
        </div>
      </div>
    </footer>
  );
}

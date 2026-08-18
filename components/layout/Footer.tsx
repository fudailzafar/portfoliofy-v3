import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-16 w-full bg-surface-1 px-6 py-12 font-sans">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-center">
        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-8 text-[14px] font-medium text-[#aaa]">
          <Link href="/" className="underline-offset-[3px] hover:underline">
            About
          </Link>
          <Link href="/faq" className="underline-offset-[3px] hover:underline">
            FAQ
          </Link>
          <Link
            href="/terms"
            className="underline-offset-[3px] hover:underline"
          >
            Terms
          </Link>
          <Link
            href="/support"
            className="underline-offset-[3px] hover:underline"
          >
            Support
          </Link>
          <Link
            href="/privacy"
            className="underline-offset-[3px] hover:underline"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}

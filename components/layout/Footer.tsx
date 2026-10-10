import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        'mt-16 w-full bg-surface-1 px-6 py-12 font-sans',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-4xl items-center justify-center">
        {/* Navigation Links */}
        <div className="grid grid-cols-[repeat(3,max-content)] gap-x-12 gap-y-0 text-[14px] font-medium leading-[1.6] text-[#aaa] dark:text-[#777]">
          <Link href="/" className="underline-offset-[3px] hover:underline">
            About
          </Link>
          <Link
            href="/support/faq"
            className="underline-offset-[3px] hover:underline"
          >
            FAQs
          </Link>
          <Link
            href="/terms"
            className="underline-offset-[3px] hover:underline"
          >
            Terms
          </Link>
          <Link
            href="/press"
            className="underline-offset-[3px] hover:underline"
          >
            Press
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

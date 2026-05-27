import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full py-12 px-6 mt-16 bg-white font-sans">
      <div className="max-w-4xl mx-auto w-full flex justify-center items-center">
        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-8 text-[15px] text-gray-500">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            About
          </Link>
          <Link href="/terms" className="hover:text-gray-900 transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-gray-900 transition-colors">
            Privacy
          </Link>
          <Link href="/faq" className="hover:text-gray-900 transition-colors">
            FAQ
          </Link>
        </div>
      </div>
    </footer>
  );
}

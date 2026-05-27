import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full py-8 px-6 mt-auto border-t border-gray-200 bg-white font-mono">
      <div className="max-w-4xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Navigation Links */}
        <div className="flex gap-6 text-sm text-gray-600">
          <Link href="/about" className="hover:text-black transition-colors">
            About
          </Link>
          <Link href="/terms" className="hover:text-black transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-black transition-colors">
            Privacy
          </Link>
          <Link href="/faq" className="hover:text-black transition-colors">
            FAQ
          </Link>
        </div>

        {/* Branding & Socials */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex gap-3">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/fudailzafar/portfoliofy"
              className="size-8 flex items-center justify-center border border-gray-200 hover:border-gray-400 rounded transition-colors"
            >
              <img src="/footer/github.svg" className="size-4 opacity-70 hover:opacity-100 transition-opacity" alt="GitHub" />
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://x.com/fudailzafar"
              className="size-8 flex items-center justify-center border border-gray-200 hover:border-gray-400 rounded transition-colors"
            >
              <img src="/footer/x.svg" className="size-4 opacity-70 hover:opacity-100 transition-opacity" alt="X (Twitter)" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}

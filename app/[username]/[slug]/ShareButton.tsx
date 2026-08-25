'use client';

import { useEffect, useRef, useState } from 'react';
import { Link as LinkIcon, Twitter, Linkedin, Mail } from 'lucide-react';

export function ShareButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pageTitle = typeof document !== 'undefined' ? document.title : '';

  const shareLinks = [
    {
      label: 'Share on X',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(pageTitle)}`,
    },
    {
      label: 'Share on LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`,
    },
    {
      label: 'Share via Email',
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent(pageTitle)}&body=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`,
    },
  ];

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="text-sm font-medium text-theme-muted hover:underline hover:underline-offset-4"
      >
        Share
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 overflow-hidden rounded-xl border border-theme-border bg-theme-bg shadow-lg">
          <button
            onClick={() => {
              handleCopyLink();
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-theme-secondary transition-colors hover:bg-theme-border hover:text-theme-primary"
          >
            <LinkIcon className="h-4 w-4" />
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          {shareLinks.map(({ label, icon: Icon, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-theme-secondary transition-colors hover:bg-theme-border hover:text-theme-primary"
            >
              <Icon className="h-4 w-4" />
              {label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = { title: document.title, url: window.location.href };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User dismissed the share sheet — nothing to do.
      }
      return;
    }

    // Desktop browsers without the Web Share API (e.g. Firefox) fall back
    // to a plain clipboard copy instead of the native sheet.
    await navigator.clipboard.writeText(shareData.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      className="text-sm font-medium text-theme-muted hover:underline hover:underline-offset-4"
    >
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

/** A code block with a Copy button that briefly changes to "Copied!". */
export function CopyBlock({ text }: { text: string }) {
  const [isCopied, setIsCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      toast.error('Could not copy. Select the text and copy it instead.');
      return;
    }
    setIsCopied(true);
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex items-start gap-3 rounded-md bg-[#f5f5f5] p-3 dark:bg-[#2c2c2c]">
      <pre className="min-w-0 flex-1 overflow-x-auto font-mono text-[13px] text-[#111] dark:text-[#eee]">
        {text}
      </pre>
      <button
        onClick={copy}
        aria-label="Copy to clipboard"
        className="shrink-0 text-[12px] font-medium text-[#111] opacity-60 transition-opacity hover:underline hover:underline-offset-4 active:opacity-100 dark:text-[#eee]"
      >
        {isCopied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

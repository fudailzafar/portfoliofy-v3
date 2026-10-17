'use client';

import Twemoji from 'react-twemoji';

// Compact status pill for the 48px avatar on post pages: flush with the
// avatar's bottom and overhanging its right edge by 6px.
export function PostStatusBadge({ emoji }: { emoji: string }) {
  return (
    <span className="absolute -right-1.5 bottom-0 flex h-4 items-center rounded-xl bg-theme-bg px-1 shadow-[0_0_0_1px_#0000000d,0_1px_4px_#0000001a] dark:bg-theme-border">
      <Twemoji
        tag="span"
        className="flex size-4 items-center justify-center leading-none"
        // 13px emoji in a 16px slot, smaller than the profile's 16px badge.
        options={{ className: 'size-[13px]' }}
      >
        {emoji}
      </Twemoji>
    </span>
  );
}

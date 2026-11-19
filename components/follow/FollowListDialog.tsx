'use client';

// "See all": your followers and the people you follow, in two tabs, as on
// the original. Each row links to the person and has a follow toggle.

import { useState } from 'react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PersonAvatar } from '@/app/[username]/_components/resume/editing/replies/PersonAvatar';
import { displayName } from '@/app/[username]/_components/resume/editing/replies/format';
import { cn } from '@/lib/utils';
import { FollowToggle } from './FollowToggle';
import type { FollowData } from './useFollows';

type Tab = 'followers' | 'following';

export function FollowListDialog({
  open,
  onOpenChange,
  data,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: FollowData;
}) {
  const [tab, setTab] = useState<Tab>('followers');
  const list = tab === 'followers' ? data.followers : data.following;
  const followerNames = new Set(data.followers.map((p) => p.username));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton
        className="flex h-[min(85vh,640px)] max-w-[540px] flex-col gap-0 overflow-hidden p-0"
      >
        <DialogTitle className="sr-only">Followers and following</DialogTitle>

        <div
          role="tablist"
          aria-label="Followers and following"
          className="flex shrink-0 gap-6 border-b border-border-strong px-6"
        >
          {(['followers', 'following'] as const).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                '-mb-px h-12 border-b text-[14px] transition-colors',
                tab === id
                  ? 'border-content-primary text-content-primary'
                  : 'border-transparent text-content-muted hover:text-content-secondary',
              )}
            >
              {id === 'followers' ? 'Followers' : 'Following'}
            </button>
          ))}
        </div>

        <ul
          role="tabpanel"
          className="min-h-0 flex-1 overflow-y-auto px-6 py-2"
        >
          {list.length === 0 ? (
            <li className="py-10 text-center text-[14px] text-content-muted">
              {tab === 'followers'
                ? 'Nobody follows you yet.'
                : 'You don’t follow anyone yet.'}
            </li>
          ) : (
            list.map((person) => (
              <li key={person.id} className="flex items-center gap-3 py-2.5">
                <Link href={`/${person.username}`} className="shrink-0">
                  <PersonAvatar person={person} />
                </Link>
                <Link
                  href={`/${person.username}`}
                  className="min-w-0 flex-1 truncate text-[14px] text-content-primary hover:underline hover:underline-offset-4"
                >
                  {displayName(person)}
                </Link>
                <FollowToggle
                  username={person.username}
                  youFollow={person.youFollow}
                  followsYou={followerNames.has(person.username)}
                />
              </li>
            ))
          )}
        </ul>

        <div className="flex shrink-0 justify-end border-t border-border-strong px-6 py-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

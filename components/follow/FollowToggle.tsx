'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useSetFollow } from './useFollows';

/** The small Follow / Following button on a row in the follow lists. */
export function FollowToggle({
  username,
  youFollow,
  followsYou = false,
}: {
  username: string;
  youFollow: boolean;
  /** Shows "Follow back" when they follow you and you don't follow them. */
  followsYou?: boolean;
}) {
  const setFollow = useSetFollow();

  const label = youFollow ? 'Following' : followsYou ? 'Follow back' : 'Follow';

  return (
    <Button
      variant="outline"
      size="sm"
      className="shrink-0"
      disabled={setFollow.isPending}
      aria-pressed={youFollow}
      onClick={() =>
        setFollow.mutate(
          { username, following: !youFollow },
          { onError: (error) => toast.error(error.message) },
        )
      }
    >
      {label}
    </Button>
  );
}

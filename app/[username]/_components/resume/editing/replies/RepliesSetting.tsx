'use client';

import { Switch } from '@/components/ui/switch';
import { useRepliesSetting } from './useReplies';

/** Settings row: whether other people can reply to you. */
export function RepliesSetting() {
  const { data: enabled, isLoading, isError, update } = useRepliesSetting();

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h4 className="text-sm text-content-primary">Replies</h4>
        <p className="text-sm text-content-muted">
          {isError
            ? 'We couldn’t load this setting.'
            : enabled === false
              ? 'Nobody can start or continue a conversation with you. You can still reply to others.'
              : 'Anyone signed in can reply to your profile, status and items.'}
        </p>
      </div>
      <Switch
        checked={enabled ?? true}
        disabled={isLoading || isError}
        onCheckedChange={update}
        aria-label="Let people reply to you"
        className="data-[state=checked]:bg-blue-600"
      />
    </div>
  );
}

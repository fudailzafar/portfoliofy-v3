'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RepliesFrom } from '@/lib/replies';
import { useRepliesSetting } from './useReplies';

const CHOICES: { value: RepliesFrom; label: string; description: string }[] = [
  {
    value: 'everyone',
    label: 'Everyone',
    description: 'Everyone can reply to you.',
  },
  {
    value: 'following',
    label: 'Following',
    description: 'People you follow can reply to you.',
  },
  {
    value: 'nobody',
    label: 'Nobody',
    description: 'Nobody can reply to you. You can still reply to others.',
  },
];

/** Settings row: who can start or continue a conversation with you. */
export function RepliesSetting() {
  const { data, isLoading, isError, update } = useRepliesSetting();
  const value = data ?? 'everyone';
  const current = CHOICES.find((c) => c.value === value) ?? CHOICES[0];

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h4 className="text-sm text-content-primary">Allow new replies from</h4>
        <p className="text-sm text-content-muted">
          {isError ? 'We couldn’t load this setting.' : current.description}
        </p>
      </div>
      <Select
        value={value}
        onValueChange={(next) => update(next as RepliesFrom)}
        disabled={isLoading || isError}
      >
        <SelectTrigger
          aria-label="Allow new replies from"
          className="w-[120px] border border-border-strong bg-surface-card text-content-primary shadow-sm dark:border-none dark:bg-border-subtle"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CHOICES.map((choice) => (
            <SelectItem key={choice.value} value={choice.value}>
              {choice.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

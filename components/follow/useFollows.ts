'use client';

// Client side of /api/follows: requests, cached queries and the follow toggle.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FollowOverview, FollowPerson } from '@/lib/server/follows';

// As sent over JSON, where dates arrive as strings.
export type FollowEntry = Omit<FollowPerson, 'followedAt'> & {
  followedAt: string;
};
export type FollowData = {
  followers: FollowEntry[];
  following: FollowEntry[];
};

export const FOLLOW_KEYS = {
  overview: ['follows', 'overview'] as const,
  unread: ['follows', 'unread'] as const,
};

const UNREAD_POLL_MS = 60_000;

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error ?? 'Something went wrong. Try again.');
  }
  return body as T;
}

export const followsApi = {
  overview: () => request<FollowOverview & FollowData>('/api/follows'),
  unread: () =>
    request<{ unread: number }>('/api/follows/unread').then((d) => d.unread),
  markSeen: () =>
    request<{ success: true }>('/api/follows/seen', { method: 'POST' }),
  set: (username: string, following: boolean) =>
    request<{ following: boolean }>('/api/follows', {
      method: 'PUT',
      body: JSON.stringify({ username, following }),
    }),
};

export function useFollowOverview() {
  return useQuery<FollowData>({
    queryKey: FOLLOW_KEYS.overview,
    queryFn: followsApi.overview,
  });
}

/** New followers since the Following page was last opened. */
export function useNewFollowerCount(enabled = true) {
  return useQuery({
    queryKey: FOLLOW_KEYS.unread,
    queryFn: followsApi.unread,
    refetchInterval: UNREAD_POLL_MS,
    enabled,
  });
}

export function useMarkFollowersSeen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: followsApi.markSeen,
    onMutate: () => queryClient.setQueryData(FOLLOW_KEYS.unread, 0),
  });
}

/**
 * Follow or unfollow. The lists update straight away and roll back if the
 * request fails.
 */
export function useSetFollow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { username: string; following: boolean }) =>
      followsApi.set(args.username, args.following),
    onMutate: async ({ username, following }) => {
      await queryClient.cancelQueries({ queryKey: FOLLOW_KEYS.overview });
      const previous = queryClient.getQueryData<FollowData>(
        FOLLOW_KEYS.overview,
      );
      if (previous) {
        const mark = (list: FollowEntry[]) =>
          list.map((p) =>
            p.username === username ? { ...p, youFollow: following } : p,
          );
        queryClient.setQueryData<FollowData>(FOLLOW_KEYS.overview, {
          followers: mark(previous.followers),
          following: mark(previous.following),
        });
      }
      return { previous };
    },
    onError: (_error, _args, context) => {
      if (context?.previous) {
        queryClient.setQueryData(FOLLOW_KEYS.overview, context.previous);
      }
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: FOLLOW_KEYS.overview }),
  });
}

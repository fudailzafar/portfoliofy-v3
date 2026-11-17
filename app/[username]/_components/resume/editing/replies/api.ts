// Client side of /api/replies: request helpers and the shapes they return.

import type { InboxItem, Thread, ThreadMessage } from '@/lib/server/replies';
import type { ReplyTarget, ReportReason } from '@/lib/replies';

// As sent over JSON, where dates arrive as strings.
export type InboxEntry = Omit<InboxItem, 'lastMessage' | 'lastMessageAt'> & {
  lastMessage:
    | (Omit<NonNullable<InboxItem['lastMessage']>, 'createdAt'> & {
        createdAt: string;
      })
    | null;
  lastMessageAt: string | null;
};

export type ThreadEntry = Omit<ThreadMessage, 'createdAt'> & {
  createdAt: string;
};

export type ThreadData = Omit<Thread, 'messages'> & {
  messages: ThreadEntry[];
};

export class RepliesError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string | null,
  ) {
    super(message);
    this.name = 'RepliesError';
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: init?.body
      ? { 'Content-Type': 'application/json', ...init.headers }
      : init?.headers,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new RepliesError(
      body?.error ?? 'Something went wrong. Try again.',
      response.status,
      body?.code ?? null,
    );
  }
  return body as T;
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  body: JSON.stringify(body),
});

export const repliesApi = {
  inbox: () =>
    request<{ conversations: InboxEntry[] }>('/api/replies/conversations').then(
      (data) => data.conversations,
    ),

  thread: (id: string, before?: number) =>
    request<ThreadData>(
      `/api/replies/conversations/${id}${before ? `?before=${before}` : ''}`,
    ),

  unread: () =>
    request<{ unread: number }>('/api/replies/unread').then(
      (data) => data.unread,
    ),

  /** First contact, or a reply to someone's profile, item or status. */
  start: (args: { username: string; body: string; target?: ReplyTarget }) =>
    request<{ conversationId: string; messageId: number }>(
      '/api/replies',
      json('POST', args),
    ),

  send: (id: string, body: string) =>
    request<{ conversationId: string; messageId: number }>(
      `/api/replies/conversations/${id}`,
      json('POST', { body }),
    ),

  markRead: (id: string) =>
    request<{ success: true }>(`/api/replies/conversations/${id}/read`, {
      method: 'POST',
    }),

  hide: (id: string) =>
    request<{ success: true }>(`/api/replies/conversations/${id}/hide`, {
      method: 'POST',
    }),

  block: (username: string, blocked: boolean) =>
    request<{ success: true }>(
      '/api/replies/blocks',
      json('PUT', { username, blocked }),
    ),

  report: (args: {
    conversationId: string;
    messageId?: number;
    reason: ReportReason;
    details?: string;
  }) => request<{ success: true }>('/api/replies/reports', json('POST', args)),

  getSetting: () =>
    request<{ repliesEnabled: boolean }>('/api/replies/settings').then(
      (data) => data.repliesEnabled,
    ),

  setSetting: (repliesEnabled: boolean) =>
    request<{ repliesEnabled: boolean }>(
      '/api/replies/settings',
      json('PUT', { repliesEnabled }),
    ),
};

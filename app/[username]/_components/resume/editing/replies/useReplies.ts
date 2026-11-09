'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { repliesApi } from './api';

export const REPLIES_KEYS = {
  inbox: ['replies', 'inbox'] as const,
  unread: ['replies', 'unread'] as const,
  settings: ['replies', 'settings'] as const,
  thread: (id: string) => ['replies', 'thread', id] as const,
};

const INBOX_POLL_MS = 15_000;
const THREAD_POLL_MS = 5_000;
const UNREAD_POLL_MS = 30_000;

function refreshAll(queryClient: QueryClient, conversationId?: string) {
  queryClient.invalidateQueries({ queryKey: REPLIES_KEYS.inbox });
  queryClient.invalidateQueries({ queryKey: REPLIES_KEYS.unread });
  if (conversationId) {
    queryClient.invalidateQueries({
      queryKey: REPLIES_KEYS.thread(conversationId),
    });
  }
}

// Polling pauses while the browser tab is hidden (the default), so a forgotten
// tab doesn't keep asking the server.

export function useInbox() {
  return useQuery({
    queryKey: REPLIES_KEYS.inbox,
    queryFn: repliesApi.inbox,
    refetchInterval: INBOX_POLL_MS,
  });
}

export function useThread(conversationId: string | null) {
  return useQuery({
    queryKey: REPLIES_KEYS.thread(conversationId ?? ''),
    queryFn: () => repliesApi.thread(conversationId!),
    enabled: !!conversationId,
    refetchInterval: THREAD_POLL_MS,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: REPLIES_KEYS.unread,
    queryFn: repliesApi.unread,
    refetchInterval: UNREAD_POLL_MS,
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => repliesApi.send(conversationId, body),
    onSuccess: () => refreshAll(queryClient, conversationId),
    onError: (error) => toast.error(error.message),
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => repliesApi.markRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPLIES_KEYS.inbox });
      queryClient.invalidateQueries({ queryKey: REPLIES_KEYS.unread });
    },
  });
}

export function useHideConversation(onHidden?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => repliesApi.hide(conversationId),
    onSuccess: () => {
      refreshAll(queryClient);
      onHidden?.();
      toast.success('Conversation removed from your inbox');
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useBlockPerson(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { username: string; blocked: boolean }) =>
      repliesApi.block(args.username, args.blocked),
    onSuccess: (_data, args) => {
      refreshAll(queryClient, conversationId);
      toast.success(args.blocked ? 'Blocked' : 'Unblocked');
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useReportPerson() {
  return useMutation({
    mutationFn: repliesApi.report,
    onSuccess: () => toast.success('Thanks, we got your report'),
    onError: (error) => toast.error(error.message),
  });
}

export function useRepliesSetting() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: REPLIES_KEYS.settings,
    queryFn: repliesApi.getSetting,
  });
  const mutation = useMutation({
    mutationFn: repliesApi.setSetting,
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: REPLIES_KEYS.settings });
      const previous = queryClient.getQueryData<boolean>(REPLIES_KEYS.settings);
      queryClient.setQueryData(REPLIES_KEYS.settings, next);
      return { previous };
    },
    onError: (error, _next, context) => {
      queryClient.setQueryData(REPLIES_KEYS.settings, context?.previous);
      toast.error(error.message);
    },
  });
  return { ...query, update: mutation.mutate };
}

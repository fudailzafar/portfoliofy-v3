// The editing session: the profile loaded from the server, edited locally in
// the shared store (as on the website), and saved back as one piece.

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { saveResumeData } from '@portfoliofy/shared/api/saveResume';
import { useResumeStore } from '@portfoliofy/shared/store/useResumeStore';
import { api } from './api';

interface EditorValue {
  status: 'loading' | 'error' | 'ready';
  reloadFromServer: () => Promise<void>;
  /** Unsaved edits exist. */
  dirty: boolean;
  saving: boolean;
  /** Why the last save failed, if it did. */
  saveError: unknown;
  /** True when the profile was saved from somewhere else in the meantime. */
  conflict: boolean;
  save: () => Promise<boolean>;
  /** Throws away unsaved edits and goes back to what the server has. */
  discard: () => void;
}

const EditorContext = createContext<EditorValue | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const resumeQuery = useQuery({
    queryKey: ['resume'],
    queryFn: () => api.getResume(),
  });
  const usernameQuery = useQuery({
    queryKey: ['username'],
    queryFn: () => api.getUsername(),
  });
  const dirty = useResumeStore((state) => state.hasUnsavedChanges);
  const hasLocalCopy = useResumeStore((state) => state.resume !== null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<unknown>(null);

  const server = resumeQuery.data;
  const serverUsername = usernameQuery.data ?? '';

  // Take the server's copy into the editor, but never over unsaved edits: a
  // background refetch must not hide what someone just typed.
  useEffect(() => {
    if (!server?.resumeData) return;
    if (useResumeStore.getState().hasUnsavedChanges) return;
    useResumeStore.getState().setResume(server.resumeData, server.version);
    useResumeStore.setState({ uname: serverUsername });
  }, [server, serverUsername]);

  const reset = useCallback(() => {
    if (server?.resumeData) {
      useResumeStore.getState().setResume(server.resumeData, server.version);
      useResumeStore.setState({
        uname: serverUsername,
        hasUnsavedChanges: false,
      });
    }
    setSaveError(null);
  }, [server, serverUsername]);

  const reloadFromServer = useCallback(async () => {
    const [fresh, name] = await Promise.all([
      queryClient.fetchQuery({
        queryKey: ['resume'],
        queryFn: () => api.getResume(),
        staleTime: 0,
      }),
      queryClient.fetchQuery({
        queryKey: ['username'],
        queryFn: () => api.getUsername(),
        staleTime: 0,
      }),
    ]);
    if (fresh?.resumeData) {
      useResumeStore.getState().setResume(fresh.resumeData, fresh.version);
      useResumeStore.setState({
        uname: name ?? '',
        hasUnsavedChanges: false,
      });
    }
    setSaveError(null);
  }, [queryClient]);

  const save = useCallback(async () => {
    const state = useResumeStore.getState();
    if (!state.resume) return false;
    setSaving(true);
    setSaveError(null);
    try {
      // A changed username goes first, as on the website: if it is taken,
      // nothing else is saved.
      const wanted = state.uname.trim();
      if (wanted && wanted !== serverUsername) {
        await api.setUsername(wanted);
        queryClient.setQueryData(['username'], wanted);
      }
      const saved = await saveResumeData(api, state.resume, server);
      useResumeStore.getState().setHasUnsavedChanges(false);
      queryClient.setQueryData(['resume'], saved);
      return true;
    } catch (error) {
      setSaveError(error);
      return false;
    } finally {
      setSaving(false);
    }
  }, [queryClient, server, serverUsername]);

  const value = useMemo<EditorValue>(
    () => ({
      status: hasLocalCopy
        ? 'ready'
        : resumeQuery.isError
          ? 'error'
          : 'loading',
      reloadFromServer,
      dirty,
      saving,
      saveError,
      conflict:
        saveError instanceof Error && saveError.name === 'SaveConflictError',
      save,
      discard: reset,
    }),
    [
      hasLocalCopy,
      resumeQuery.isError,
      reloadFromServer,
      dirty,
      saving,
      saveError,
      save,
      reset,
    ],
  );

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

export function useEditor(): EditorValue {
  const value = useContext(EditorContext);
  if (!value) throw new Error('useEditor must be used inside EditorProvider');
  return value;
}

/** The profile being edited. Only call under a ready editor. */
export function useDraftResume() {
  const resume = useResumeStore((state) => state.resume);
  if (!resume) throw new Error('The profile is not loaded yet');
  return resume;
}

/** Asks before leaving a screen that has changes nobody has kept. */
export function messageFor(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Try again.';
}

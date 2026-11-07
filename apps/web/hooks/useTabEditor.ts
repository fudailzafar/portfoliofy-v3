import { useState, useEffect, useRef, useCallback } from 'react';
import { useResumeStore } from '@/store/useResumeStore';

interface UseTabEditorOptions<T> {
  // Whether `item` has enough filled in to be committed. Mirrors each tab's
  // former per-form "isSaveDisabled" check, just inverted.
  isValid: (item: T | null) => boolean;
  // Commits the item into the resume (e.g. the tab's `handleSave` from
  // `useResumeList`) — only ever called with an already-valid item.
  onCommit: (item: T) => void;
}

export function useTabEditor<T = any>(options?: UseTabEditorOptions<T>) {
  const setIsEditingTab = useResumeStore((state) => state.setIsEditingTab);
  const setHasUnsavedChanges = useResumeStore(
    (state) => state.setHasUnsavedChanges,
  );
  const setActiveFormCommit = useResumeStore(
    (state) => state.setActiveFormCommit,
  );
  const setActiveFormValid = useResumeStore(
    (state) => state.setActiveFormValid,
  );
  const setActiveFormDirty = useResumeStore(
    (state) => state.setActiveFormDirty,
  );
  const setActiveFormCancel = useResumeStore(
    (state) => state.setActiveFormCancel,
  );

  const [view, setViewState] = useState<'list' | 'form'>('list');
  const [current, setCurrentState] = useState<T | null>(null);
  const baselineRef = useRef<string | null>(null);
  const currentRef = useRef<T | null>(null);
  const optionsRef = useRef(options);
  currentRef.current = current;
  optionsRef.current = options;
  // Whether something else was already unsaved when this form opened, so
  // cancel() only clears the flag if this form set it.
  const preexistingDirtyRef = useRef(false);

  const setCurrent = useCallback((value: T | null) => {
    // The baseline is set once per opened form; dirtiness compares against it.
    if (baselineRef.current === null) {
      baselineRef.current = JSON.stringify(value);
    }
    setCurrentState(value);
  }, []);

  const setView = useCallback((next: 'list' | 'form') => {
    if (next === 'list') {
      baselineRef.current = null;
    } else {
      preexistingDirtyRef.current = useResumeStore.getState().hasUnsavedChanges;
    }
    setViewState(next);
  }, []);

  // Commits a valid draft (used by global Save and Back). Skips unchanged
  // drafts so just opening an item doesn't mark the profile as edited.
  const commit = useCallback(() => {
    const item = currentRef.current;
    const opts = optionsRef.current;
    if (item === null || !opts || !opts.isValid(item)) return false;
    if (JSON.stringify(item) === baselineRef.current) return true;
    opts.onCommit(item);
    return true;
  }, []);

  // The draft lives only in this hook until commit, so leaving is a full
  // discard. Clears the unsaved flag only if this form was what set it.
  const cancel = useCallback(() => {
    if (!preexistingDirtyRef.current) {
      setHasUnsavedChanges(false);
    }
    setView('list');
  }, [setView, setHasUnsavedChanges]);

  useEffect(() => {
    setIsEditingTab(view === 'form');
    return () => setIsEditingTab(false);
  }, [view, setIsEditingTab]);

  // Flag the global unsaved-changes indicator the moment a field actually
  // differs from what the form opened with — not just from opening the form.
  useEffect(() => {
    if (view !== 'form' || current === null) return;
    if (JSON.stringify(current) !== baselineRef.current) {
      setHasUnsavedChanges(true);
    }
  }, [current, view, setHasUnsavedChanges]);

  // Expose this form's actions to the global bottom bar. Only one form can be
  // open at a time.
  useEffect(() => {
    if (view !== 'form' || !options) {
      setActiveFormCommit(null);
      setActiveFormValid(true);
      setActiveFormDirty(false);
      setActiveFormCancel(null);
      return;
    }

    setActiveFormCommit(commit);
    setActiveFormValid(options.isValid(current));
    setActiveFormDirty(JSON.stringify(current) !== baselineRef.current);
    setActiveFormCancel(cancel);

    return () => {
      setActiveFormCommit(null);
      setActiveFormValid(true);
      setActiveFormDirty(false);
      setActiveFormCancel(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, current]);

  return {
    view,
    setView,
    current,
    setCurrent,
    commit,
    cancel,
  };
}

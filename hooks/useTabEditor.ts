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
  // Whether the global unsaved-changes flag was already true for some other
  // reason (an unrelated earlier edit, or a real commit elsewhere) the
  // moment this form opened — captured so cancel() can tell "this form's own
  // speculative edits" apart from "there was already something else unsaved"
  // and only clear the flag in the former case.
  const preexistingDirtyRef = useRef(false);

  const setCurrent = useCallback((value: T | null) => {
    // Only reset the baseline when a form is freshly opened (list -> form),
    // not on every field edit — setCurrent is what every field's onChange
    // already calls, so this is how "did anything actually change since the
    // form opened" gets tracked without touching per-field handlers.
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

  // Commits the current draft if it's valid; a no-op (returns false) if the
  // form is empty/incomplete. Used both by the global Save flush and by
  // "Back," so leaving a finished item never silently discards it. Skips
  // calling onCommit when nothing actually changed from the opened baseline
  // — otherwise just opening an existing item and leaving without editing
  // would spuriously flip the global unsaved-changes indicator.
  const commit = useCallback(() => {
    const item = currentRef.current;
    const opts = optionsRef.current;
    if (item === null || !opts || !opts.isValid(item)) return false;
    if (JSON.stringify(item) === baselineRef.current) return true;
    opts.onCommit(item);
    return true;
  }, []);

  // Discards the in-progress draft and returns to the list view — the
  // opposite of commit(). Since the draft only ever lives in this hook's own
  // `current` state until onCommit runs, simply abandoning it (never calling
  // onCommit) and switching views is already a full discard: a brand-new
  // item never gets appended, and an edited existing item's stored copy was
  // never touched in the first place. Also rolls back the global
  // unsaved-changes flag if this form's own speculative dirty-tracking was
  // the only thing that had set it — otherwise Cancel would strand the
  // bottom bar on Cancel/Save instead of Done despite nothing being unsaved.
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

  // Register this form's commit/cancel functions and valid/dirty state
  // while it's open, so the bottom bar (rendered well outside this hook's
  // own tab component) can act on whichever form is currently open. Only
  // one tab form can be open at a time, so there's no coordination needed
  // beyond register/clear.
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

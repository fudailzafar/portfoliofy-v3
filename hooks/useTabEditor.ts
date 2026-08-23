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

  const [view, setViewState] = useState<'list' | 'form'>('list');
  const [current, setCurrentState] = useState<T | null>(null);
  const baselineRef = useRef<string | null>(null);
  const currentRef = useRef<T | null>(null);
  const optionsRef = useRef(options);
  currentRef.current = current;
  optionsRef.current = options;

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

  // Register this form's commit function while it's open, so the global
  // Save button can flush it before persisting. Only one tab form can be
  // open at a time, so there's no coordination needed beyond register/clear.
  useEffect(() => {
    if (view !== 'form' || !options) {
      setActiveFormCommit(null);
      setActiveFormValid(true);
      return;
    }

    setActiveFormCommit(commit);
    setActiveFormValid(options.isValid(current));

    return () => {
      setActiveFormCommit(null);
      setActiveFormValid(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, current]);

  return {
    view,
    setView,
    current,
    setCurrent,
    commit,
  };
}

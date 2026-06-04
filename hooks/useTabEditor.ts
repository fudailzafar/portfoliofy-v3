import { useState, useEffect } from 'react';
import { useResumeStore } from '@/store/useResumeStore';

export function useTabEditor<T = any>() {
  const { setIsEditingTab } = useResumeStore();
  const [view, setView] = useState<'list' | 'form'>('list');
  const [current, setCurrent] = useState<T | null>(null);

  useEffect(() => {
    setIsEditingTab(view === 'form');
    return () => setIsEditingTab(false);
  }, [view, setIsEditingTab]);

  return {
    view,
    setView,
    current,
    setCurrent,
  };
}

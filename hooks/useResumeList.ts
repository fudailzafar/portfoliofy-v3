import { useResumeStore } from '@/store/useResumeStore';
import { ResumeDataSchemaType } from '@/lib/resume';

// Get all keys from the resume schema that are arrays
type ArrayKeys = {
  [K in keyof ResumeDataSchemaType]: ResumeDataSchemaType[K] extends any[]
    ? K
    : never;
}[keyof ResumeDataSchemaType];

// Basic shape that all list items must adhere to
export interface BaseListItem {
  id?: string;
  hidden?: boolean;
  year?: string;
  [key: string]: any;
}

export function useResumeList<T extends BaseListItem>(storeKey: ArrayKeys) {
  const resume = useResumeStore((state) => state.resume);
  const updateResume = useResumeStore((state) => state.updateResume);

  const items = (resume?.[storeKey] || []) as unknown as T[];

  const handleSave = (currentItem: T) => {
    const isEdit = !!currentItem.id;
    const newItem = isEdit
      ? currentItem
      : { ...currentItem, id: Date.now().toString() };

    const newItems = isEdit
      ? items.map((p) => (p.id === currentItem.id ? newItem : p))
      : [...items, newItem];

    updateResume({ [storeKey]: newItems } as any);
  };

  const handleMoveUp = (currentItem: T, prevItem: T) => {
    const newItems = [...items];
    const idx1 = newItems.findIndex(
      (i) => (i.id && i.id === currentItem.id) || i === currentItem,
    );
    const idx2 = newItems.findIndex(
      (i) => (i.id && i.id === prevItem.id) || i === prevItem,
    );

    if (idx1 !== -1 && idx2 !== -1) {
      [newItems[idx1], newItems[idx2]] = [newItems[idx2], newItems[idx1]];
      updateResume({ [storeKey]: newItems } as any);
    }
  };

  const handleMoveDown = (currentItem: T, nextItem: T) => {
    const newItems = [...items];
    const idx1 = newItems.findIndex(
      (i) => (i.id && i.id === currentItem.id) || i === currentItem,
    );
    const idx2 = newItems.findIndex(
      (i) => (i.id && i.id === nextItem.id) || i === nextItem,
    );

    if (idx1 !== -1 && idx2 !== -1) {
      [newItems[idx1], newItems[idx2]] = [newItems[idx2], newItems[idx1]];
      updateResume({ [storeKey]: newItems } as any);
    }
  };

  const handleToggleVisibility = (item: T) => {
    const newItems = items.map((p) =>
      p.id === item.id ? { ...p, hidden: !p.hidden } : p,
    );
    updateResume({ [storeKey]: newItems } as any);
  };

  const handleDelete = (id: string) => {
    const newItems = items.filter((p) => p.id !== id);
    updateResume({ [storeKey]: newItems } as any);
  };

  return {
    items,
    handleSave,
    handleMoveUp,
    handleMoveDown,
    handleToggleVisibility,
    handleDelete,
  };
}

import { create } from 'zustand';

// Which conversation is open. Shared by the inbox in the sidebar and the
// thread beside it, which are rendered in different parts of the editor.
interface RepliesState {
  selectedId: string | null;
  select: (id: string | null) => void;
}

export const useRepliesStore = create<RepliesState>((set) => ({
  selectedId: null,
  select: (id) => set({ selectedId: id }),
}));

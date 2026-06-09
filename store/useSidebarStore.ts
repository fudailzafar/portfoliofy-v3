import { create } from 'zustand';

interface SidebarState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean | ((prev: boolean) => boolean)) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  setIsOpen: (value) =>
    set((state) => ({
      isOpen: typeof value === 'function' ? value(state.isOpen) : value,
    })),
}));

import { create } from 'zustand';

export const SIDEBAR_MAX_WIDTH = 330;
export const SIDEBAR_PEEK = 48;

interface SidebarState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean | ((prev: boolean) => boolean)) => void;
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  setIsOpen: (value) =>
    set((state) => ({
      isOpen: typeof value === 'function' ? value(state.isOpen) : value,
    })),
  sidebarWidth: SIDEBAR_MAX_WIDTH,
  setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
}));

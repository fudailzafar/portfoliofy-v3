import { create } from 'zustand';
import { ResumeDataSchemaType } from '@/lib/resume';

type ResumeData = ResumeDataSchemaType;

interface ResumeStore {
  resume: ResumeData | null;
  activeTab: string;
  hasUnsavedChanges: boolean;
  uname: string;

  // Actions
  initResume: (resume: ResumeData, initialUname: string) => void;
  setActiveTab: (tab: string) => void;
  setHasUnsavedChanges: (has: boolean) => void;
  setUname: (uname: string) => void;

  // Generic updaters
  updateResume: (data: Partial<ResumeData>) => void;
  updateHeader: (header: Partial<ResumeData['header']>) => void;
  updateDesign: (design: Partial<ResumeData['design']>) => void;
  deleteItemFromSection: (sectionKey: keyof ResumeData, id: string) => void;

  isEditingTab: boolean;
  setIsEditingTab: (editing: boolean) => void;
  saveTrigger: number;
  triggerSave: () => void;
  isSaveDisabled: boolean;
  setIsSaveDisabled: (disabled: boolean) => void;

  printHiddenSections: string[];
  togglePrintSection: (sectionId: string) => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  resume: null,
  activeTab: 'general',
  hasUnsavedChanges: false,
  uname: '',

  initResume: (resume, initialUname) => set({ resume, uname: initialUname }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setHasUnsavedChanges: (has) => set({ hasUnsavedChanges: has }),
  setUname: (uname) => set({ uname, hasUnsavedChanges: true }),

  isEditingTab: false,
  setIsEditingTab: (editing) => set({ isEditingTab: editing }),
  saveTrigger: 0,
  triggerSave: () => set((state) => ({ saveTrigger: state.saveTrigger + 1 })),
  isSaveDisabled: false,
  setIsSaveDisabled: (disabled) => set({ isSaveDisabled: disabled }),

  printHiddenSections: [],
  togglePrintSection: (sectionId) =>
    set((state) => ({
      printHiddenSections: state.printHiddenSections.includes(sectionId)
        ? state.printHiddenSections.filter((id) => id !== sectionId)
        : [...state.printHiddenSections, sectionId],
    })),

  updateResume: (data) =>
    set((state) => {
      if (!state.resume) return state;
      return {
        resume: { ...state.resume, ...data },
        hasUnsavedChanges: true,
      };
    }),

  deleteItemFromSection: (sectionKey, id) =>
    set((state) => {
      if (!state.resume) return state;
      const section = state.resume[sectionKey];
      if (!Array.isArray(section)) return state;
      return {
        resume: {
          ...state.resume,
          [sectionKey]: section.filter((item: any) => item.id !== id),
        },
        hasUnsavedChanges: true,
      };
    }),

  updateHeader: (headerData) =>
    set((state) => {
      if (!state.resume) return state;
      return {
        resume: {
          ...state.resume,
          header: { ...state.resume.header, ...headerData },
        },
        hasUnsavedChanges: true,
      };
    }),

  updateDesign: (designData) =>
    set((state) => {
      if (!state.resume) return state;
      return {
        resume: {
          ...state.resume,
          design: {
            ...(state.resume.design || {
              typography: 'sans',
              theme: 'default',
            }),
            ...designData,
          },
        },
        hasUnsavedChanges: true,
      };
    }),
}));

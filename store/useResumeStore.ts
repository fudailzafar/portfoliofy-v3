import { create } from 'zustand';
import { AttachmentSchemaType, ResumeDataSchemaType } from '@/lib/resume';

type ResumeData = ResumeDataSchemaType;

interface ResumeStore {
  resume: ResumeData | null;
  // The saved version `resume` was loaded from. A background refetch must not
  // move this past unsaved edits, or a save could overwrite newer changes.
  resumeVersion: number | undefined;
  activeTab: string;
  hasUnsavedChanges: boolean;
  uname: string;

  // Actions
  initResume: (resume: ResumeData, initialUname: string) => void;
  setResume: (resume: ResumeData, version?: number) => void;
  setResumeVersion: (version: number) => void;
  applyPersistedPatch: (data: Partial<ResumeData>) => void;
  setActiveTab: (tab: string) => void;
  setHasUnsavedChanges: (has: boolean) => void;
  setUname: (uname: string) => void;
  updateResume: (data: Partial<ResumeData>) => void;
  updateHeader: (header: Partial<ResumeData['header']>) => void;
  updateDesign: (design: Partial<ResumeData['design']>) => void;
  deleteItemFromSection: (sectionKey: keyof ResumeData, id: string) => void;
  moveItemToSection: (
    from: 'projects' | 'sideProjects',
    to: 'projects' | 'sideProjects',
    id: string,
  ) => void;

  editingPage: {
    attachment: AttachmentSchemaType | undefined;
  } | null;
  setEditingPage: (
    value: {
      attachment: AttachmentSchemaType | undefined;
    } | null,
  ) => void;

  isEditingTab: boolean;
  setIsEditingTab: (editing: boolean) => void;
  saveTrigger: number;
  triggerSave: () => void;
  isSaveDisabled: boolean;
  setIsSaveDisabled: (disabled: boolean) => void;

  activeFormCommit: (() => boolean) | null;
  setActiveFormCommit: (fn: (() => boolean) | null) => void;
  activeFormValid: boolean;
  setActiveFormValid: (valid: boolean) => void;
  activeFormDirty: boolean;
  setActiveFormDirty: (dirty: boolean) => void;
  activeFormCancel: (() => void) | null;
  setActiveFormCancel: (fn: (() => void) | null) => void;

  printHiddenSections: string[];
  togglePrintSection: (sectionId: string) => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  resume: null,
  resumeVersion: undefined,
  activeTab: 'general',
  hasUnsavedChanges: false,
  uname: '',

  initResume: (resume, initialUname) => set({ resume, uname: initialUname }),
  setResume: (resume, version) =>
    set((state) => ({
      resume,
      resumeVersion: version ?? state.resumeVersion,
    })),
  setResumeVersion: (resumeVersion) => set({ resumeVersion }),
  applyPersistedPatch: (data) =>
    set((state) =>
      state.resume ? { resume: { ...state.resume, ...data } } : state,
    ),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setHasUnsavedChanges: (has) => set({ hasUnsavedChanges: has }),
  setUname: (uname) => set({ uname, hasUnsavedChanges: true }),

  isEditingTab: false,
  setIsEditingTab: (editing) => set({ isEditingTab: editing }),
  saveTrigger: 0,
  triggerSave: () => set((state) => ({ saveTrigger: state.saveTrigger + 1 })),
  isSaveDisabled: false,
  setIsSaveDisabled: (disabled) => set({ isSaveDisabled: disabled }),

  activeFormCommit: null,
  setActiveFormCommit: (fn) => set({ activeFormCommit: fn }),
  activeFormValid: true,
  setActiveFormValid: (valid) => set({ activeFormValid: valid }),
  activeFormDirty: false,
  setActiveFormDirty: (dirty) => set({ activeFormDirty: dirty }),
  activeFormCancel: null,
  setActiveFormCancel: (fn) => set({ activeFormCancel: fn }),

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

  moveItemToSection: (from, to, id) =>
    set((state) => {
      const item = state.resume?.[from]?.find((i) => i.id === id);
      if (!state.resume || !item) return state;
      return {
        resume: {
          ...state.resume,
          [from]: state.resume[from].filter((i) => i.id !== id),
          [to]: [...(state.resume[to] ?? []), item],
        },
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

  editingPage: null,
  setEditingPage: (value) => set({ editingPage: value }),

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

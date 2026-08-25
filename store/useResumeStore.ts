import { create } from 'zustand';
import { AttachmentSchemaType, ResumeDataSchemaType } from '@/lib/resume';

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

  // Set by SectionAttachments when "Add a page" (or its pencil-edit icon) is
  // clicked — swaps EditProfileDialog's whole body for PageEditorView. `onSave`
  // is a closure over that specific SectionAttachments instance's local
  // `attachments`/`onChange` pair, not a resume-wide store write: the owning
  // item may not be committed to the resume yet (e.g. a brand-new item still
  // being filled in), so writing the page into `resume[sectionKey]` by id
  // would silently do nothing for it. Going through the same local onChange
  // every other attachment already uses works for both committed and
  // in-progress items.
  editingPage: {
    attachment: AttachmentSchemaType | undefined;
    onSave: (page: AttachmentSchemaType) => void;
  } | null;
  setEditingPage: (
    value: {
      attachment: AttachmentSchemaType | undefined;
      onSave: (page: AttachmentSchemaType) => void;
    } | null,
  ) => void;

  isEditingTab: boolean;
  setIsEditingTab: (editing: boolean) => void;
  // Bumped whenever the global Cancel button discards changes — tabs key
  // their rendering on this so an in-progress add/edit form fully remounts
  // (and its local draft is dropped) instead of showing stale state.
  saveTrigger: number;
  triggerSave: () => void;
  isSaveDisabled: boolean;
  setIsSaveDisabled: (disabled: boolean) => void;

  // The currently-open tab form (if any) registers a commit function here so
  // the global Save button can flush an in-progress item into the resume
  // before persisting — there's only ever one form open at a time.
  activeFormCommit: (() => boolean) | null;
  setActiveFormCommit: (fn: (() => boolean) | null) => void;
  activeFormValid: boolean;
  setActiveFormValid: (valid: boolean) => void;
  // Whether the open form's fields actually differ from what it opened
  // with — distinct from the global hasUnsavedChanges, which can already be
  // true from an unrelated earlier edit elsewhere and would otherwise make
  // a freshly-opened, untouched form's Save button wrongly enabled.
  activeFormDirty: boolean;
  setActiveFormDirty: (dirty: boolean) => void;
  // Discards the open form's in-progress draft and returns to the list view
  // without committing it — the bottom bar's Cancel button while a form is
  // open. Distinct from activeFormCommit, which always tries to save.
  activeFormCancel: (() => void) | null;
  setActiveFormCancel: (fn: (() => void) | null) => void;

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

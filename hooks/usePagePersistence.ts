import { useUserActions } from '@/hooks/useUserActions';
import { useResumeStore } from '@/store/useResumeStore';
import {
  AttachmentSchemaType,
  ResumeDataSchemaType,
  withPageRemoved,
} from '@/lib/resume';

// Independently persists a single page's publish/unpublish/delete, decoupled
// from whatever else might currently be sitting unsaved in the editor.
//
// storeResume (lib/server/dbActions.ts) only ever does a full-row JSONB
// replace — there's no per-page API route or partial update. So "independent"
// here means: source the rest of the resume from a server-confirmed
// snapshot (never from a possibly-dirty local draft), patch in only this
// one page's change, and POST that whole thing through the existing
// save mutation. On success, write back with patchResumeQuiet — a merge,
// not a replace — so an unrelated in-progress edit elsewhere in the store
// is never silently discarded or bundled into this save.
export function usePagePersistence() {
  const { resumeQuery, saveResumeDataMutation } = useUserActions();

  function getBaseResume(): ResumeDataSchemaType | undefined {
    const { resume, hasUnsavedChanges } = useResumeStore.getState();
    // hasUnsavedChanges can be true purely from an in-progress tab form's
    // own dirty-tracking (see hooks/useTabEditor.ts) before `resume` itself
    // is touched — so when it's false, `resume` is already server-equal and
    // reading it locally is free. Only fall back to the last-fetched server
    // snapshot when there's reason to think `resume` might hold something
    // not yet persisted.
    if (!hasUnsavedChanges && resume) return resume;
    return resumeQuery.data?.resume?.resumeData ?? resume ?? undefined;
  }

  async function persistPatch(
    computePatch: (base: ResumeDataSchemaType) => Partial<ResumeDataSchemaType>,
  ): Promise<void> {
    const base = getBaseResume();
    if (!base) throw new Error('Resume not loaded yet');
    const patch = computePatch(base);
    await saveResumeDataMutation.mutateAsync({ ...base, ...patch });
    useResumeStore.getState().patchResumeQuiet(patch);
  }

  const publishPage = (page: AttachmentSchemaType) =>
    persistPatch((base) => {
      const published: AttachmentSchemaType = { ...page, hidden: false };
      const exists = (base.pages || []).some((p) => p.id === page.id);
      return {
        pages: exists
          ? (base.pages || []).map((p) => (p.id === page.id ? published : p))
          : [...(base.pages || []), published],
      };
    });

  const unpublishPage = (pageId: string) =>
    persistPatch((base) => ({
      pages: (base.pages || []).map((p) =>
        p.id === pageId ? { ...p, hidden: true } : p,
      ),
    }));

  const deletePage = (pageId: string) =>
    persistPatch((base) => withPageRemoved(base, pageId));

  return {
    publishPage,
    unpublishPage,
    deletePage,
    isSaving: saveResumeDataMutation.isPending,
  };
}

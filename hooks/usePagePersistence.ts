import { useUserActions } from '@/hooks/useUserActions';
import { useResumeStore } from '@/store/useResumeStore';
import {
  AttachmentSchemaType,
  ResumeDataSchemaType,
  withPageRemoved,
} from '@/lib/resume';

let queue: Promise<unknown> = Promise.resolve();

export function usePagePersistence() {
  const { saveResumeDataMutation } = useUserActions();

  async function persistPatch<T>(
    computePatch: (base: ResumeDataSchemaType) => {
      patch: Partial<ResumeDataSchemaType>;
      result: T;
    },
  ): Promise<T> {
    const run = async (): Promise<T> => {
      const base = useResumeStore.getState().resume;
      if (!base) throw new Error('Resume not loaded yet');
      const { patch, result } = computePatch(base);
      await saveResumeDataMutation.mutateAsync({ ...base, ...patch });
      useResumeStore.getState().applyPersistedPatch(patch);
      return result;
    };
    const outcome = queue.then(run, run);
    // Keep the queue alive regardless of this call's outcome, so a failure
    // doesn't permanently wedge every action after it.
    queue = outcome.then(
      () => undefined,
      () => undefined,
    );
    return outcome;
  }

  const publishPage = (page: AttachmentSchemaType) =>
    persistPatch((base) => {
      const published: AttachmentSchemaType = { ...page, hidden: false };
      const exists = (base.pages || []).some((p) => p.id === page.id);
      return {
        patch: {
          pages: exists
            ? (base.pages || []).map((p) => (p.id === page.id ? published : p))
            : [...(base.pages || []), published],
        },
        result: published,
      };
    });

  const unpublishPage = (page: AttachmentSchemaType) =>
    persistPatch((base) => {
      const unpublished: AttachmentSchemaType = { ...page, hidden: true };
      return {
        patch: {
          pages: (base.pages || []).map((p) =>
            p.id === page.id ? unpublished : p,
          ),
        },
        result: unpublished,
      };
    });

  const deletePage = (pageId: string) =>
    persistPatch((base) => ({
      patch: withPageRemoved(base, pageId),
      result: undefined,
    }));

  return {
    publishPage,
    unpublishPage,
    deletePage,
    isSaving: saveResumeDataMutation.isPending,
  };
}

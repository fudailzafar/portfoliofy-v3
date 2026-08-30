import { useMemo, useState } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { AttachmentSchemaType, estimateReadMinutes } from '@/lib/resume';
import { Pen } from 'lucide-react';
import { usePagePersistence } from '@/hooks/usePagePersistence';
import { DeleteConfirmDialog } from '../dialogs';
import { toast } from 'sonner';

function formatPageDate(createdAt?: string): string | null {
  if (!createdAt) return null;
  const parsed = new Date(createdAt);
  if (isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// The centralized Writing panel: every page on the resume, regardless of
// which section item(s) it's attached to (or none at all) — creating,
// editing, publishing, and deleting all happen here. A section item's own
// "Add a page" only ever attaches an already-published page from this list.
export function WritingTab({
  filter,
}: {
  filter: 'all' | 'published' | 'drafts';
}) {
  const resume = useResumeStore((state) => state.resume);
  const updateResume = useResumeStore((state) => state.updateResume);
  const setEditingPage = useResumeStore((state) => state.setEditingPage);
  const { publishPage, unpublishPage, deletePage } = usePagePersistence();
  const [pendingTogglePageId, setPendingTogglePageId] = useState<string | null>(
    null,
  );
  const [pendingDeletePageId, setPendingDeletePageId] = useState<string | null>(
    null,
  );

  const pages = useMemo(() => resume?.pages || [], [resume]);

  const filteredPages = useMemo(() => {
    const filtered =
      filter === 'published'
        ? pages.filter((p) => !p.hidden)
        : filter === 'drafts'
          ? pages.filter((p) => p.hidden)
          : pages;
    return [...filtered].sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    );
  }, [pages, filter]);

  const handleNewPage = () => {
    setEditingPage({ attachment: undefined });
  };

  const handleEditPage = (page: AttachmentSchemaType) => {
    setEditingPage({ attachment: page });
  };

  // Publish/Unpublish persist immediately and independently — see
  // hooks/usePagePersistence.ts. isBlurred is a separate, unrelated
  // visual-blur toggle and stays purely local (still rides along with the
  // outer global Save), so it keeps using updateResume.
  const handleTogglePublish = async (
    target: AttachmentSchemaType,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setPendingTogglePageId(target.id);
    try {
      if (target.hidden) await publishPage(target);
      else await unpublishPage(target.id);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update page',
      );
    } finally {
      setPendingTogglePageId(null);
    }
  };

  const toggleBlurred = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!resume) return;
    updateResume({
      pages: (resume.pages || []).map((p) =>
        p.id === pageId ? { ...p, isBlurred: !p.isBlurred } : p,
      ),
    });
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeletePageId) return;
    try {
      await deletePage(pendingDeletePageId);
      toast.success('Page deleted');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete page',
      );
    } finally {
      setPendingDeletePageId(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="mb-2 flex items-center justify-between border-b border-border-subtle pb-4">
        <h2 className="hidden text-xl capitalize text-content-primary sm:block">
          {filter}
        </h2>
        <button
          onClick={handleNewPage}
          className="inline-flex h-8 items-center justify-center rounded-md border border-border-strong bg-surface-card px-4 text-[13px] font-medium text-content-primary shadow-sm transition-colors active:bg-surface-3 dark:border-none dark:bg-border-subtle dark:active:bg-border-strong"
        >
          New page
        </button>
      </div>

      {filteredPages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-content-muted">
          <Pen className="mb-4 h-8 w-8" />
          <p className="text-sm">
            No {filter !== 'all' ? filter : ''} pages found.
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {filteredPages.map((page) => (
            <div
              key={page.id}
              className="group flex flex-col border-b border-border-strong pb-4 pt-4 first:pt-0"
            >
              <div
                onClick={() => handleEditPage(page)}
                className={`flex cursor-pointer items-center justify-between gap-4 transition-all duration-200 ${page.isBlurred ? 'opacity-50 blur-[1px]' : ''}`}
              >
                <div className="flex flex-col">
                  <span className="text-sm text-content-primary">
                    {page.title || 'Untitled'}
                  </span>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-content-muted">
                    {formatPageDate(page.createdAt) && (
                      <>
                        <span>{formatPageDate(page.createdAt)}</span>
                        <span>·</span>
                      </>
                    )}
                    <span>
                      {estimateReadMinutes(page.content || '')} min read
                    </span>
                  </div>
                </div>

                {page.url ? (
                  <div className="ml-4 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={page.url}
                      alt="Thumbnail"
                      className="h-16 w-24 rounded-xl border border-border-strong object-cover shadow-sm sm:h-28 sm:w-48"
                    />
                  </div>
                ) : (
                  <div className="ml-4 h-16 w-24 shrink-0 rounded-lg border border-dashed border-border-strong bg-surface-2 sm:h-28 sm:w-48" />
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-content-muted transition-opacity duration-200">
                <button
                  onClick={() => handleEditPage(page)}
                  className="hover:underline hover:underline-offset-4"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => handleTogglePublish(page, e)}
                  disabled={pendingTogglePageId === page.id}
                  className="hover:underline hover:underline-offset-4 disabled:opacity-50"
                >
                  {pendingTogglePageId === page.id
                    ? 'Saving…'
                    : page.hidden
                      ? 'Publish'
                      : 'Unpublish'}
                </button>
                <button
                  onClick={(e) => toggleBlurred(page.id, e)}
                  className="hover:underline hover:underline-offset-4"
                >
                  {page.isBlurred ? 'Show' : 'Hide'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingDeletePageId(page.id);
                  }}
                  className="hover:underline hover:underline-offset-4"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        open={!!pendingDeletePageId}
        onOpenChange={(open) => !open && setPendingDeletePageId(null)}
        description="This will permanently delete this page. This action cannot be undone."
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

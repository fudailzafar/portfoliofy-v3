import { useMemo } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { AttachmentSchemaType, estimateReadMinutes } from '@/lib/resume';
import { Pen } from 'lucide-react';

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

  const savePage = (updated: AttachmentSchemaType) => {
    if (!resume) return;
    const exists = (resume.pages || []).some((p) => p.id === updated.id);
    const newPages = exists
      ? (resume.pages || []).map((p) => (p.id === updated.id ? updated : p))
      : [...(resume.pages || []), updated];
    updateResume({ pages: newPages });
    setEditingPage(null);
  };

  const handleNewPage = () => {
    setEditingPage({ attachment: undefined, onSave: savePage });
  };

  const handleEditPage = (page: AttachmentSchemaType) => {
    setEditingPage({ attachment: page, onSave: savePage });
  };

  const toggleField = (
    pageId: string,
    field: 'hidden' | 'isBlurred',
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (!resume) return;
    updateResume({
      pages: (resume.pages || []).map((p) =>
        p.id === pageId ? { ...p, [field]: !p[field] } : p,
      ),
    });
  };

  const handleDelete = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!resume) return;
    const newPages = (resume.pages || []).filter((p) => p.id !== pageId);

    // A deleted page can be attached to more than one section item — drop
    // its stub everywhere it appears, not just wherever it was clicked from.
    const sectionKeys: (keyof typeof resume)[] = [
      'workExperience',
      'education',
      'projects',
      'sideProjects',
      'speaking',
      'writing',
      'exhibitions',
      'features',
      'volunteering',
      'awards',
      'certifications',
    ];
    const updates: Record<string, any> = { pages: newPages };
    for (const key of sectionKeys) {
      const items = resume[key];
      if (!Array.isArray(items)) continue;
      updates[key] = items.map((item: any) =>
        item.attachments?.some(
          (a: AttachmentSchemaType) => a.type === 'page' && a.id === pageId,
        )
          ? {
              ...item,
              attachments: item.attachments.filter(
                (a: AttachmentSchemaType) =>
                  !(a.type === 'page' && a.id === pageId),
              ),
            }
          : item,
      );
    }
    updateResume(updates);
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
                  onClick={(e) => toggleField(page.id, 'hidden', e)}
                  className="hover:underline hover:underline-offset-4"
                >
                  {page.hidden ? 'Publish' : 'Unpublish'}
                </button>
                <button
                  onClick={(e) => toggleField(page.id, 'isBlurred', e)}
                  className="hover:underline hover:underline-offset-4"
                >
                  {page.isBlurred ? 'Show' : 'Hide'}
                </button>
                <button
                  onClick={(e) => handleDelete(page.id, e)}
                  className="hover:underline hover:underline-offset-4"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

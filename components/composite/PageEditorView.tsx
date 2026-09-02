'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { createPortal } from 'react-dom';
import { AttachmentSchemaType, slugify, dedupeSlug } from '@/lib/resume';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import {
  ArrowLeft,
  X,
  Bold,
  Italic,
  Strikethrough,
  Link as LinkIcon,
  CodeXml,
} from 'lucide-react';
import { cn, getOptimizedImageUrl } from '@/lib/utils';
import { useS3Upload } from 'next-s3-upload';
import { Embed, EmbedProvider } from '@/components/composite/tiptap-embed';
import {
  ContentImage,
  ContentVideo,
} from '@/components/composite/tiptap-media';
import { Spinner } from '../ui/spinner';
import { MediaUploadDialog } from '@/components/composite/MediaUploadDialog';
import { EmbedDialog } from '@/components/composite/EmbedDialog';
import { PageContent } from '@/components/composite/PageContent';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { DeleteConfirmDialog } from '@/app/[username]/_components/resume/editing/dialogs';
import { usePagePersistence } from '@/hooks/usePagePersistence';
import { useAnchoredMenu } from '@/hooks/useAnchoredMenu';
import { useResumeStore } from '@/store/useResumeStore';
import { withErrorToast } from '@/lib/errorToast';
import { toast } from 'sonner';

function toDateInputValue(isoString?: string): string {
  if (!isoString) return '';
  const parsed = new Date(isoString);
  if (isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

function fromDateInputValue(dateValue: string): string {
  return new Date(`${dateValue}T12:00:00`).toISOString();
}

type PageStatus = 'new' | 'draft' | 'published';

interface EditorSnapshot {
  slug: string;
  date: string;
  title: string;
  content: string;
  thumbnailUrl: string;
}

function snapshotFromPage(page?: AttachmentSchemaType): EditorSnapshot {
  return page
    ? {
        slug: page.slug || '',
        date:
          toDateInputValue(page.createdAt) ||
          toDateInputValue(new Date().toISOString()),
        title: page.title || '',
        content: page.content || '',
        thumbnailUrl: page.url || '',
      }
    : {
        slug: '',
        date: toDateInputValue(new Date().toISOString()),
        title: '',
        content: '',
        thumbnailUrl: '',
      };
}

const BLOCK_TYPE_OPTIONS: {
  label: string;
  isActive: (editor: NonNullable<ReturnType<typeof useEditor>>) => boolean;
  run: (editor: NonNullable<ReturnType<typeof useEditor>>) => void;
}[] = [
  {
    label: 'Heading 1',
    isActive: (editor) => editor.isActive('heading', { level: 2 }),
    run: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: 'Heading 2',
    isActive: (editor) => editor.isActive('heading', { level: 3 }),
    run: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    label: 'Paragraph',
    isActive: (editor) => editor.isActive('paragraph'),
    run: (editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    label: 'Blockquote',
    isActive: (editor) => editor.isActive('blockquote'),
    run: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    label: 'Code block',
    isActive: (editor) => editor.isActive('codeBlock'),
    run: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    label: 'Ordered list',
    isActive: (editor) => editor.isActive('orderedList'),
    run: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    label: 'Bulleted list',
    isActive: (editor) => editor.isActive('bulletList'),
    run: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
];

export function PageEditorView({
  page,
  usedSlugs,
  onClose,
}: {
  page?: AttachmentSchemaType;
  usedSlugs: Set<string>;
  onClose: () => void;
}) {
  const [slug, setSlug] = useState('');
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadToS3 } = useS3Upload();
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [isEmbedDialogOpen, setIsEmbedDialogOpen] = useState(false);
  const insertMenu = useAnchoredMenu();
  const turnIntoMenu = useAnchoredMenu();
  const statusMenu = useAnchoredMenu();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  // Slug auto-follows the title until the user edits it by hand.
  const slugTouchedRef = useRef(false);
  // The values the editor last matched the persisted page on — updated by
  // resetToBaseline (mount / page change / Discard changes). Compared
  // against current field values to derive isDirty below.
  const baselineRef = useRef<EditorSnapshot>(snapshotFromPage(page));

  const { publishPage, unpublishPage, deletePage, isSaving } =
    usePagePersistence();
  const resume = useResumeStore((state) => state.resume);
  const setEditingPage = useResumeStore((state) => state.setEditingPage);
  const design = resume?.design;

  // Resets the visible fields (and re-baselines isDirty against them) for
  // whichever page is currently open — on mount, when a different page is
  // opened, and on demand from "Discard changes" (handleDiscardChanges
  // below also resets the Tiptap editor itself, which this alone doesn't).
  const resetToBaseline = useCallback(() => {
    const next = snapshotFromPage(page);
    setSlug(next.slug);
    setDate(next.date);
    setTitle(next.title);
    setContent(next.content);
    setThumbnailUrl(next.thumbnailUrl);
    slugTouchedRef.current = !!page;
    baselineRef.current = next;
  }, [page]);

  useEffect(() => {
    resetToBaseline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Embed,
      ContentImage,
      ContentVideo,
    ],
    content: content,
    editorProps: {
      attributes: {
        class:
          'min-h-[300px] w-full bg-transparent outline-none blog-prose prose prose-sm max-w-none text-theme-primary [--tw-prose-bullets:var(--theme-secondary)] [--tw-prose-counters:var(--theme-secondary)] prose-headings:font-normal prose-headings:text-theme-primary prose-h2:mb-4 prose-h2:mt-8 prose-h2:text-[20px] prose-h3:mb-4 prose-h3:mt-8 prose-h3:text-[16px] prose-p:text-[14px] prose-p:text-theme-primary prose-a:border-b prose-a:border-theme-muted prose-a:font-normal prose-a:text-theme-primary prose-a:no-underline prose-blockquote:mx-0 prose-blockquote:my-6 prose-blockquote:border-l-2 prose-blockquote:border-theme-primary prose-blockquote:pl-[1em] prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-theme-primary prose-strong:font-medium prose-strong:text-theme-primary prose-code:mx-[2px] prose-code:rounded-[2px] prose-code:bg-[#F2F2F2] prose-code:px-[2px] prose-code:font-mono prose-code:text-[14px] prose-code:font-normal prose-code:text-theme-primary prose-code:before:content-none prose-code:after:content-none prose-pre:rounded-lg prose-pre:bg-[#FAFAFA] prose-pre:px-4 prose-pre:py-2 prose-pre:font-mono prose-pre:text-[14px] prose-pre:text-theme-primary prose-ol:pl-0 prose-ol:text-theme-primary prose-ul:my-1 prose-ul:pl-0 prose-ul:text-theme-primary prose-li:pl-0 prose-li:leading-[1.6] prose-li:text-theme-primary prose-hr:my-12 prose-hr:border-theme-border dark:prose-code:bg-[#333] dark:prose-pre:bg-[#333] [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none [&_h2_code]:text-[20px] [&_h3_code]:text-[16px]',
      },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const next = page?.content || '';
    // A page's id transitions from undefined to a real UUID the moment it's
    // first published, while the editor stays open (mounted) across that —
    // without this check, setContent would unconditionally replace the
    // document with textually-identical content, jumping the cursor to the
    // end and pushing a spurious entry onto the undo stack.
    if (editor.getHTML() === next) return;
    editor.commands.setContent(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page?.id, editor]);

  // "Discard changes" — page itself hasn't changed (that's the whole point,
  // vs. the effect above), so resetToBaseline alone wouldn't re-run; also
  // reset the Tiptap editor's own content directly.
  const handleDiscardChanges = useCallback(() => {
    resetToBaseline();
    editor?.commands.setContent(page?.content || '');
  }, [resetToBaseline, editor, page]);

  const isDirty = useMemo(() => {
    const baseline = baselineRef.current;
    return (
      slug !== baseline.slug ||
      date !== baseline.date ||
      title !== baseline.title ||
      content !== baseline.content ||
      thumbnailUrl !== baseline.thumbnailUrl
    );
    // baselineRef only ever changes in the same update as one of these 5
    // fields (resetToBaseline/handleDiscardChanges set both together), so
    // depending on the fields alone is enough to stay correct.
  }, [slug, date, title, content, thumbnailUrl]);

  const status: PageStatus = !page
    ? 'new'
    : page.hidden
      ? 'draft'
      : 'published';

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    if (!slugTouchedRef.current) {
      setSlug(slugify(value));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    slugTouchedRef.current = true;
    setSlug(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''));
  };

  const buildPage = (): AttachmentSchemaType => {
    const finalSlug = dedupeSlug(slugify(slug) || slugify(title), usedSlugs);
    return {
      id: page?.id || crypto.randomUUID(),
      type: 'page',
      url: thumbnailUrl,
      slug: finalSlug,
      title,
      content,
      createdAt: date
        ? fromDateInputValue(date)
        : page?.createdAt || new Date().toISOString(),
      hidden: page?.hidden ?? false,
      isBlurred: page?.isBlurred ?? false,
    };
  };

  // Publishes (or, if already published, applies pending edits to) this
  // page immediately and independently of anything else unsaved elsewhere
  // in the profile editor — see hooks/usePagePersistence.ts. The editor
  // stays open; publishPage returns the actually-persisted page (always
  // hidden:false), which we feed back into the store directly rather than
  // the pre-publish `built` object, so the editor's own status display
  // can't drift from what was actually saved. Once editingPage.attachment
  // updates below, the `page` prop flowing back in re-triggers the reset
  // effect above, which re-baselines isDirty and flips `status`.
  const handlePublish = async () => {
    const wasPublished = status === 'published';
    await withErrorToast(async () => {
      const built = buildPage();
      const published = await publishPage(built);
      setEditingPage({ attachment: published });
      toast.success(wasPublished ? 'Changes published' : 'Page published');
    }, 'Failed to publish page');
  };

  // Uses buildPage() (current form state), not the stale `page` prop — so
  // unpublishing a page you've been editing but haven't saved doesn't
  // silently discard those edits. This makes Unpublish behave like Publish:
  // whatever's currently in the editor gets saved, just now hidden.
  const handleUnpublish = async () => {
    if (!page) return;
    statusMenu.setIsOpen(false);
    await withErrorToast(async () => {
      const built = buildPage();
      const unpublished = await unpublishPage(built);
      setEditingPage({ attachment: unpublished });
      toast.success('Page unpublished');
    }, 'Failed to unpublish page');
  };

  const handleConfirmDelete = async () => {
    if (!page) return;
    await withErrorToast(async () => {
      await deletePage(page.id);
      toast.success('Page deleted');
      setIsDeleteConfirmOpen(false);
      onClose();
    }, 'Failed to delete page');
  };

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleMediaInsert = (attachments: AttachmentSchemaType[]) => {
    setIsMediaDialogOpen(false);
    if (!editor || attachments.length === 0) return;

    const toNode = (a: AttachmentSchemaType) => {
      const src = getOptimizedImageUrl(a.url) || a.url;
      return a.type === 'video'
        ? { type: 'contentVideo', attrs: { src } }
        : { type: 'contentImage', attrs: { src } };
    };

    editor.chain().focus().insertContent(attachments.map(toNode)).run();
  };

  const handleEmbedInsert = (provider: EmbedProvider, src: string) => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertContent({ type: 'embed', attrs: { provider, src } })
      .run();
  };

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const { url } = await uploadToS3(file, {
        endpoint: { request: { url: '/api/s3-upload' } },
      });
      const optimizedUrl = getOptimizedImageUrl(url);
      setThumbnailUrl(optimizedUrl || url);
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-surface-1">
      <div className="scrollbar-hide flex h-12 shrink-0 items-center overflow-x-auto border-b border-border-strong bg-surface-1">
        <button
          onClick={onClose}
          className="flex h-full w-14 shrink-0 items-center justify-center border-r border-border-strong text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="relative h-full shrink-0">
          <button
            ref={statusMenu.triggerRef}
            onClick={() => statusMenu.setIsOpen((prev) => !prev)}
            disabled={isSaving}
            className={cn(
              'flex h-full items-center whitespace-nowrap border-r border-border-strong px-6 text-sm font-medium transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50',
              status === 'published'
                ? 'text-green-600 dark:text-green-500'
                : 'text-content-secondary hover:text-content-primary',
              statusMenu.isOpen && 'bg-surface-2',
            )}
          >
            {status === 'published' ? 'Published' : 'Draft'}
          </button>

          {statusMenu.isOpen &&
            statusMenu.pos &&
            createPortal(
              <div
                ref={statusMenu.dropdownRef}
                style={{ top: statusMenu.pos.top, left: statusMenu.pos.left }}
                className="pointer-events-auto fixed z-[100] w-52 overflow-hidden rounded-md border border-border-strong bg-surface-1 shadow-lg"
              >
                <button
                  onClick={() => {
                    statusMenu.setIsOpen(false);
                    setIsPreviewOpen(true);
                  }}
                  disabled={status === 'published' && !isDirty}
                  className="flex w-full items-center px-4 py-2.5 text-left text-sm text-content-secondary transition-colors active:bg-surface-2 active:text-content-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {status === 'published' ? 'Preview changes' : 'Preview draft'}
                </button>
                {status === 'published' && (
                  <button
                    onClick={() => {
                      handleDiscardChanges();
                      statusMenu.setIsOpen(false);
                    }}
                    disabled={!isDirty}
                    className="flex w-full items-center px-4 py-2.5 text-left text-sm text-content-secondary transition-colors hover:bg-surface-2 active:text-content-primary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Discard changes
                  </button>
                )}
                {status === 'published' && (
                  <button
                    onClick={handleUnpublish}
                    className="flex w-full items-center px-4 py-2.5 text-left text-sm text-content-secondary transition-colors hover:bg-surface-2 active:text-content-primary"
                  >
                    Unpublish
                  </button>
                )}
                {status !== 'new' && (
                  <button
                    onClick={() => {
                      statusMenu.setIsOpen(false);
                      setIsDeleteConfirmOpen(true);
                    }}
                    className="flex w-full items-center px-4 py-2.5 text-left text-sm text-content-secondary transition-colors hover:bg-surface-2 active:text-content-primary"
                  >
                    Delete
                  </button>
                )}
              </div>,
              document.body,
            )}
        </div>

        <div className="relative h-full shrink-0">
          <button
            ref={turnIntoMenu.triggerRef}
            onClick={() => turnIntoMenu.setIsOpen((prev) => !prev)}
            className={cn(
              'flex h-full items-center whitespace-nowrap border-r border-border-strong px-6 text-sm font-medium text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary',
              turnIntoMenu.isOpen && 'bg-surface-2 text-content-primary',
            )}
          >
            Turn into
          </button>

          {turnIntoMenu.isOpen &&
            editor &&
            turnIntoMenu.pos &&
            createPortal(
              <div
                ref={turnIntoMenu.dropdownRef}
                style={{
                  top: turnIntoMenu.pos.top,
                  left: turnIntoMenu.pos.left,
                }}
                className="pointer-events-auto fixed z-[100] w-48 overflow-hidden rounded-md border border-border-strong bg-surface-1 shadow-lg"
              >
                {BLOCK_TYPE_OPTIONS.map(({ label, isActive, run }) => {
                  const active = isActive(editor);
                  return (
                    <button
                      key={label}
                      onClick={() => {
                        run(editor);
                        turnIntoMenu.setIsOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface-2 hover:text-content-primary',
                        active
                          ? 'font-semibold text-content-primary'
                          : 'text-content-secondary',
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>,
              document.body,
            )}
        </div>

        <div className="relative h-full shrink-0">
          <button
            ref={insertMenu.triggerRef}
            onClick={() => insertMenu.setIsOpen((prev) => !prev)}
            className={cn(
              'flex h-full items-center gap-1.5 whitespace-nowrap border-r border-border-strong px-6 text-sm font-medium text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary',
              insertMenu.isOpen && 'bg-surface-2 text-content-primary',
            )}
          >
            Insert
          </button>

          {insertMenu.isOpen &&
            insertMenu.pos &&
            createPortal(
              <div
                ref={insertMenu.dropdownRef}
                style={{ top: insertMenu.pos.top, left: insertMenu.pos.left }}
                className="pointer-events-auto fixed z-[100] w-48 overflow-hidden rounded-md border border-border-strong bg-surface-1 shadow-lg"
              >
                <button
                  onClick={() => {
                    insertMenu.setIsOpen(false);
                    setIsMediaDialogOpen(true);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary"
                >
                  Photos and video
                </button>
                <button
                  onClick={() => {
                    insertMenu.setIsOpen(false);
                    setIsEmbedDialogOpen(true);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary"
                >
                  Embed
                </button>
              </div>,
              document.body,
            )}
        </div>

        <MediaUploadDialog
          open={isMediaDialogOpen}
          onOpenChange={setIsMediaDialogOpen}
          existingAttachments={[]}
          onSave={handleMediaInsert}
        />

        <EmbedDialog
          open={isEmbedDialogOpen}
          onOpenChange={setIsEmbedDialogOpen}
          onInsert={handleEmbedInsert}
        />

        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent
            hideCloseButton
            className="flex h-[100dvh] w-[100vw] max-w-[100vw] flex-col gap-0 overflow-hidden rounded-none border-none bg-theme-bg p-0"
          >
            <DialogTitle className="sr-only">
              {status === 'published' ? 'Preview changes' : 'Preview draft'}
            </DialogTitle>
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-theme-border px-6">
              <span className="text-sm font-medium text-theme-muted">
                {status === 'published' ? 'Preview changes' : 'Preview draft'}
              </span>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-theme-muted transition-colors hover:bg-theme-border hover:text-theme-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div
              className={cn(
                'flex-1 overflow-y-auto bg-theme-bg px-6 py-12',
                design?.typography === 'serif'
                  ? 'font-serif'
                  : design?.typography === 'mono'
                    ? 'font-mono'
                    : 'font-sans',
                `typography-${design?.typography || 'sans'}`,
                `theme-${design?.theme || 'default'}`,
              )}
            >
              <div className="mx-auto w-full max-w-[540px]">
                <h1 className="mb-6 text-xl font-normal leading-6 text-theme-primary">
                  {title || 'Untitled'}
                </h1>
                <PageContent html={content} />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <DeleteConfirmDialog
          open={isDeleteConfirmOpen}
          onOpenChange={setIsDeleteConfirmOpen}
          description="This will permanently delete this page. This action cannot be undone."
          onConfirm={handleConfirmDelete}
          isLoading={isSaving}
        />

        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={cn(
            'flex h-full w-12 shrink-0 items-center justify-center border-r border-border-strong text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary',
            editor?.isActive('bold') && 'bg-surface-2 text-content-primary',
          )}
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={cn(
            'flex h-full w-12 shrink-0 items-center justify-center border-r border-border-strong text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary',
            editor?.isActive('italic') && 'bg-surface-2 text-content-primary',
          )}
        >
          <Italic className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          className={cn(
            'flex h-full w-12 shrink-0 items-center justify-center border-r border-border-strong text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary',
            editor?.isActive('strike') && 'bg-surface-2 text-content-primary',
          )}
        >
          <Strikethrough className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor?.chain().focus().toggleCode().run()}
          className={cn(
            'flex h-full w-12 shrink-0 items-center justify-center border-r border-border-strong text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary',
            editor?.isActive('code') && 'bg-surface-2 text-content-primary',
          )}
        >
          <CodeXml className="h-4 w-4" />
        </button>

        <button
          onClick={setLink}
          className={cn(
            'flex h-full w-12 shrink-0 items-center justify-center border-r border-border-strong text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary',
            editor?.isActive('link') && 'bg-surface-2 text-content-primary',
          )}
        >
          <LinkIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto px-8 py-12 md:px-24">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-1 flex-col gap-6">
              <div className="flex items-center gap-6">
                <span className="w-12 text-sm text-content-muted">Slug</span>
                <div className="flex flex-1 items-center gap-0.5 text-sm">
                  <span className="font-mono text-content-muted">/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={handleSlugChange}
                    className="flex-1 bg-transparent font-mono tracking-wide text-content-primary outline-none placeholder:text-content-muted"
                    placeholder="my-unique-url"
                  />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="w-12 text-sm text-content-muted">Date</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="font-regular flex-1 bg-transparent text-sm tracking-wide text-content-primary outline-none [color-scheme:light] dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:pointer-events-none [&::-webkit-calendar-picker-indicator]:hidden"
                />
              </div>
              <div className="flex items-center gap-6">
                <span className="w-12 text-sm text-content-muted">Title</span>
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  className="font-regular flex-1 bg-transparent text-sm tracking-wide text-content-primary outline-none placeholder:text-content-muted"
                  placeholder="Untitled"
                />
              </div>
            </div>

            {/* Thumbnail Area */}
            <div className="shrink-0 sm:ml-8">
              {thumbnailUrl ? (
                <div className="group relative h-24 w-40 overflow-hidden rounded-xl border border-border-strong bg-surface-2 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail"
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() => setThumbnailUrl('')}
                    className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex h-24 w-40 flex-col items-center justify-center rounded-xl border border-dashed border-border-strong text-xs text-content-muted transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Spinner size={4} />
                    </>
                  ) : (
                    <>+ Add thumbnail</>
                  )}
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleThumbnailUpload}
              />
            </div>
          </div>

          <div className="mb-8 mt-10 w-full border-t border-border-strong" />

          <div className="w-full">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
      {/* Bottom Bar */}
      <div className="flex h-20 shrink-0 items-center justify-end gap-3 border-t border-border-strong bg-surface-1 px-4">
        <button
          onClick={onClose}
          className="px-4 text-[14px] font-medium text-content-primary hover:underline hover:underline-offset-4"
        >
          Close
        </button>
        <button
          onClick={handlePublish}
          disabled={
            !title.trim() || isSaving || (status === 'published' && !isDirty)
          }
          className="h-9 rounded-md border border-border-strong bg-surface-1 px-6 text-sm font-medium text-content-primary shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 dark:border-none dark:bg-border-subtle dark:active:bg-border-strong"
        >
          {isSaving ? (
            <Spinner size={14} />
          ) : status === 'published' ? (
            'Save'
          ) : (
            'Publish'
          )}
        </button>
      </div>
    </div>
  );
}

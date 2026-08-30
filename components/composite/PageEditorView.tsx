'use client';

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
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
  Gallery,
} from '@/components/composite/tiptap-media';
import { Spinner } from '../ui/spinner';
import { MediaUploadDialog } from '@/components/composite/MediaUploadDialog';
import { EmbedDialog } from '@/components/composite/EmbedDialog';

function toDateInputValue(isoString?: string): string {
  if (!isoString) return '';
  const parsed = new Date(isoString);
  if (isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

function fromDateInputValue(dateValue: string): string {
  return new Date(`${dateValue}T12:00:00`).toISOString();
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
  onSave,
  onClose,
}: {
  page?: AttachmentSchemaType;
  usedSlugs: Set<string>;
  onSave: (page: AttachmentSchemaType) => void;
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
  const [isInsertMenuOpen, setIsInsertMenuOpen] = useState(false);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [isEmbedDialogOpen, setIsEmbedDialogOpen] = useState(false);
  const insertMenuRef = useRef<HTMLDivElement>(null);
  const insertButtonRef = useRef<HTMLButtonElement>(null);
  const insertDropdownRef = useRef<HTMLDivElement>(null);
  const [insertMenuPos, setInsertMenuPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [isTurnIntoMenuOpen, setIsTurnIntoMenuOpen] = useState(false);
  const turnIntoMenuRef = useRef<HTMLDivElement>(null);
  const turnIntoButtonRef = useRef<HTMLButtonElement>(null);
  const turnIntoDropdownRef = useRef<HTMLDivElement>(null);
  const [turnIntoMenuPos, setTurnIntoMenuPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  // Slug auto-follows the title until the user edits it by hand.
  const slugTouchedRef = useRef(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        insertMenuRef.current &&
        !insertMenuRef.current.contains(target) &&
        !insertDropdownRef.current?.contains(target)
      ) {
        setIsInsertMenuOpen(false);
      }
      if (
        turnIntoMenuRef.current &&
        !turnIntoMenuRef.current.contains(target) &&
        !turnIntoDropdownRef.current?.contains(target)
      ) {
        setIsTurnIntoMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useLayoutEffect(() => {
    if (isTurnIntoMenuOpen && turnIntoButtonRef.current) {
      const rect = turnIntoButtonRef.current.getBoundingClientRect();
      setTurnIntoMenuPos({ top: rect.bottom + 4, left: rect.left });
    }
  }, [isTurnIntoMenuOpen]);

  useLayoutEffect(() => {
    if (isInsertMenuOpen && insertButtonRef.current) {
      const rect = insertButtonRef.current.getBoundingClientRect();
      setInsertMenuPos({ top: rect.bottom + 4, left: rect.left });
    }
  }, [isInsertMenuOpen]);

  useEffect(() => {
    if (page) {
      setSlug(page.slug || '');
      setDate(
        toDateInputValue(page.createdAt) ||
          toDateInputValue(new Date().toISOString()),
      );
      setTitle(page.title || '');
      setContent(page.content || '');
      setThumbnailUrl(page.url || '');
      slugTouchedRef.current = true;
    } else {
      setSlug('');
      setDate(toDateInputValue(new Date().toISOString()));
      setTitle('');
      setContent('');
      setThumbnailUrl('');
      slugTouchedRef.current = false;
    }
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
      Gallery,
    ],
    content: content,
    editorProps: {
      attributes: {
        class:
          'min-h-[300px] w-full bg-transparent outline-none prose blog-prose prose-sm dark:prose-invert max-w-none pt-4 prose-headings:font-normal prose-p:text-[14px] prose-h2:mb-4 prose-h2:mt-8 prose-h2:text-[20px] prose-h3:mb-4 prose-h3:mt-8 prose-h3:text-[16px] prose-a:font-normal prose-a:text-content-primary prose-a:no-underline prose-a:border-b prose-a:border-content-muted prose-blockquote:mx-0 prose-blockquote:my-6 prose-blockquote:pl-[1em] prose-blockquote:font-normal prose-blockquote:not-italic [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none prose-strong:font-medium prose-code:font-mono prose-code:text-[14px] prose-code:bg-[#F2F2F2] dark:prose-code:bg-[#2F2F2F] prose-code:rounded-[2px] prose-code:px-[2px] prose-code:mx-[2px] [&_h2_code]:text-[20px] [&_h3_code]:text-[16px] prose-pre:rounded-lg prose-pre:bg-[#FAFAFA] dark:prose-pre:bg-[#2F2F2F] prose-pre:font-mono prose-pre:text-[14px] prose-hr:my-12 prose-ol:pl-0 prose-ul:pl-0 prose-li:pl-0 prose-ul:my-1 prose-li:leading-[1.6] [--tw-prose-bullets:var(--content-secondary)] [--tw-prose-counters:var(--content-secondary)]',
      },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(page?.content || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page?.id, editor]);

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

  const handleSave = () => {
    const finalSlug = dedupeSlug(slugify(slug) || slugify(title), usedSlugs);
    const savedPage: AttachmentSchemaType = {
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
    onSave(savedPage);
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

    if (attachments.length === 1) {
      editor.chain().focus().insertContent(toNode(attachments[0])).run();
    } else if (attachments.every((a) => a.type !== 'video')) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'gallery',
          attrs: {
            images: attachments.map(
              (a) => getOptimizedImageUrl(a.url) || a.url,
            ),
          },
        })
        .run();
    } else {
      editor.chain().focus().insertContent(attachments.map(toNode)).run();
    }
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

        <div ref={turnIntoMenuRef} className="relative h-full shrink-0">
          <button
            ref={turnIntoButtonRef}
            onClick={() => setIsTurnIntoMenuOpen((prev) => !prev)}
            className={cn(
              'flex h-full items-center whitespace-nowrap border-r border-border-strong px-6 text-sm font-medium text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary',
              isTurnIntoMenuOpen && 'bg-surface-2 text-content-primary',
            )}
          >
            Turn into
          </button>

          {isTurnIntoMenuOpen &&
            editor &&
            turnIntoMenuPos &&
            createPortal(
              <div
                ref={turnIntoDropdownRef}
                style={{ top: turnIntoMenuPos.top, left: turnIntoMenuPos.left }}
                className="pointer-events-auto fixed z-[100] w-48 overflow-hidden rounded-md border border-border-strong bg-surface-1 shadow-lg"
              >
                {BLOCK_TYPE_OPTIONS.map(({ label, isActive, run }) => {
                  const active = isActive(editor);
                  return (
                    <button
                      key={label}
                      onClick={() => {
                        run(editor);
                        setIsTurnIntoMenuOpen(false);
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

        <div ref={insertMenuRef} className="relative h-full shrink-0">
          <button
            ref={insertButtonRef}
            onClick={() => setIsInsertMenuOpen((prev) => !prev)}
            className={cn(
              'flex h-full items-center gap-1.5 whitespace-nowrap border-r border-border-strong px-6 text-sm font-medium text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary',
              isInsertMenuOpen && 'bg-surface-2 text-content-primary',
            )}
          >
            Insert
          </button>

          {isInsertMenuOpen &&
            insertMenuPos &&
            createPortal(
              <div
                ref={insertDropdownRef}
                style={{ top: insertMenuPos.top, left: insertMenuPos.left }}
                className="pointer-events-auto fixed z-[100] w-48 overflow-hidden rounded-md border border-border-strong bg-surface-1 shadow-lg"
              >
                <button
                  onClick={() => {
                    setIsInsertMenuOpen(false);
                    setIsMediaDialogOpen(true);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary"
                >
                  Photos and video
                </button>
                <button
                  onClick={() => {
                    setIsInsertMenuOpen(false);
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
          onClick={handleSave}
          disabled={!title.trim()}
          className="h-9 rounded-md border border-border-strong bg-surface-1 px-6 text-sm font-medium text-content-primary shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 dark:border-none dark:bg-border-subtle dark:active:bg-border-strong"
        >
          Publish
        </button>
      </div>
    </div>
  );
}

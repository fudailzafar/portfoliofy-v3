'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Code,
  Link as LinkIcon,
  Loader2,
  Image as ImageIcon,
  Figma,
  Film,
  Youtube,
  Twitter,
} from 'lucide-react';
import { cn, getOptimizedImageUrl } from '@/lib/utils';
import { useS3Upload } from 'next-s3-upload';
import {
  Embed,
  EmbedProvider,
  parseEmbedUrl,
} from '@/components/composite/tiptap-embed';
import { ContentImage, Gallery } from '@/components/composite/tiptap-media';
import { Spinner } from '../ui/spinner';

const EMBED_PROVIDER_LABELS: Record<EmbedProvider, string> = {
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  figma: 'Figma',
  twitter: 'X/Twitter',
};

// Converts the block the cursor is in to a different type — matches
// read.cv's own "Turn into" menu (Heading 1/2, Paragraph, Blockquote, Code
// block, Ordered/Bulleted list). All of these commands already come from
// StarterKit, which PageEditorView loads in full (unlike the base
// RichTextEditor, which disables everything but paragraphs/lists/links).
const BLOCK_TYPE_OPTIONS: {
  label: string;
  isActive: (editor: NonNullable<ReturnType<typeof useEditor>>) => boolean;
  run: (editor: NonNullable<ReturnType<typeof useEditor>>) => void;
}[] = [
  {
    label: 'Heading 1',
    isActive: (editor) => editor.isActive('heading', { level: 1 }),
    run: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    label: 'Heading 2',
    isActive: (editor) => editor.isActive('heading', { level: 2 }),
    run: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
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
  // Every slug already in use elsewhere on this resume (excluding `page`
  // itself) — collisions are de-duped silently on save, not blocked.
  usedSlugs: Set<string>;
  onSave: (page: AttachmentSchemaType) => void;
  onClose: () => void;
}) {
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);
  const { uploadToS3 } = useS3Upload();
  const [isUploadingContentImages, setIsUploadingContentImages] =
    useState(false);
  const [isInsertMenuOpen, setIsInsertMenuOpen] = useState(false);
  const insertMenuRef = useRef<HTMLDivElement>(null);
  const [isTurnIntoMenuOpen, setIsTurnIntoMenuOpen] = useState(false);
  const turnIntoMenuRef = useRef<HTMLDivElement>(null);
  // Slug auto-follows the title until the user edits it by hand.
  const slugTouchedRef = useRef(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        insertMenuRef.current &&
        !insertMenuRef.current.contains(event.target as Node)
      ) {
        setIsInsertMenuOpen(false);
      }
      if (
        turnIntoMenuRef.current &&
        !turnIntoMenuRef.current.contains(event.target as Node)
      ) {
        setIsTurnIntoMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (page) {
      setSlug(page.slug || '');
      setTitle(page.title || '');
      setContent(page.content || '');
      setThumbnailUrl(page.url || '');
      slugTouchedRef.current = true;
    } else {
      setSlug('');
      setTitle('');
      setContent('');
      setThumbnailUrl('');
      slugTouchedRef.current = false;
    }
  }, [page]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Embed,
      ContentImage,
      Gallery,
    ],
    content: content,
    editorProps: {
      attributes: {
        class:
          'min-h-[300px] w-full bg-transparent outline-none prose blog-prose prose-sm dark:prose-invert max-w-none pt-4 prose-p:text-[14px] prose-h1:text-[20px] prose-h2:text-[20px] prose-h3:text-[16px] prose-a:no-underline prose-a:border-b prose-a:border-content-muted prose-blockquote:mx-0 prose-blockquote:my-6 prose-blockquote:ml-[1em] prose-blockquote:pl-[1em] prose-strong:font-medium prose-code:font-mono prose-code:bg-[#FAFAFA] dark:prose-code:bg-[#2F2F2F] prose-code:rounded-[2px] prose-code:px-[2px] prose-code:mx-[2px] [&_h2_code]:text-[20px] [&_h3_code]:text-[16px] prose-pre:rounded-lg prose-pre:bg-[#FAFAFA] dark:prose-pre:bg-[#2F2F2F] prose-pre:font-mono prose-pre:text-[14px] prose-hr:my-12 prose-ol:pl-0 prose-ul:pl-0 prose-li:pl-0 prose-ul:my-1 prose-li:leading-[1.6] [--tw-prose-bullets:var(--content-secondary)] [--tw-prose-counters:var(--content-secondary)]',
      },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

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
      createdAt: page?.createdAt || new Date().toISOString(),
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

  const insertEmbed = (provider: EmbedProvider) => {
    if (!editor) return;
    setIsInsertMenuOpen(false);
    const url = window.prompt(`${EMBED_PROVIDER_LABELS[provider]} URL`);
    if (!url) return;
    const parsed = parseEmbedUrl(url);
    if (!parsed || parsed.provider !== provider) {
      window.alert(
        `That doesn't look like a ${EMBED_PROVIDER_LABELS[provider]} URL.`,
      );
      return;
    }
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'embed',
        attrs: { provider: parsed.provider, src: parsed.src },
      })
      .run();
  };

  const handleInsertImagesClick = () => {
    setIsInsertMenuOpen(false);
    contentImageInputRef.current?.click();
  };

  const handleContentImagesUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !editor) return;

    try {
      setIsUploadingContentImages(true);
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const { url } = await uploadToS3(file, {
            endpoint: { request: { url: '/api/s3-upload' } },
          });
          return getOptimizedImageUrl(url) || url;
        }),
      );

      if (uploaded.length === 1) {
        editor
          .chain()
          .focus()
          .insertContent({ type: 'contentImage', attrs: { src: uploaded[0] } })
          .run();
      } else {
        editor
          .chain()
          .focus()
          .insertContent({ type: 'gallery', attrs: { images: uploaded } })
          .run();
      }
    } catch (error) {
      console.error('Error uploading content images:', error);
    } finally {
      setIsUploadingContentImages(false);
      if (contentImageInputRef.current) {
        contentImageInputRef.current.value = '';
      }
    }
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
      {/* Top Bar */}
      <div className="flex h-12 shrink-0 items-center border-b border-border-strong bg-surface-1">
        <button
          onClick={onClose}
          className="flex h-full w-14 items-center justify-center border-r border-border-strong text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div ref={turnIntoMenuRef} className="relative h-full">
          <button
            onClick={() => setIsTurnIntoMenuOpen((prev) => !prev)}
            className={cn(
              'flex h-full items-center border-r border-border-strong px-6 text-sm font-medium text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary',
              isTurnIntoMenuOpen && 'bg-surface-2 text-content-primary',
            )}
          >
            Turn into
          </button>

          {isTurnIntoMenuOpen && editor && (
            <div className="absolute left-0 top-full z-10 mt-1 w-48 overflow-hidden rounded-md border border-border-strong bg-surface-1 shadow-lg">
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
            </div>
          )}
        </div>

        <div ref={insertMenuRef} className="relative h-full">
          <button
            onClick={() => setIsInsertMenuOpen((prev) => !prev)}
            className={cn(
              'flex h-full items-center gap-1.5 border-r border-border-strong px-6 text-sm font-medium text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary',
              isInsertMenuOpen && 'bg-surface-2 text-content-primary',
            )}
          >
            Insert
          </button>

          {isInsertMenuOpen && (
            <div className="absolute left-0 top-full z-10 mt-1 w-48 overflow-hidden rounded-md border border-border-strong bg-surface-1 shadow-lg">
              <button
                onClick={handleInsertImagesClick}
                disabled={isUploadingContentImages}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploadingContentImages ? (
                  <Spinner size={4} />
                ) : (
                  <ImageIcon className="h-4 w-4" />
                )}
                Image
              </button>
              <button
                onClick={() => insertEmbed('figma')}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary"
              >
                <Figma className="h-4 w-4" />
                Figma
              </button>
              <button
                onClick={() => insertEmbed('vimeo')}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary"
              >
                <Film className="h-4 w-4" />
                Vimeo
              </button>
              <button
                onClick={() => insertEmbed('youtube')}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary"
              >
                <Youtube className="h-4 w-4" />
                YouTube
              </button>
              <button
                onClick={() => insertEmbed('twitter')}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary"
              >
                <Twitter className="h-4 w-4" />
                X/Twitter
              </button>
            </div>
          )}
        </div>

        <input
          type="file"
          ref={contentImageInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleContentImagesUpload}
        />

        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={cn(
            'flex h-full w-12 items-center justify-center border-r border-border-strong text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary',
            editor?.isActive('bold') && 'bg-surface-2 text-content-primary',
          )}
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={cn(
            'flex h-full w-12 items-center justify-center border-r border-border-strong text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary',
            editor?.isActive('italic') && 'bg-surface-2 text-content-primary',
          )}
        >
          <Italic className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          className={cn(
            'flex h-full w-12 items-center justify-center border-r border-border-strong text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary',
            editor?.isActive('strike') && 'bg-surface-2 text-content-primary',
          )}
        >
          <Strikethrough className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor?.chain().focus().toggleCode().run()}
          className={cn(
            'flex h-full w-12 items-center justify-center border-r border-border-strong text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary',
            editor?.isActive('code') && 'bg-surface-2 text-content-primary',
          )}
        >
          <Code className="h-4 w-4" />
        </button>

        <button
          onClick={setLink}
          className={cn(
            'flex h-full w-12 items-center justify-center border-r border-border-strong text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary',
            editor?.isActive('link') && 'bg-surface-2 text-content-primary',
          )}
        >
          <LinkIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto px-8 py-12 md:px-24">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-start justify-between">
            <div className="flex flex-1 flex-col gap-6">
              <div className="flex items-center gap-6">
                <span className="w-12 text-sm text-content-muted">Title</span>
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  className="flex-1 bg-transparent text-sm font-medium tracking-wide text-content-primary outline-none placeholder:text-content-muted"
                  placeholder="My new post"
                />
              </div>

              <div className="flex items-center gap-6">
                <span className="w-12 text-sm text-content-muted">Slug</span>
                <div className="flex flex-1 items-center gap-0.5 text-sm">
                  <span className="font-mono text-content-muted">/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={handleSlugChange}
                    className="flex-1 bg-transparent font-mono tracking-wide text-content-primary outline-none placeholder:text-content-muted"
                    placeholder="hello-world"
                  />
                </div>
              </div>
            </div>

            {/* Thumbnail Area */}
            <div className="ml-8 shrink-0">
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
          Save
        </button>
      </div>
    </div>
  );
}

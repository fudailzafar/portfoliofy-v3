'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Button } from '@/components/ui/button';
import { List, ListOrdered, Link as LinkIcon } from 'lucide-react';
import { cn, ensureHttps } from '@/lib/utils';
import { useEffect, useRef } from 'react';

export function RichTextEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
}) {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bold: false,
        italic: false,
        strike: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        // Disabled because we register @tiptap/extension-link separately below
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline underline-offset-4',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'min-h-[120px] w-full bg-transparent px-3 py-3 text-sm placeholder:text-content-muted focus:outline-none prose prose-sm dark:prose-invert max-w-none dark:border-none dark:bg-border-subtle',
      },
    },
    onUpdate: ({ editor }) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onChange(editor.getHTML());
      }, 500);
    },
  });

  // Re-sync if content changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link — normalize to an absolute URL first, otherwise a scheme-less
    // value like "google.com" is a relative link and resolves against the
    // current page (portfoliofy.me/google.com) instead of the real target.
    // mailto:/tel: are already absolute and must be left alone — ensureHttps
    // would otherwise mangle them into "https://mailto:...".
    const normalizedUrl =
      url.startsWith('mailto:') || url.startsWith('tel:')
        ? url
        : ensureHttps(url);
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: normalizedUrl })
      .run();
  };

  return (
    <div className="w-full overflow-hidden rounded-md bg-surface-3 shadow-sm focus-within:ring-1 focus-within:ring-black dark:border-none dark:bg-border-subtle dark:focus-within:ring-white">
      <div className="bg-surface-2/50 flex items-center border-b border-border-strong">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            'h-10 w-12 rounded-none border-r border-border-strong p-0 text-content-secondary hover:text-content-primary',
            editor.isActive('bulletList') &&
              'bg-surface-3 text-content-primary',
          )}
          aria-label="Toggle bullet list"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            'h-10 w-12 rounded-none border-r border-border-strong p-0 text-content-secondary hover:text-content-primary',
            editor.isActive('orderedList') &&
              'bg-surface-3 text-content-primary',
          )}
          aria-label="Toggle ordered list"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={setLink}
          className={cn(
            'h-10 w-12 rounded-none border-r border-border-strong p-0 text-content-secondary hover:text-content-primary',
            editor.isActive('link') && 'bg-surface-3 text-content-primary',
          )}
          aria-label="Add or edit link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

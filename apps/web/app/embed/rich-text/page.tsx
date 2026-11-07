'use client';

import { useEditor, useEditorState, EditorContent } from '@tiptap/react';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createRichTextExtensions } from '@/components/composite/RichTextEditor';
import { ensureHttps } from '@/lib/utils';

// The rich-text editor the mobile app shows in a WebView. The app owns the
// content: it sends HTML in through window.__setContent and gets changes and
// the page height back through ReactNativeWebView.postMessage.

type ToApp =
  | { type: 'ready' }
  | { type: 'change'; html: string }
  | { type: 'height'; value: number };

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (message: string) => void };
    __setContent?: (html: string) => void;
  }
}

function post(message: ToApp) {
  window.ReactNativeWebView?.postMessage(JSON.stringify(message));
}

export default function EmbeddedRichText() {
  const { setTheme } = useTheme();
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  // HTML last sent to or received from the app, so echoes don't loop.
  const lastHtmlRef = useRef('');

  const editor = useEditor({
    extensions: createRichTextExtensions(),
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'min-h-[120px] w-full bg-transparent px-3 py-3 text-base focus:outline-none prose prose-sm dark:prose-invert max-w-none',
        'data-placeholder': '',
      },
    },
    onUpdate: ({ editor }) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const html = editor.getHTML();
        lastHtmlRef.current = html;
        post({ type: 'change', html });
      }, 300);
    },
  });

  // The toolbar and placeholder must follow the content, which a plain
  // `editor.isActive()` read in render does not (it only re-renders on mount).
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isEmpty: editor?.isEmpty ?? true,
      bulletList: editor?.isActive('bulletList') ?? false,
      orderedList: editor?.isActive('orderedList') ?? false,
      link: editor?.isActive('link') ?? false,
    }),
  });

  // Theme and placeholder come from the app in the address.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const theme = params.get('theme');
    if (theme === 'dark' || theme === 'light') setTheme(theme);
    setPlaceholder(params.get('placeholder') ?? '');
  }, [setTheme]);

  useEffect(() => {
    if (!editor) return;
    window.__setContent = (html: string) => {
      if (html === lastHtmlRef.current) return;
      lastHtmlRef.current = html;
      editor.commands.setContent(html, { emitUpdate: false });
    };
    post({ type: 'ready' });
    return () => {
      window.__setContent = undefined;
    };
  }, [editor]);

  // Tell the app how tall the editor is, so it can size the WebView and
  // avoid a scroll area inside its own scroll area.
  const hasEditor = !!editor;
  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;
    let last = 0;
    const report = () => {
      const value = Math.ceil(element.getBoundingClientRect().height);
      if (value !== last) {
        last = value;
        post({ type: 'height', value });
      }
    };
    const observer = new ResizeObserver(report);
    observer.observe(element);
    report();
    return () => observer.disconnect();
  }, [hasEditor]);

  const openLink = useCallback(() => {
    if (!editor) return;
    setLinkValue(editor.getAttributes('link').href ?? '');
    setLinkOpen(true);
  }, [editor]);

  const applyLink = () => {
    if (!editor) return;
    const value = linkValue.trim();
    const chain = editor.chain().focus().extendMarkRange('link');
    if (!value) {
      chain.unsetLink().run();
    } else {
      // Scheme-less links would otherwise resolve against this site.
      const href =
        value.startsWith('mailto:') || value.startsWith('tel:')
          ? value
          : ensureHttps(value);
      chain.setLink({ href }).run();
    }
    setLinkOpen(false);
  };

  if (!editor) return null;
  const active = state ?? {
    isEmpty: true,
    bulletList: false,
    orderedList: false,
    link: false,
  };

  const button = (active: boolean) =>
    `h-11 flex-1 border-r border-border-strong text-sm font-medium text-content-secondary ${
      active ? 'bg-surface-3 text-content-primary' : ''
    }`;

  return (
    <div
      ref={wrapperRef}
      className="w-full overflow-hidden rounded-md bg-surface-3 dark:bg-border-subtle"
    >
      <div className="flex items-center border-b border-border-strong">
        <button
          type="button"
          className={button(active.bulletList)}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Toggle bullet list"
        >
          Bullets
        </button>
        <button
          type="button"
          className={button(active.orderedList)}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Toggle numbered list"
        >
          Numbers
        </button>
        <button
          type="button"
          className={button(active.link)}
          onClick={openLink}
          aria-label="Add or edit link"
        >
          Link
        </button>
      </div>
      {linkOpen && (
        <div className="flex items-center gap-2 border-b border-border-strong p-2">
          <input
            autoFocus
            type="url"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                applyLink();
              }
            }}
            placeholder="https://example.com…"
            aria-label="Link address"
            className="h-11 min-w-0 flex-1 rounded-md border border-border-strong bg-transparent px-3 text-base"
          />
          <button
            type="button"
            onClick={applyLink}
            className="h-11 rounded-md border border-border-strong px-4 text-sm font-medium"
          >
            {linkValue.trim() ? 'Apply' : 'Remove'}
          </button>
        </div>
      )}
      <div className="relative">
        {placeholder && active.isEmpty && (
          <span className="pointer-events-none absolute left-3 top-3 text-base text-content-muted">
            {placeholder}
          </span>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

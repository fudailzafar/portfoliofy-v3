'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmbedProvider, parseEmbedUrl } from './tiptap-embed';

const PROVIDERS: {
  id: EmbedProvider;
  label: string;
  description: string;
  placeholder: string;
}[] = [
  {
    id: 'twitter',
    label: 'Twitter',
    description: 'Add a link to a post on X/Twitter.',
    placeholder: 'https://twitter.com/...',
  },
  {
    id: 'vimeo',
    label: 'Vimeo',
    description: 'Add a link to a Vimeo video.',
    placeholder: 'https://vimeo.com/...',
  },
  {
    id: 'figma',
    label: 'Figma',
    description: 'Add a link to a Figma file or prototype.',
    placeholder: 'https://figma.com/...',
  },
];

interface EmbedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (provider: EmbedProvider, src: string) => void;
}

export function EmbedDialog({
  open,
  onOpenChange,
  onInsert,
}: EmbedDialogProps) {
  const [selected, setSelected] = useState<EmbedProvider>('figma');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  // Fresh state every time the dialog opens — this is a one-shot "add an
  // embed" flow, not something that remembers the last provider/URL typed.
  useEffect(() => {
    if (open) {
      setSelected('figma');
      setUrl('');
      setError('');
    }
  }, [open]);

  const active = PROVIDERS.find((p) => p.id === selected)!;

  const selectProvider = (provider: EmbedProvider) => {
    setSelected(provider);
    setUrl('');
    setError('');
  };

  const handleInsert = () => {
    const trimmed = url.trim();
    const parsed = parseEmbedUrl(trimmed);
    if (!parsed || parsed.provider !== selected) {
      setError(`That doesn't look like a ${active.label} URL.`);
      return;
    }
    onInsert(parsed.provider, parsed.src);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-[calc(100vw-32px)] flex-col overflow-hidden border-border-strong bg-surface-1 p-0 text-content-primary sm:h-[420px] sm:max-w-2xl sm:flex-row [&>button]:hidden">
        <DialogTitle className="sr-only">Embed content</DialogTitle>
        <DialogDescription className="sr-only">
          Embed a link from Figma, Vimeo, or X/Twitter
        </DialogDescription>

        {/* Provider list — a horizontal scrollable tab row on mobile,
            a fixed-width vertical sidebar from sm: up. */}
        <div className="flex shrink-0 overflow-x-auto border-b border-border-subtle sm:w-48 sm:flex-col sm:overflow-y-auto sm:overflow-x-visible sm:border-b-0 sm:border-r sm:py-2">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectProvider(p.id)}
              className={cn(
                'shrink-0 whitespace-nowrap px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface-2 sm:block sm:w-full sm:px-6',
                selected === p.id
                  ? 'bg-surface-2 font-medium text-content-primary'
                  : 'text-content-secondary',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex flex-1 flex-col justify-between overflow-y-auto p-6">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-content-primary">
              Embed from {active.label}
              <LinkIcon className="h-4 w-4 text-content-muted" />
            </h2>
            <p className="mt-2 text-sm text-content-secondary">
              {active.description}
            </p>

            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleInsert();
              }}
              placeholder={active.placeholder}
              className="mt-6 w-full rounded-md bg-surface-3 px-4 py-3 text-sm text-content-primary outline-none placeholder:text-content-muted"
            />
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 text-sm font-medium text-content-primary hover:underline hover:underline-offset-4"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInsert}
              disabled={!url.trim()}
              className="h-9 rounded-md border border-border-strong bg-surface-1 px-6 text-[14px] font-medium text-content-primary shadow-sm transition-all active:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-none dark:bg-border-subtle dark:active:bg-border-strong"
            >
              Insert
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

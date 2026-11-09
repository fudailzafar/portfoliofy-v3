'use client';

// read.cv's emoji picker, rebuilt: a search field and a skin-tone toggle in
// a 39px header, then a scrolling grid that only renders the rows in view.
// Measurements and colours come from read.cv's own stylesheet.

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { Spinner } from '@/components/ui/spinner';
import {
  loadPickerEmoji,
  searchEmoji,
  SKIN_TONE_PREVIEWS,
  withSkinTone,
  type PickerEmoji,
} from '@/lib/emojiData';
import { cn } from '@/lib/utils';

const SKIN_TONE_KEY = 'skinTone';
const GRID_HEIGHT = 280;
const HEADER_HEIGHT = 39;
// Rows drawn above and below the visible ones, so fast scrolling stays filled.
const OVERSCAN_ROWS = 2;

function readSkinTone(): number {
  try {
    const stored = Number(window.localStorage.getItem(SKIN_TONE_KEY));
    return Number.isInteger(stored) && stored >= 0 && stored <= 5 ? stored : 0;
  } catch {
    return 0;
  }
}

function saveSkinTone(tone: number) {
  try {
    window.localStorage.setItem(SKIN_TONE_KEY, String(tone));
  } catch {
    // Private windows can block storage; the choice just won't be remembered.
  }
}

export function EmojiPicker({
  onSelect,
  columnCount = 7,
  cellSize = 36,
  fontSize = 48,
}: {
  onSelect: (emoji: string) => void;
  columnCount?: number;
  cellSize?: number;
  /** Drawn at twice this and scaled by half, as read.cv does, for crispness. */
  fontSize?: number;
}) {
  const [all, setAll] = useState<PickerEmoji[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState('');
  const [tone, setTone] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTone(readSkinTone());
    searchRef.current?.focus({ preventScroll: true });
    let cancelled = false;
    loadPickerEmoji().then(
      (list) => !cancelled && setAll(list),
      () => !cancelled && setFailed(true),
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo(
    () => (all ? searchEmoji(all, query) : []),
    [all, query],
  );

  // A new search starts at the top.
  useEffect(() => {
    if (gridRef.current) gridRef.current.scrollTop = 0;
    setScrollTop(0);
  }, [query]);

  const rowCount = Math.ceil(items.length / columnCount);
  const firstRow = Math.max(
    0,
    Math.floor(scrollTop / cellSize) - OVERSCAN_ROWS,
  );
  const lastRow = Math.min(
    rowCount - 1,
    Math.ceil((scrollTop + GRID_HEIGHT) / cellSize) + OVERSCAN_ROWS,
  );

  const cells = [];
  for (let row = firstRow; row <= lastRow; row++) {
    for (let column = 0; column < columnCount; column++) {
      const item = items[row * columnCount + column];
      if (!item) break;
      const emoji = withSkinTone(item, tone);
      cells.push(
        <div
          key={`${row}-${column}`}
          className="absolute flex flex-col justify-center rounded-[4px] text-center hover:bg-black/5 dark:hover:bg-white/10"
          style={{
            left: column * cellSize,
            // read.cv nudges every cell 5px down from the grid's top edge.
            top: row * cellSize + 5,
            width: cellSize,
            height: cellSize,
          }}
        >
          <button
            type="button"
            onClick={() => onSelect(emoji)}
            aria-label={item.label}
            title={item.label}
            className="focus-visible:ring-theme-primary/30 relative block size-full rounded-[4px] outline-none focus-visible:ring-2 active:opacity-70"
          >
            <span
              aria-hidden
              className="absolute left-1/2 top-1/2 block leading-none [transform:translate(-50%,-50%)_scale(.5)]"
              style={{ fontSize }}
            >
              {emoji}
            </span>
          </button>
        </div>,
      );
    }
  }

  const cycleTone = () => {
    const next = (tone + 1) % SKIN_TONE_PREVIEWS.length;
    setTone(next);
    saveSkinTone(next);
  };

  return (
    <div className="flex flex-col">
      <div
        className="relative z-[1] mx-3 flex items-center gap-2 bg-inherit shadow-[0_1px_0_rgba(0,0,0,.05)] dark:shadow-[0_1px_0_rgba(255,255,255,.1)]"
        style={{ height: HEADER_HEIGHT }}
      >
        <input
          ref={searchRef}
          value={query}
          onChange={(event) => setQuery(event.target.value.toLowerCase())}
          placeholder="Search emoji"
          aria-label="Search emoji"
          autoComplete="off"
          spellCheck={false}
          // 16px on phones so iOS doesn't zoom; read.cv's 14px from sm up.
          className="h-9 min-w-0 flex-1 bg-transparent text-base text-theme-primary outline-none placeholder:text-theme-muted sm:text-[length:var(--type-size)]"
        />
        <button
          type="button"
          onClick={cycleTone}
          aria-label="Toggle skin tone"
          title="Toggle skin tone"
          className="relative h-9 w-4 shrink-0 outline-none active:opacity-70"
        >
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 block text-[40px] leading-none [transform:translate(-50%,-50%)_scale(.5)]"
          >
            {SKIN_TONE_PREVIEWS[tone]}
          </span>
        </button>
      </div>

      {all ? (
        <div
          ref={gridRef}
          onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
          className="scrollbar-hide relative mx-1 overflow-y-auto overflow-x-hidden"
          style={{ height: GRID_HEIGHT, width: columnCount * cellSize }}
          role="group"
          aria-label="Emoji"
        >
          <div
            className="relative"
            style={{ height: rowCount * cellSize + 10 }}
          >
            {cells}
          </div>
        </div>
      ) : (
        <div
          className="flex items-center justify-center text-[length:var(--secondary-type-size)] text-theme-muted"
          style={{ height: GRID_HEIGHT }}
        >
          {failed ? 'Emoji couldn’t load. Try again.' : <Spinner size={16} />}
        </div>
      )}
    </div>
  );
}

const PICKER_WIDTH = 260;
const PICKER_HEIGHT = HEADER_HEIGHT + GRID_HEIGHT;
// Below the field when this much room is left under it, otherwise above.
const SPACE_NEEDED_BELOW = 336;
const GAP = 6;

/**
 * The picker in read.cv's popover: 260×319, centred on the button that opened
 * it, below the field when there's room and above it otherwise. Closes on a
 * click elsewhere or Escape, and hands focus back to the button.
 */
export function EmojiPickerPopover({
  open,
  onClose,
  onSelect,
  anchorRef,
  measureRef,
  className,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  /** The button that opens the picker; the popover centres on it. */
  anchorRef: RefObject<HTMLElement | null>;
  /** The field it belongs to, used to decide above or below. */
  measureRef?: RefObject<HTMLElement | null>;
  className?: string;
}) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<'above' | 'below'>('below');

  useLayoutEffect(() => {
    if (!open) return;
    const rect = (
      measureRef?.current ?? anchorRef.current
    )?.getBoundingClientRect();
    if (!rect) return;
    setPlacement(
      window.innerHeight - rect.bottom < SPACE_NEEDED_BELOW ? 'above' : 'below',
    );
  }, [open, anchorRef, measureRef]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      onClose();
      anchorRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Emoji"
      className={cn(
        'absolute left-1/2 z-50 -translate-x-1/2 overflow-hidden rounded-lg bg-theme-bg shadow-[0_0_0_1px_rgba(0,0,0,.1),0_4px_40px_rgba(0,0,0,.075)] dark:bg-theme-border dark:shadow-[0_0_0_1px_rgba(0,0,0,.15),0_4px_40px_rgba(0,0,0,.5)]',
        className,
      )}
      style={{
        width: PICKER_WIDTH,
        height: PICKER_HEIGHT,
        ...(placement === 'below'
          ? { top: `calc(100% + ${GAP}px)` }
          : { bottom: `calc(100% + ${GAP}px)` }),
      }}
    >
      <EmojiPicker onSelect={onSelect} />
    </div>
  );
}

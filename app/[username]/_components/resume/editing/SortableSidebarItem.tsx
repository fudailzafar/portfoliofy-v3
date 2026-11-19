import { useEffect, useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SortableSidebarItemProps {
  id: string;
  label: string;
  disabled?: boolean;
  isActive: boolean;
  onClick: () => void;
  /** Arrow keys on the handle move the section up or down. */
  onMove: (dir: -1 | 1) => void;
}

// The dragged row lifts a little, the original style, while the rest slide around it.
const LIFT = {
  scale: 1.02,
  boxShadow: '0 0 0 1px rgb(0 0 0 / .05), 0 4px 16px rgb(0 0 0 / .1)',
  zIndex: 10,
};
const REST = {
  scale: 1,
  boxShadow: '0 0 0 0px rgb(0 0 0 / 0), 0 0px 0px rgb(0 0 0 / 0)',
  zIndex: 0,
};

export function SortableSidebarItem({
  id,
  label,
  disabled,
  isActive,
  onClick,
  onMove,
}: SortableSidebarItemProps) {
  // Only the handle starts a drag, so tapping the row still selects it.
  const controls = useDragControls();
  // Tracked here rather than with whileDrag, and also cleared on any pointer
  // release, so a row can never be left lifted.
  const [lifted, setLifted] = useState(false);
  useEffect(() => {
    if (!lifted) return;
    const drop = () => setLifted(false);
    window.addEventListener('pointerup', drop);
    window.addEventListener('pointercancel', drop);
    return () => {
      window.removeEventListener('pointerup', drop);
      window.removeEventListener('pointercancel', drop);
    };
  }, [lifted]);

  return (
    <Reorder.Item
      value={id}
      dragListener={false}
      dragControls={controls}
      onDragStart={() => setLifted(true)}
      onDragEnd={() => setLifted(false)}
      animate={lifted ? LIFT : REST}
      transition={{ duration: 0.15 }}
      style={{ position: 'relative' }}
      className={cn(
        'flex cursor-pointer select-none items-center justify-between bg-surface-1 py-2.5 pl-10 pr-6 text-sm transition-colors',
        isActive
          ? 'bg-surface-2 text-content-primary'
          : 'text-content-muted hover:bg-surface-2 hover:text-content-primary dark:hover:bg-surface-card',
        disabled &&
          'opacity-50 hover:bg-transparent hover:text-content-muted dark:hover:bg-transparent dark:hover:text-content-muted',
      )}
      onClick={() => {
        if (!disabled) onClick();
      }}
    >
      <span>{label}</span>
      {/* touch-none: otherwise a finger drag scrolls the list and cancels the drag. */}
      <button
        type="button"
        aria-label={`Move ${label}. Use the up and down arrow keys.`}
        className="-my-2.5 -mr-2 flex size-11 shrink-0 cursor-grab touch-none select-none flex-col items-center justify-center gap-[4px] opacity-50 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        onPointerDown={(e) => controls.start(e)}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            e.stopPropagation();
            onMove(e.key === 'ArrowUp' ? -1 : 1);
          }
        }}
      >
        <span className="h-[2px] w-3.5 rounded-full bg-content-muted" />
        <span className="h-[2px] w-3.5 rounded-full bg-content-muted" />
      </button>
    </Reorder.Item>
  );
}

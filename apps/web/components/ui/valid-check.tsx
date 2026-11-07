import { CheckCircleIcon } from '@phosphor-icons/react/ssr';
import { cn } from '@/lib/utils';

/** Shows that a field's value is valid. Render it only once it is. */
export function ValidCheck({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Valid"
      className={cn(
        'pointer-events-none relative flex size-5 shrink-0',
        className,
      )}
    >
      {/* The icon's check is a cut-out, so this makes it white on any field. */}
      <span className="absolute inset-[4px] rounded-full bg-white" />
      <CheckCircleIcon
        weight="fill"
        className="relative size-5 text-[#31be00]"
      />
    </span>
  );
}

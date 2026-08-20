import { cn } from '@/lib/utils';

const TICKS = [
  { opacity: 1, x: 7.25, y: 0 },
  { opacity: 0.52, x: 7.25, y: 11.5 },
  { opacity: 0.12, x: 11.3506, y: 0.696793, rotate: 30 },
  { opacity: 0.6, x: 5.60059, y: 10.6561, rotate: 30 },
  { opacity: 0.2, x: 14.5532, y: 3.35048, rotate: 60 },
  { opacity: 0.68, x: 4.59399, y: 9.10048, rotate: 60 },
  { opacity: 0.28, x: 16, y: 7.25003, rotate: 90 },
  { opacity: 0.76, x: 4.5, y: 7.25006, rotate: 90 },
  { opacity: 0.36, x: 15.3032, y: 11.3505, rotate: 120 },
  { opacity: 0.84, x: 5.34399, y: 5.60054, rotate: 120 },
  { opacity: 0.44, x: 12.6497, y: 14.5533, rotate: 150 },
  { opacity: 0.92, x: 6.89966, y: 4.59404, rotate: 150 },
];

interface SpinnerProps {
  size?: number;
  className?: string;
  fill?: string;
}

export function Spinner({ size = 16, className, fill }: SpinnerProps) {
  return (
    <div
      className={cn('inline-flex', className)}
      style={{ width: size, height: size }}
    >
      <div className="animate-spinner h-full w-full">
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {TICKS.map((tick, i) => (
            <rect
              key={i}
              opacity={tick.opacity}
              x={tick.x}
              y={tick.y}
              width="1.5"
              height="4.5"
              rx="0.75"
              transform={
                tick.rotate
                  ? `rotate(${tick.rotate} ${tick.x} ${tick.y})`
                  : undefined
              }
              fill={fill ?? 'currentColor'}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

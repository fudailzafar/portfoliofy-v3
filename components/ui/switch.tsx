'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import { cn } from '@/lib/utils';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer relative inline-flex h-[18px] w-7 shrink-0 cursor-pointer items-center rounded-[9px] border-0 transition-colors after:absolute after:-inset-x-1 after:-inset-y-[3px] after:content-[""] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-30 data-[state=checked]:bg-[#0788f5] data-[state=unchecked]:bg-[#999] dark:data-[state=unchecked]:bg-[#888]',
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block size-3.5 rounded-full bg-white shadow-none ring-0 transition-transform duration-200 data-[state=checked]:translate-x-[12px] data-[state=unchecked]:translate-x-[2px]',
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };

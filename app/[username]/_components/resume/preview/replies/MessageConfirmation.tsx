'use client';

import { motion } from 'framer-motion';
import { REPLY_SPRING } from './spring';

/**
 * the original's "Sent" pill: black, rises in from below the thing replied to and
 * leaves upwards. Shown for a second after a reply goes out. Positioned
 * against the nearest positioned ancestor.
 */
export function MessageConfirmation({ emoji }: { emoji?: string | null }) {
  return (
    <motion.div
      role="status"
      initial={{ x: '-50%', y: 100, opacity: 0 }}
      animate={{ x: '-50%', y: 0, opacity: 1 }}
      exit={{ x: '-50%', y: -100, opacity: 0 }}
      transition={REPLY_SPRING}
      className="pointer-events-none absolute left-1/2 top-[calc(100%+15px)] z-[100] flex whitespace-nowrap rounded-lg bg-[#111] px-3 py-1 text-[length:var(--type-size)] font-medium leading-[var(--line-height)] text-white"
    >
      {emoji && <span className="mr-1">{emoji}</span>}
      Sent
    </motion.div>
  );
}

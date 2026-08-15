'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Outline paths tracing "4", "0", "4" within a 540x415 viewBox.
// Used only as geometry to sample emoji positions from — never rendered visibly.
const DIGIT_PATHS = [
  'M107 307V107.5l-94 148h129.5',
  'M270.495 307.5c21.544 0 38.448-8.898 49.949-24.97C331.931 266.479 338 243.313 338 214.798v-16.69c0-27.976-6.444-50.869-18.209-66.781-11.778-15.929-28.864-24.827-50.038-24.827-21.173 0-38.137 8.76-49.793 24.726-11.642 15.949-17.96 39.047-17.96 67.703v16.416c0 28.522 6.505 51.553 18.334 67.466 11.84 15.93 28.989 24.689 50.161 24.689z',
  'M492.5 307V107.5l-94 148H528',
];

const EMOJI_POOL = [
  '🛫',
  '🐓',
  '☪️',
  '🇧🇲',
  '🖊️',
  '🔧',
  '🏇',
  '👩‍🏫',
  '🏅',
  '🇳🇿',
  '🧑‍⚕️',
  '↪️',
  '🛎️',
  '🗨️',
  '📉',
  '👨‍👩‍👦‍👦',
  '🥯',
  '♾️',
  '📓',
  '💒',
  '🚌',
  '🦷',
  '🔬',
  '🧑‍⚖️',
  '🥶',
  '🕹️',
  '🤼',
  '🈳',
  '🚲️',
  '👩‍✈️',
  '🇲🇦',
  '🆖',
  '🦗',
  '🔂',
  '😔',
  '👷‍♂️',
  '⛔️',
  '🛩️',
  '✊',
  '👨‍❤️‍💋‍👨',
  '📰',
  '🕒️',
  '↘️',
  '🇱🇧',
  '⚪️',
  '🔉',
  '🛸',
  '🐗',
  '🛵',
  '🇬🇭',
  '🧝‍♀️',
  '🎱',
  '🛹',
  '🚾',
  '🌉',
  '🔋',
  '🦅',
  '🌜️',
  '⁉️',
  '🥩',
  '🚶',
  '🍂',
  '🦚',
  '🇬🇫',
  '🔃',
  '🏸',
];

const VIEWBOX_WIDTH = 540;
const VIEWBOX_HEIGHT = 415;
const EMOJI_COUNT = 67;
const CONTAINER_MAX_WIDTH = 720;

interface EmojiPoint {
  x: number;
  y: number;
  emoji: string;
}

function shuffled<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function NotFoundEmojiArt() {
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<EmojiPoint[]>([]);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const paths = pathRefs.current.filter(Boolean) as SVGPathElement[];
    if (paths.length !== DIGIT_PATHS.length) return;

    const lengths = paths.map((p) => p.getTotalLength());
    const totalLength = lengths.reduce((a, b) => a + b, 0);
    const pool = shuffled(EMOJI_POOL);

    const sampled: EmojiPoint[] = [];
    let emojiIndex = 0;
    paths.forEach((path, i) => {
      const count = Math.round((lengths[i] / totalLength) * EMOJI_COUNT);
      for (let j = 0; j < count; j++) {
        const distance = (j / count) * lengths[i];
        const point = path.getPointAtLength(distance);
        sampled.push({
          x: point.x,
          y: point.y,
          emoji: pool[emojiIndex % pool.length],
        });
        emojiIndex++;
      }
    });
    setPoints(sampled);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => setScale(el.offsetWidth / VIEWBOX_WIDTH);
    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full"
      style={{
        maxWidth: `${CONTAINER_MAX_WIDTH}px`,
        aspectRatio: `${VIEWBOX_WIDTH} / ${VIEWBOX_HEIGHT}`,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        fill="none"
        className="absolute inset-0 h-full w-full"
      >
        {DIGIT_PATHS.map((d, i) => (
          <path
            key={i}
            ref={(el) => {
              pathRefs.current[i] = el;
            }}
            d={d}
            stroke="transparent"
          />
        ))}
      </svg>

      {scale > 0 &&
        points.map((point, i) => (
          <div
            key={i}
            className="absolute left-0 top-0 h-[2px] w-[2px]"
            style={{
              transform: `translate(${point.x * scale}px, ${point.y * scale}px)`,
            }}
          >
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                width: 'min(6.5vw, 40px)',
                height: 'min(6.5vw, 40px)',
              }}
            >
              <motion.div
                drag
                dragMomentum={false}
                whileTap={{ cursor: 'grabbing' }}
                className="flex h-full w-full cursor-grab select-none items-center justify-center"
                style={{
                  fontSize: 'min(6.5vw, 40px)',
                  touchAction: 'none',
                }}
              >
                {point.emoji}
              </motion.div>
            </div>
          </div>
        ))}
    </div>
  );
}

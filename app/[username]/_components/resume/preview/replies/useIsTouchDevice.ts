'use client';

import { useEffect, useState } from 'react';

/** True on phones and tablets (no hover, coarse pointer), where read.cv swipes. */
export function useIsTouchDevice() {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(hover: none) and (pointer: coarse)');
    const update = () => setTouch(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return touch;
}

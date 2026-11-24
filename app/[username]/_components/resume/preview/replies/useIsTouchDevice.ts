'use client';

import { useEffect, useState } from 'react';

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

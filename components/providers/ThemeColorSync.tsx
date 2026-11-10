'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

// Matches --surface-1 in globals.css.
const LIGHT = '#ffffff';
const DARK = '#222222';

/**
 * Keeps the browser / installed-app status bar in step with the theme the
 * person picked in settings. The viewport's media-based theme-color covers the
 * OS setting; this covers an explicit light or dark choice that differs from it.
 */
export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;
    const color = resolvedTheme === 'dark' ? DARK : LIGHT;
    // Drop the media-based tags so only the chosen colour applies.
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((tag, index) => {
        if (index > 0) tag.remove();
      });
    const tag = document.querySelector('meta[name="theme-color"]');
    if (tag) {
      tag.setAttribute('content', color);
      tag.removeAttribute('media');
    } else {
      const created = document.createElement('meta');
      created.name = 'theme-color';
      created.content = color;
      document.head.appendChild(created);
    }
  }, [resolvedTheme]);

  return null;
}

'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

// Matches --surface-1 in globals.css.
const LIGHT = '#ffffff';
const DARK = '#222222';
const TAG_ID = 'theme-color-override';

/**
 * Keeps the browser / installed-app status bar in step with the theme the
 * person picked in settings.
 *
 * The viewport export already renders light and dark theme-color tags that
 * follow the OS setting. Those tags belong to React: deleting or editing them
 * here makes React crash on the next page change, leaving the URL updated but
 * the page stuck. So this only adds one tag of its own, in front of them
 * (browsers use the first matching tag), and only while a light or dark
 * choice is set. With "System" the tag is removed and the OS-driven ones apply.
 */
export function ThemeColorSync() {
  const { theme } = useTheme();

  useEffect(() => {
    const existing = document.getElementById(TAG_ID);

    if (theme !== 'light' && theme !== 'dark') {
      existing?.remove();
      return;
    }

    const color = theme === 'dark' ? DARK : LIGHT;
    if (existing) {
      existing.setAttribute('content', color);
      return;
    }
    const tag = document.createElement('meta');
    tag.id = TAG_ID;
    tag.name = 'theme-color';
    tag.content = color;
    document.head.prepend(tag);
  }, [theme]);

  return null;
}

'use server';

import type { ReactNode } from 'react';
import { createElement } from 'react';
import { headers } from 'next/headers';
import { checkRateLimit } from '@/lib/server/rateLimit';
import {
  PAGE_PASSWORD_MAX_LENGTH,
  verifyPagePassword,
} from '@/lib/server/pagePasswords';
import { PostBody } from './PostBody';
import { getPostViewProps, resolvePage } from './postView';

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export type UnlockPageResult =
  | { ok: true; title: string; view: ReactNode }
  | { ok: false; reason: 'incorrect' | 'rate-limited' | 'not-found' };

// Checks the password and, if it's right, returns the rendered page. Nothing
// is stored, so a reload shows the lock screen again.
export async function unlockPage(
  username: string,
  slug: string,
  password: string,
): Promise<UnlockPageResult> {
  if (
    typeof username !== 'string' ||
    typeof slug !== 'string' ||
    typeof password !== 'string'
  ) {
    return { ok: false, reason: 'not-found' };
  }

  const resolved = await resolvePage(username, slug);
  const hash = resolved?.page.passwordHash;
  if (!resolved || !hash) return { ok: false, reason: 'not-found' };

  const ip =
    (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';
  const { allowed } = await checkRateLimit(
    `page-unlock:${resolved.page.id}:${ip}`,
    MAX_ATTEMPTS,
    WINDOW_MS,
  );
  if (!allowed) return { ok: false, reason: 'rate-limited' };

  if (
    password.length > PAGE_PASSWORD_MAX_LENGTH ||
    !verifyPagePassword(password, hash)
  ) {
    return { ok: false, reason: 'incorrect' };
  }

  const view = await getPostViewProps(username, resolved);
  return {
    ok: true,
    title: resolved.page.title || 'Untitled',
    view: createElement(PostBody, view),
  };
}

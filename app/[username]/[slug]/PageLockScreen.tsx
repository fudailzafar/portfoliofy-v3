'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MotionConfig, motion, useAnimationControls } from 'framer-motion';
import { Spinner } from '@/components/ui/spinner';
import { unlockPage } from './actions';
import { PostStatusBadge } from './PostStatusBadge';

const FADE = { duration: 0.3 } as const;
// The page appears only after the padlock has fully opened, with a short
// hold so the open lock registers. The fallback covers a tab where the
// animation never reports finishing (e.g. in the background).
const OPENED_HOLD_MS = 150;
const OPEN_FALLBACK_MS = 1000;

export function PageLockScreen({
  username,
  slug,
  ownerName,
  avatarUrl,
  statusEmoji,
  profileHref,
}: {
  username: string;
  slug: string;
  ownerName: string;
  avatarUrl?: string;
  statusEmoji?: string | null;
  profileHref: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const shake = useAnimationControls();
  const [password, setPassword] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [message, setMessage] = useState('');
  // The unlocked page lives only in memory: reloading asks again.
  const [view, setView] = useState<ReactNode>(null);
  const unlockedRef = useRef<{ title: string; view: ReactNode } | null>(null);
  const fallbackRef = useRef<number>(0);

  const showUnlockedPage = () => {
    const unlocked = unlockedRef.current;
    if (!unlocked) return;
    unlockedRef.current = null;
    window.clearTimeout(fallbackRef.current);
    document.title = unlocked.title;
    setView(unlocked.view);
  };

  useEffect(() => () => window.clearTimeout(fallbackRef.current), []);

  useEffect(() => {
    // Autofocus where there's a keyboard; on phones it would pop one up.
    if (window.matchMedia('(pointer: fine)').matches) {
      inputRef.current?.focus();
    }
  }, []);

  const rejectWith = async (text: string) => {
    setMessage(text);
    // A small macOS-style shake, then select the text so the
    // next attempt replaces it.
    await shake.start({
      x: [0, 3, -3, 0],
      transition: { duration: 0.15, repeat: 4 },
    });
    inputRef.current?.focus();
    inputRef.current?.select();
  };

  const submit = async () => {
    if (isChecking || isUnlocked) return;
    if (!password) {
      await rejectWith('');
      return;
    }
    setIsChecking(true);
    setMessage('');
    const result = await unlockPage(username, slug, password);

    if (result.ok) {
      unlockedRef.current = { title: result.title, view: result.view };
      setIsUnlocked(true);
      fallbackRef.current = window.setTimeout(
        showUnlockedPage,
        OPEN_FALLBACK_MS,
      );
      return;
    }

    setIsChecking(false);
    if (result.reason === 'not-found') {
      router.refresh();
      return;
    }
    await rejectWith(
      result.reason === 'rate-limited'
        ? 'Too many attempts. Try again in a few minutes.'
        : '',
    );
  };

  if (view) {
    return (
      <motion.div
        className="flex flex-1 flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={FADE}
      >
        {view}
      </motion.div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      {/* A 375px bordered card, centred on the page. */}
      <motion.main
        className="mx-auto flex w-full max-w-[375px] flex-1 flex-col justify-center px-6 py-24 sm:px-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={FADE}
      >
        <motion.form
          animate={shake}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex flex-col gap-3 rounded-[24px] border border-theme-border p-6"
        >
          <Link href={profileHref} className="relative w-fit rounded-full">
            {statusEmoji && <PostStatusBadge emoji={statusEmoji} />}
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={ownerName}
                className="h-[72px] w-[72px] rounded-full object-cover"
              />
            ) : (
              <span
                aria-label={ownerName}
                className="block h-[72px] w-[72px] rounded-full bg-[var(--theme-wash)]"
              />
            )}
          </Link>

          <p className="text-[length:var(--type-size)] leading-[var(--line-height)] text-theme-secondary">
            <Link
              href={profileHref}
              className="border-b border-theme-border text-theme-primary"
            >
              {ownerName}
            </Link>{' '}
            has made this page private, please enter the password to continue.
          </p>

          <label htmlFor="page-password" className="sr-only">
            Password
          </label>
          <div className="flex rounded-lg bg-[var(--theme-wash)]">
            <input
              ref={inputRef}
              id="page-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter password"
              value={password}
              disabled={isChecking || isUnlocked}
              aria-invalid={!!message && !isUnlocked}
              aria-describedby="page-password-message"
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 min-w-0 flex-1 bg-transparent pl-3 text-[14px] text-theme-primary outline-none placeholder:text-theme-muted disabled:opacity-60 sm:h-9 sm:text-[14px]"
            />
            <span className="flex items-center p-2 text-theme-primary">
              <PadlockIcon
                open={isUnlocked}
                onOpened={() =>
                  window.setTimeout(showUnlockedPage, OPENED_HOLD_MS)
                }
              />
            </span>
          </div>

          <button
            type="submit"
            disabled={!password || isChecking || isUnlocked}
            className="ml-auto grid h-8 place-items-center rounded-md border border-border-strong bg-surface-1 px-4 text-[14px] font-medium text-content-primary shadow-sm transition-colors active:bg-surface-2 disabled:pointer-events-none disabled:opacity-80 dark:border-none dark:bg-border-subtle dark:active:bg-border-strong"
          >
            {/* Label and spinner share one grid cell; the label only turns
                invisible, so the button keeps its width while checking. */}
            <span
              className={`[grid-area:1/1] ${isChecking || isUnlocked ? 'invisible' : ''}`}
            >
              Submit
            </span>
            {(isChecking || isUnlocked) && (
              <Spinner
                size={14}
                className="text-content-primary [grid-area:1/1]"
              />
            )}
          </button>
        </motion.form>
      </motion.main>
    </MotionConfig>
  );
}

// A 20px padlock. On unlock the shackle rises 2px, then swings open
// around its right leg, 400ms in all (globals.css .padlock-shackle). The
// body is drawn last so it covers the shackle's right leg.
function PadlockIcon({
  open,
  onOpened,
}: {
  open: boolean;
  onOpened?: () => void;
}) {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        className="padlock-shackle"
        data-open={open}
        onAnimationEnd={onOpened}
        d="M7 8V6.5a3 3 0 0 1 6 0v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="5" y="8" width="10" height="8" rx="2" fill="currentColor" />
    </svg>
  );
}

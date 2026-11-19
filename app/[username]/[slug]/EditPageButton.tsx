'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { EditFab } from '@/components/layout/EditFab';

/**
 * On your own post: opens this page in your editor (which lives on your
 * profile). Portalled to the body, like Follow, so its fixed position isn't
 * thrown off by the page's animated container.
 */
export function EditPageButton({ href }: { href: string }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    <EditFab label="Edit page" onClick={() => router.push(href)} />,
    document.body,
  );
}

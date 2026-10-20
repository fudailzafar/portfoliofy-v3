import { headers } from 'next/headers';
import { auth } from '@/auth';
import { getUserData } from '../utils';
import {
  AttachmentSchemaType,
  ResumeDataSchemaType,
  estimateReadMinutes,
  findPageBySlug,
} from '@/lib/resume';
import { getOptimizedImageUrl } from '@/lib/utils';
import { classifyHost } from '@/lib/site';
import type { PostBodyProps } from './PostBody';

// Shared by the post page and the unlock action, so an unlocked page renders
// exactly like an open one.

const parsePageDate = (dateStr?: string) => {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
};

export async function resolvePage(username: string, slug: string) {
  const { user_id, resume, userProfile } = await getUserData(username);
  if (!user_id || !resume?.resumeData) return null;

  const page = findPageBySlug(resume.resumeData, slug);
  if (!page || page.hidden) return null;

  return { user_id, page, resumeData: resume.resumeData, userProfile };
}

export type ResolvedPage = NonNullable<Awaited<ReturnType<typeof resolvePage>>>;

// Locked for everyone but the owner. Nothing is remembered:
// every load asks for the password again.
export async function isPageLocked(
  page: AttachmentSchemaType,
  ownerId: string,
) {
  if (!page.passwordHash) return false;
  const session = await auth();
  return session?.user?.id !== ownerId;
}

export function postRootClassName(design: ResumeDataSchemaType['design']) {
  const font =
    design?.typography === 'serif'
      ? 'font-serif'
      : design?.typography === 'mono'
        ? 'font-mono'
        : 'font-sans';
  return `flex min-h-screen flex-col bg-theme-bg ${font} typography-${design?.typography || 'sans'} theme-${design?.theme || 'default'}`;
}

export async function getPostViewProps(
  username: string,
  { page, resumeData, userProfile }: ResolvedPage,
): Promise<PostBodyProps> {
  const design = resumeData.design;
  const isSubdomainView =
    classifyHost((await headers()).get('host')).kind === 'subdomain';
  const isPersonalDomainView = username.includes('.') || isSubdomainView;
  const hrefFor = (p: AttachmentSchemaType) =>
    isPersonalDomainView
      ? `/${p.slug || p.id}`
      : `/${username}/${p.slug || p.id}`;

  const publishedPages = (resumeData.pages || [])
    .filter((p) => !p.hidden && !p.isBlurred)
    .map((p) => ({ ...p, parsedDate: parsePageDate(p.createdAt) }))
    .sort(
      (a, b) => (b.parsedDate?.getTime() || 0) - (a.parsedDate?.getTime() || 0),
    );
  const currentIndex = publishedPages.findIndex((p) => p.id === page.id);
  const next =
    currentIndex !== -1 && publishedPages.length > 1
      ? currentIndex === 0
        ? publishedPages[publishedPages.length - 1]
        : publishedPages[currentIndex - 1]
      : null;

  return {
    title: page.title || '',
    content: page.content || '',
    ownerName: resumeData.header.name,
    avatarUrl:
      getOptimizedImageUrl(
        userProfile?.avatarUrl || userProfile?.image || undefined,
      ) || undefined,
    // Same rule as the profile: a personal domain can turn social bits off.
    statusEmoji:
      isPersonalDomainView && design?.hideSocialFeatures
        ? null
        : userProfile?.statusEmoji,
    profileHref: isPersonalDomainView ? '/' : `/${username}`,
    nextPage: next
      ? next.passwordHash
        ? { href: hrefFor(next), locked: true }
        : {
            href: hrefFor(next),
            locked: false,
            title: next.title || 'Untitled',
            thumbnailUrl: next.url,
            readMinutes: estimateReadMinutes(next.content || ''),
          }
      : null,
  };
}

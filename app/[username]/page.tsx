import { notFound, redirect } from 'next/navigation';
import { PrintResumeWrapper } from '@/app/[username]/_components/resume/PrintResumeWrapper';
import { FullResume } from '@/app/[username]/_components/resume/FullResume';
import { Metadata } from 'next';
import { getUserData } from './utils';
import {
  getOptimizedImageUrl,
  isOwnS3ImageUrl,
  getCanonicalUrl,
} from '@/lib/utils';
import { getCachedCustomDomainByUserId } from '@/lib/server/cachedFunctions';
import { auth } from '@/auth';
import dynamic from 'next/dynamic';
import { after } from 'next/server';
import { recordPageView } from '@/lib/server/dbActions';
import { getVisitorKey } from '@/lib/server/visitorKey';
import { ProfileUrlProvider } from '@/lib/ProfileUrlContext';

const EditProfileDialog = dynamic(() =>
  import('@/app/[username]/_components/resume/editing/EditProfileDialog').then(
    (mod) => mod.EditProfileDialog,
  ),
);

const LiveResumeWrapper = dynamic(() =>
  import('@/app/[username]/_components/resume/LiveResumeWrapper').then(
    (mod) => mod.LiveResumeWrapper,
  ),
);
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const { user_id, resume } = await getUserData(username);

  if (!user_id) {
    notFound();
  }

  if (!resume?.resumeData || resume.status !== 'live') {
    return {
      title: 'Resume Not Found | Portfoliofy',
      description: 'This resume could not be found on Portfoliofy',
    };
  }

  const stripHtml = (html: string) =>
    html ? html.replace(/<[^>]*>?/gm, '') : '';
  const plainSummary = stripHtml(resume.resumeData.summary);

  const design = resume.resumeData.design;
  const customOgImage =
    design?.ogImage && isOwnS3ImageUrl(design.ogImage)
      ? design.ogImage
      : undefined;
  const customFavicon =
    design?.favicon && isOwnS3ImageUrl(design.favicon)
      ? design.favicon
      : undefined;

  const customDomain = await getCachedCustomDomainByUserId(user_id);
  const canonicalUrl = getCanonicalUrl(username, customDomain);

  return {
    title: `${resume.resumeData.header.name}`,
    description: plainSummary,
    icons: customFavicon ? { icon: customFavicon } : undefined,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${resume.resumeData.header.name}`,
      description: plainSummary,
      images: [
        {
          url: customOgImage || `https://portfoliofy.me/${username}/og`,
          width: 1200,
          height: 630,
          alt: `${resume.resumeData.header.name}'s profile`,
        },
      ],
    },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const { user_id, resume, userProfile } = await getUserData(username);
  const session = await auth();
  const userId = session?.user?.id;

  if (!user_id) {
    notFound();
  }

  if (!resume?.resumeData || resume.status !== 'live')
    redirect(`/?idNotFound=${user_id}`);

  const visitorKey = await getVisitorKey();
  after(() => recordPageView(user_id, username.includes('.'), visitorKey));

  const rawProfilePicture = userProfile?.avatarUrl || userProfile?.image;
  const profilePicture = getOptimizedImageUrl(rawProfilePicture) || '';

  const stripHtml = (html: string) =>
    html ? html.replace(/<[^>]*>?/gm, '') : '';

  const customDomain = await getCachedCustomDomainByUserId(user_id);
  const canonicalUrl = getCanonicalUrl(username, customDomain);

  const sameAs = (resume.resumeData.contacts || [])
    .filter(
      (c: any) =>
        !c.hidden &&
        c.platform?.toLowerCase() !== 'email' &&
        typeof c.link === 'string' &&
        c.link.startsWith('http'),
    )
    .map((c: any) => c.link);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: resume.resumeData.header.name,
    image: profilePicture,
    jobTitle: resume.resumeData.header.shortAbout,
    description: stripHtml(resume.resumeData.summary),
    email: resume.resumeData.contacts?.find(
      (c: any) => c.platform.toLowerCase() === 'email',
    )?.link,
    url: canonicalUrl,
    ...(sameAs.length > 0 && { sameAs }),
    skills: resume.resumeData.header.skills,
  };

  const headersList = await import('next/headers').then((m) => m.headers());
  const hostHeader = headersList.get('host') || '';
  const hostname = hostHeader.split(':')[0];
  const isSubdomainView =
    (hostname.endsWith('.portfoliofy.me') &&
      hostname !== 'www.portfoliofy.me') ||
    (hostname.endsWith('.localhost') && hostname !== 'localhost');

  const isPersonalDomainView = username.includes('.') || isSubdomainView;
  const isOwner = userId === user_id && !isPersonalDomainView;

  return (
    <ProfileUrlProvider isPersonalDomainView={isPersonalDomainView}>
      <div className="flex min-h-screen flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Standard UI visible only on screen */}
        <div className="flex flex-1 flex-col print:hidden">
          {isOwner && resume?.resumeData && (
            <EditProfileDialog
              resume={resume.resumeData}
              username={username}
              picture={profilePicture}
              createdAt={userProfile?.createdAt}
            />
          )}

          {isOwner ? (
            <LiveResumeWrapper
              initialResume={resume?.resumeData}
              profilePicture={profilePicture}
              isOwner={true}
              userProfile={userProfile || undefined}
              applyTheme={isPersonalDomainView}
              username={username}
            />
          ) : (
            <div
              className={`flex flex-1 flex-col bg-theme-bg ${
                isPersonalDomainView
                  ? `${
                      resume?.resumeData?.design?.typography === 'serif'
                        ? 'font-serif'
                        : resume?.resumeData?.design?.typography === 'mono'
                          ? 'font-mono'
                          : 'font-sans'
                    } typography-${resume?.resumeData?.design?.typography || 'sans'} theme-${resume?.resumeData?.design?.theme || 'default'}`
                  : 'theme-default typography-sans font-sans'
              }`}
            >
              <FullResume
                resume={resume?.resumeData as any}
                profilePicture={profilePicture}
                isOwner={false}
                userProfile={userProfile || undefined}
                username={username}
                hideSocialFeatures={
                  isPersonalDomainView &&
                  !!resume?.resumeData?.design?.hideSocialFeatures
                }
                isPersonalDomainView={isPersonalDomainView}
              />
            </div>
          )}
        </div>

        {/* Print-only layout */}
        <PrintResumeWrapper
          resume={resume?.resumeData}
          isOwner={userId === user_id}
        />
      </div>
    </ProfileUrlProvider>
  );
}

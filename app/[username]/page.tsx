import { notFound, redirect } from 'next/navigation';
import { PrintResumeWrapper } from '@/app/[username]/_components/resume/PrintResumeWrapper';
import { FullResume } from '@/app/[username]/_components/resume/FullResume';
import { Metadata } from 'next';
import { getUserData } from './utils';
import { getOptimizedImageUrl } from '@/lib/utils';
import { auth } from '@/auth';
import dynamic from 'next/dynamic';

const EditProfileDialog = dynamic(
  () => import('@/app/[username]/_components/resume/editing/EditProfileDialog').then((mod) => mod.EditProfileDialog),
);

const LiveResumeWrapper = dynamic(
  () => import('@/app/[username]/_components/resume/LiveResumeWrapper').then((mod) => mod.LiveResumeWrapper),
);
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const { user_id, resume } = await getUserData(username);

  if (!user_id) {
    return {
      title: `Claim @${username} | Portfoliofy`,
      description: `The username @${username} is available! Create your portfolio on Portfoliofy.`,
    };
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

  return {
    title: `${resume.resumeData.header.name}`,
    description: plainSummary,
    openGraph: {
      title: `${resume.resumeData.header.name}`,
      description: plainSummary,
      images: [
        {
          url: `https://portfoliofy.me/${username}/og`,
          width: 1200,
          height: 630,
          alt: 'Portfoliofy User Open Graph Image',
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

  const rawProfilePicture = userProfile?.avatarUrl || userProfile?.image;
  const profilePicture = getOptimizedImageUrl(rawProfilePicture) || '';

  const stripHtml = (html: string) =>
    html ? html.replace(/<[^>]*>?/gm, '') : '';

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
    url: `https://portfoliofy.me/${username}`,
    skills: resume.resumeData.header.skills,
  };

  return (
    <div className="flex min-h-screen flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Standard UI visible only on screen */}
      <div className="flex flex-1 flex-col print:hidden">
        {userId === user_id && resume?.resumeData && (
          <EditProfileDialog
            resume={resume.resumeData}
            username={username}
            picture={profilePicture}
          />
        )}

        {userId === user_id ? (
          <LiveResumeWrapper
            initialResume={resume?.resumeData}
            profilePicture={profilePicture}
            isOwner={true}
            userProfile={userProfile || undefined}
          />
        ) : (
          <div className={`flex flex-1 flex-col bg-theme-bg ${resume?.resumeData?.design?.typography === 'serif' ? 'font-serif' : resume?.resumeData?.design?.typography === 'mono' ? 'font-mono' : 'font-sans'} theme-${resume?.resumeData?.design?.theme || 'default'}`}>
            <FullResume
              resume={resume?.resumeData as any}
              profilePicture={profilePicture}
              isOwner={false}
              userProfile={userProfile || undefined}
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
  );
}

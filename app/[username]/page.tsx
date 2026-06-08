import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LiveResumeWrapper } from '@/app/[username]/_components/resume/LiveResumeWrapper';
import { PrintResumeWrapper } from '@/app/[username]/_components/resume/PrintResumeWrapper';
import { Metadata } from 'next';
import { getUserData } from './utils';
import { Button } from '@/components/ui/button';
import { auth } from '@/auth';
import { EditProfileDialog } from '@/app/[username]/_components/resume/editing/EditProfileDialog';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const { user_id, resume, userProfile } = await getUserData(username);

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
          alt: 'Portfoliofy Profile',
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
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-surface-2 px-4 py-8 dark:from-[#121212] dark:to-[#1a1a1a] md:py-12">
        <div className="w-full max-w-4xl space-y-6 text-center md:space-y-8">
          {/* Header */}
          <div className="space-y-3 md:space-y-4">
            <div className="inline-block">
              <div className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100 md:px-4 md:py-2 md:text-sm">
                Available
              </div>
            </div>

            <h1 className="break-all text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl">
              <span className="text-content-muted">portfoliofy.me/</span>
              <span className="text-content-primary">{username}</span>
            </h1>

            <p className="px-4 text-base text-content-secondary sm:text-lg md:text-xl">
              This username is available! Claim it now and create your
              professional portfolio.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-2 md:grid-cols-3 md:gap-4 md:py-8">
            <div className="rounded-lg border border-border-strong bg-surface-1 p-4 shadow-sm transition-shadow hover:shadow-md md:p-6">
              <div className="mb-2 text-2xl md:text-3xl">⚡</div>
              <h3 className="mb-1 text-sm font-semibold md:text-base">
                Quick Setup
              </h3>
              <p className="text-xs text-content-secondary md:text-sm">
                Upload your resume and go live in minutes
              </p>
            </div>

            <div className="rounded-lg border border-border-strong bg-surface-1 p-4 shadow-sm transition-shadow hover:shadow-md md:p-6">
              <div className="mb-2 text-2xl md:text-3xl">🎨</div>
              <h3 className="mb-1 text-sm font-semibold md:text-base">
                Beautiful Design
              </h3>
              <p className="text-xs text-content-secondary md:text-sm">
                Professional portfolio that stands out
              </p>
            </div>

            <div className="rounded-lg border border-border-strong bg-surface-1 p-4 shadow-sm transition-shadow hover:shadow-md sm:col-span-2 md:col-span-1 md:p-6">
              <div className="mb-2 text-2xl md:text-3xl">🔗</div>
              <h3 className="mb-1 text-sm font-semibold md:text-base">
                Your Domain
              </h3>
              <p className="break-all text-xs text-content-secondary md:text-sm">
                portfoliofy.me/{username}
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col items-stretch justify-center gap-3 px-4 sm:flex-row sm:items-center md:gap-4">
            <Link href={'/claim'} className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full bg-design-black px-6 py-5 text-base text-surface-1 hover:bg-design-black/95 dark:bg-surface-1 dark:text-content-primary dark:hover:bg-surface-3 sm:w-auto md:px-8 md:py-6 md:text-lg"
              >
                Claim Handle Now
              </Button>
            </Link>
            <Link href={'/claim'} className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full px-6 py-5 text-base dark:hover:bg-surface-card sm:w-auto md:px-8 md:py-6 md:text-lg"
              >
                Sign in
              </Button>
            </Link>
          </div>

          <p className="px-4 text-xs text-content-muted md:text-sm">
            Already have an account? Sign in to set this as your username.
          </p>

          {/* Back to home */}
          <div className="pt-4 md:pt-8">
            <Link
              href="/"
              className="text-xs text-content-secondary underline hover:text-content-primary md:text-sm"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }
  if (!resume?.resumeData || resume.status !== 'live')
    redirect(`/?idNotFound=${user_id}`);

  const profilePicture = userProfile?.avatarUrl ?? undefined;

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

        <LiveResumeWrapper
          initialResume={resume?.resumeData}
          profilePicture={profilePicture}
          isOwner={userId === user_id}
          userProfile={userProfile || undefined}
        />
      </div>

      {/* Print-only layout */}
      <PrintResumeWrapper resume={resume?.resumeData} />
    </div>
  );
}

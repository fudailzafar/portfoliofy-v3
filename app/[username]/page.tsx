import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FullResume } from '@/components/resume/FullResume';
import { Metadata } from 'next';
import { getUserData } from './utils';
import { Button } from '@/components/ui/button';
import { auth } from '@/auth';
import { EditProfileDialog } from '@/components/resume/editing/EditProfileDialog';

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

  return {
    title: `${resume.resumeData.header.name}`,
    description: resume.resumeData.summary,
    openGraph: {
      title: `${resume.resumeData.header.name}`,
      description: resume.resumeData.summary,
      images: [
        {
          url: `https://portfoliofy-v3.vercel.app/${username}/og`,
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
      <div className="min-h-screen flex items-center justify-center px-4 py-8 md:py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl w-full text-center space-y-6 md:space-y-8">
          {/* Header */}
          <div className="space-y-3 md:space-y-4">
            <div className="inline-block">
              <div className="bg-green-100 text-green-800 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium">
                Available
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold break-all">
              <span className="text-gray-500">portfoliofy-v3.vercel.app/</span>
              <span className="text-gray-900">{username}</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4">
              This username is available! Claim it now and create your
              professional portfolio.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 py-4 md:py-8">
            <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-2xl md:text-3xl mb-2">⚡</div>
              <h3 className="font-semibold mb-1 text-sm md:text-base">Quick Setup</h3>
              <p className="text-xs md:text-sm text-gray-600">
                Upload your resume and go live in minutes
              </p>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-2xl md:text-3xl mb-2">🎨</div>
              <h3 className="font-semibold mb-1 text-sm md:text-base">Beautiful Design</h3>
              <p className="text-xs md:text-sm text-gray-600">
                Professional portfolio that stands out
              </p>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 md:col-span-1">
              <div className="text-2xl md:text-3xl mb-2">🔗</div>
              <h3 className="font-semibold mb-1 text-sm md:text-base">Your Domain</h3>
              <p className="text-xs md:text-sm text-gray-600 break-all">
                portfoliofy-v3.vercel.app/{username}
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-stretch sm:items-center px-4">
            <Link href={'/claim'} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6 bg-design-black text-white hover:bg-design-black/95">
                Claim Handle Now
              </Button>
            </Link>
            <Link href={'/claim'} className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6"
              >
                Sign in
              </Button>
            </Link>
          </div>

          <p className="text-xs md:text-sm text-gray-500 px-4">
            Already have an account? Sign in to set this as your username.
          </p>

          {/* Back to home */}
          <div className="pt-4 md:pt-8">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 text-xs md:text-sm underline"
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

  // Prefer user-uploaded S3 avatar over Google OAuth photo
  const profilePicture = userProfile?.customImage ?? userProfile?.image ?? undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: resume.resumeData.header.name,
    image: profilePicture,
    jobTitle: resume.resumeData.header.shortAbout,
    description: resume.resumeData.summary,
    email: resume.resumeData.contacts?.find((c: any) => c.platform.toLowerCase() === 'email')?.link,
    url: `https://portfoliofy-v3.vercel.app/${username}`,
    skills: resume.resumeData.header.skills,
  };

  const typography = resume.resumeData?.design?.typography || 'sans';
  const theme = resume.resumeData?.design?.theme || 'default';
  const fontClass = typography === 'serif' ? 'font-serif' : typography === 'mono' ? 'font-mono' : 'font-sans';
  const themeClass = `theme-${theme}`;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {userId === user_id && resume?.resumeData && (
        <EditProfileDialog 
          resume={resume.resumeData} 
          username={username}
          picture={profilePicture} 
        />
      )}

      <div className={`flex-1 flex flex-col bg-theme-bg ${fontClass} ${themeClass}`}>
        <div className="flex-1">
          <FullResume resume={resume?.resumeData} profilePicture={profilePicture} />
        </div>

        <div className="text-center mt-8 mb-4">
          <Link
            href={`/?ref=${username}`}
            className="text-theme-secondary font-mono text-sm"
          >
            Made by{' '}
            <span className="text-theme-primary underline underline-offset-2 hover:text-theme-accent transition-colors">
              Portfoliofy
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

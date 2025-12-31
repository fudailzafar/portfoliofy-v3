import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FullResume } from '@/components/resume/FullResume';
import { Metadata } from 'next';
import { getUserData } from './utils';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const { user_id, resume, clerkUser } = await getUserData(username);

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
    title: `${resume.resumeData.header.name} | Portfoliofy`,
    description: resume.resumeData.summary,
    openGraph: {
      title: `${resume.resumeData.header.name} | Portfoliofy`,
      description: resume.resumeData.summary,
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

  const { user_id, resume, clerkUser } = await getUserData(username);

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
              <span className="text-gray-500">portfoliofy.me/</span>
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
                portfoliofy.me/{username}
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-stretch sm:items-center px-4">
            <Link href={'/upload'} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6">
                Claim Handle Now
              </Button>
            </Link>
            <Link href={'/upload'} className="w-full sm:w-auto">
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

  const profilePicture = clerkUser?.imageUrl;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: resume.resumeData.header.name,
    image: profilePicture,
    jobTitle: resume.resumeData.header.shortAbout,
    description: resume.resumeData.summary,
    email:
      resume.resumeData.header.contacts.email &&
      `mailto:${resume.resumeData.header.contacts.email}`,
    url: `https://portfoliofy.me/${username}`,
    skills: resume.resumeData.header.skills,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <FullResume resume={resume?.resumeData} profilePicture={profilePicture} />

      <div className="text-center mt-8 mb-4">
        <Link
          href={`/?ref=${username}`}
          className="text-design-gray font-mono text-sm"
        >
          Made by{' '}
          <span className="text-design-black underline underline-offset-2">
            Portfoliofy
          </span>
        </Link>
      </div>
    </>
  );
}

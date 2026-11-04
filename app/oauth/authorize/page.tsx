import { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/auth';
import { Footer } from '@/components/layout/Footer';
import { getUsernameById } from '@/lib/server/dbActions';
import { AuthorizationParams, validateAuthorization } from '@/lib/server/oauth';
import { requestOrigin } from '@/lib/server/requestOrigin';
import { ConsentForm } from './ConsentForm';
import { SignInButton } from './SignInButton';

export const metadata: Metadata = {
  title: 'Connect an app',
  robots: { index: false },
};

const SCOPE_DESCRIPTIONS: Record<string, string> = {
  'profile:read':
    'Read your profile, your pages and drafts, and your profile views',
  'profile:write':
    'Change your profile, status and pages. Profile changes go live straight away',
};

function returnHost(redirectUri: string): string {
  const url = new URL(redirectUri);
  return url.host || url.protocol.replace(':', '');
}

function ConsentLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fff] dark:bg-[#222]">
      <main className="mx-auto w-full max-w-[540px] flex-1 px-6 py-[72px] font-sans sm:px-0">
        <h1 className="mb-4 text-[20px] font-medium text-[#111] dark:text-[#eee]">
          {title}
        </h1>
        <div className="space-y-4 text-[14px] font-normal leading-relaxed text-[#666] dark:text-[#aaa]">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default async function AuthorizePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const params: AuthorizationParams = {};
  const search = new URLSearchParams();
  for (const key of [
    'client_id',
    'redirect_uri',
    'response_type',
    'code_challenge',
    'code_challenge_method',
    'scope',
    'state',
    'resource',
  ] as const) {
    const value = query[key];
    if (typeof value === 'string') {
      params[key] = value;
      search.set(key, value);
    }
  }

  const result = await validateAuthorization(params, await requestOrigin());
  if ('error' in result) {
    return (
      <ConsentLayout title="This app can't connect">
        <p>{result.error} Try connecting again from the app.</p>
      </ConsentLayout>
    );
  }

  const { client, redirectUri, scopes } = result.valid;
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <ConsentLayout title={`Sign in to connect ${client.clientName}`}>
        <p>You&apos;ll choose what it can access on the next step.</p>
        <SignInButton callbackUrl={`/oauth/authorize?${search}`} />
      </ConsentLayout>
    );
  }

  const username = await getUsernameById(session.user.id);
  if (!username) {
    return (
      <ConsentLayout title="Create your profile first">
        <p>
          You need a Portfoliofy profile before connecting an app.{' '}
          <Link
            href="/auth/post-login"
            className="text-[#111] underline underline-offset-[3px] dark:text-[#eee]"
          >
            Create your profile
          </Link>
          , then connect again from the app.
        </p>
      </ConsentLayout>
    );
  }

  return (
    <ConsentLayout title={`Connect ${client.clientName} to Portfoliofy`}>
      <p>
        {client.clientName} wants access to your profile,{' '}
        <span className="text-[#111] dark:text-[#eee]">{username}</span>. It
        will be able to:
      </p>
      <ul className="list-disc space-y-1 pl-5">
        {scopes.map((scope) => (
          <li key={scope}>{SCOPE_DESCRIPTIONS[scope]}</li>
        ))}
      </ul>
      <p>
        App names aren&apos;t verified. Only continue if you started this, and
        you recognise where it returns you:{' '}
        <span className="text-[#111] dark:text-[#eee]">
          {returnHost(redirectUri)}
        </span>
        .
      </p>
      <ConsentForm params={params} />
    </ConsentLayout>
  );
}

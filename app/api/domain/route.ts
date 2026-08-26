import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  setCustomDomain,
  removeCustomDomain,
  getCustomDomainByUserId,
  getUserIdByCustomDomain,
} from '@/lib/server/dbActions';
import { isValidDomainFormat, normalizeDomain } from '@/lib/validation/domain';
import {
  VERCEL_API_TOKEN,
  VERCEL_PROJECT_ID,
  fetchVercelAPI,
  releaseUserDomainFromVercel,
} from '@/lib/server/vercelDomains';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const domain = await getCustomDomainByUserId(session.user.id);
    if (!domain) {
      return NextResponse.json({ domain: null });
    }

    // Fetch domain project status from Vercel
    const { ok: projectOk, data: projectData } = await fetchVercelAPI(
      `/v9/projects/${VERCEL_PROJECT_ID}/domains/${encodeURIComponent(domain)}`,
    );

    if (!projectOk) {
      return NextResponse.json({ domain, status: 'error', data: projectData });
    }

    // Fetch domain DNS configuration status
    const { data: configData } = await fetchVercelAPI(
      `/v6/domains/${encodeURIComponent(domain)}/config`,
    );

    let isVerified = projectData.verified && !configData?.misconfigured;

    let verificationRecords = [];
    if (!isVerified) {
      if (domain.split('.').length > 2 && !domain.startsWith('www.')) {
        // Subdomain typically uses CNAME
        verificationRecords.push({
          type: 'CNAME',
          domain: domain,
          value: 'cname.vercel-dns.com',
        });
      } else {
        // Apex typically uses A record
        verificationRecords.push({
          type: 'A',
          domain: '@',
          value: '76.76.21.21',
        });
      }
    }

    return NextResponse.json({
      domain,
      status: 'success',
      data: {
        ...projectData,
        verified: isVerified,
        verification: verificationRecords,
      },
    });
  } catch (error) {
    console.error('Failed to get domain:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
      return NextResponse.json(
        { error: 'Vercel API Token or Project ID is missing' },
        { status: 500 },
      );
    }

    const { domain } = await req.json();
    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ error: 'Invalid domain' }, { status: 400 });
    }

    const cleanDomain = normalizeDomain(domain);
    if (!isValidDomainFormat(cleanDomain)) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 },
      );
    }

    // Reject up front if the domain is already claimed by a different
    // account — fails fast, before we spend a Vercel API call on it.
    const ownerId = await getUserIdByCustomDomain(cleanDomain);
    if (ownerId && ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'This domain is already connected to another account' },
        { status: 409 },
      );
    }

    // Check if user already has a domain, if so, remove it first from Vercel
    const existingDomain = await getCustomDomainByUserId(session.user.id);
    if (existingDomain && existingDomain !== cleanDomain) {
      await releaseUserDomainFromVercel(session.user.id);
      await removeCustomDomain(session.user.id);
    }

    // Add domain to Vercel
    const { ok, data } = await fetchVercelAPI(
      `/v10/projects/${VERCEL_PROJECT_ID}/domains`,
      {
        method: 'POST',
        body: JSON.stringify({ name: cleanDomain }),
      },
    );

    if (!ok) {
      return NextResponse.json(
        { error: data?.error?.message || 'Failed to add domain to Vercel' },
        { status: 400 },
      );
    }

    // Save to our DB. The UNIQUE constraint on users.custom_domain is the
    // hard backstop against a race with another request claiming the same
    // domain between the check above and this write.
    const result = await setCustomDomain(session.user.id, cleanDomain);
    if (!result.success) {
      return NextResponse.json(
        {
          error:
            result.reason === 'taken'
              ? 'This domain is already connected to another account'
              : 'Failed to save domain in database',
        },
        { status: result.reason === 'taken' ? 409 : 500 },
      );
    }

    // Invalidate the cache for this custom domain so the 404 page doesn't stick around!
    const { revalidateTag } = await import('next/cache');
    // @ts-expect-error Next.js 16 Canary types
    revalidateTag(`domain-${cleanDomain}`);
    // @ts-expect-error Next.js 16 Canary types
    revalidateTag(`user-${session.user.id}`); // Also invalidate user cache just in case

    return NextResponse.json({ success: true, domain: cleanDomain, data });
  } catch (error) {
    console.error('Failed to add domain:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const domain = await getCustomDomainByUserId(session.user.id);
    if (!domain) {
      return NextResponse.json({ error: 'No domain found' }, { status: 404 });
    }

    // Remove from Vercel
    await releaseUserDomainFromVercel(session.user.id);

    // Remove from DB
    await removeCustomDomain(session.user.id);

    const { revalidateTag } = await import('next/cache');
    // @ts-expect-error Next.js 16 Canary types
    revalidateTag(`domain-${domain}`);
    // @ts-expect-error Next.js 16 Canary types
    revalidateTag(`user-${session.user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove domain:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  setCustomDomain,
  removeCustomDomain,
  getCustomDomainByUserId,
} from '@/lib/server/dbActions';

const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const TEAM_ID_PARAM = process.env.VERCEL_TEAM_ID
  ? `?teamId=${process.env.VERCEL_TEAM_ID}`
  : '';

// Helper to handle Vercel API Requests
async function fetchVercelAPI(endpoint: string, options: RequestInit = {}) {
  const url = `https://api.vercel.com${endpoint}${TEAM_ID_PARAM}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${VERCEL_API_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, data };
}

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
      `/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}`,
    );

    if (!projectOk) {
      return NextResponse.json({ domain, status: 'error', data: projectData });
    }

    // Fetch domain DNS configuration status
    const { ok: configOk, data: configData } = await fetchVercelAPI(
      `/v6/domains/${domain}/config`,
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

    const cleanDomain = domain.toLowerCase().trim();

    // Check if user already has a domain, if so, remove it first from Vercel
    const existingDomain = await getCustomDomainByUserId(session.user.id);
    if (existingDomain && existingDomain !== cleanDomain) {
      await fetchVercelAPI(
        `/v9/projects/${VERCEL_PROJECT_ID}/domains/${existingDomain}`,
        {
          method: 'DELETE',
        },
      );
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

    // Save to our DB
    const dbSuccess = await setCustomDomain(session.user.id, cleanDomain);
    if (!dbSuccess) {
      return NextResponse.json(
        { error: 'Failed to save domain in database' },
        { status: 500 },
      );
    }

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
    if (VERCEL_API_TOKEN && VERCEL_PROJECT_ID) {
      await fetchVercelAPI(
        `/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}`,
        {
          method: 'DELETE',
        },
      );
    }

    // Remove from DB
    await removeCustomDomain(session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove domain:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

import { NextResponse } from 'next/server';
import { pingRedis } from '@/lib/server/rateLimit';

// Called daily by Vercel Cron (see vercel.json), which sends
// `Authorization: Bearer $CRON_SECRET`. Without CRON_SECRET set, nothing
// can call this.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const status = await pingRedis();
  return NextResponse.json(
    { status },
    { status: status === 'error' ? 502 : 200 },
  );
}

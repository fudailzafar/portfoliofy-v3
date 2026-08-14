import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  getPageViewSeries,
  getCustomDomainByUserId,
  type PageViewRange,
} from '@/lib/server/dbActions';

const VALID_RANGES: PageViewRange[] = ['week', 'month', 'year', 'all'];

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rangeParam = searchParams.get('range');
    const range: PageViewRange = VALID_RANGES.includes(
      rangeParam as PageViewRange,
    )
      ? (rangeParam as PageViewRange)
      : 'week';
    const viaCustomDomain = searchParams.get('domain') === 'custom';

    const customDomain = await getCustomDomainByUserId(session.user.id);
    const series = await getPageViewSeries(
      session.user.id,
      range,
      viaCustomDomain && !!customDomain,
    );
    const total = series.reduce((sum, day) => sum + day.views, 0);

    return NextResponse.json({
      total,
      series,
      hasCustomDomain: !!customDomain,
      customDomain,
    });
  } catch (error) {
    console.error('Failed to get insights:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

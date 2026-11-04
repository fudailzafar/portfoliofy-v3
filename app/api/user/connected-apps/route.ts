import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { disconnectApp, listConnectedApps } from '@/lib/server/oauth';

const DisconnectSchema = z.object({ clientId: z.string().min(1).max(100) });

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const apps = await listConnectedApps(session.user.id);
    return NextResponse.json({ apps });
  } catch (error) {
    console.error('Error listing connected apps:', error);
    return NextResponse.json(
      { error: 'Failed to load connected apps' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = DisconnectSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    await disconnectApp(session.user.id, parsed.data.clientId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting app:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect the app' },
      { status: 500 },
    );
  }
}

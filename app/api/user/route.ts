import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { upstashRedis } from '@/lib/server/redis';

const REDIS_KEYS = {
  RESUME_PREFIX: 'resume:',
  USER_ID_PREFIX: 'user:id:',
  USER_NAME_PREFIX: 'user:name:',
} as const;

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Get username to delete the reverse mapping
    const username = await upstashRedis.get<string>(`${REDIS_KEYS.USER_ID_PREFIX}${userId}`);

    // 2. Delete Redis keys
    const transaction = upstashRedis.multi();
    transaction.del(`${REDIS_KEYS.RESUME_PREFIX}${userId}`);
    transaction.del(`${REDIS_KEYS.USER_ID_PREFIX}${userId}`);
    if (username) {
      transaction.del(`${REDIS_KEYS.USER_NAME_PREFIX}${username}`);
    }
    await transaction.exec();

    // 3. Delete from Clerk
    const client = await clerkClient();
    await client.users.deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}

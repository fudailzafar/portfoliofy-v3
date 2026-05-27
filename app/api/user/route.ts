import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { upstashRedis } from '@/lib/server/redis';

const REDIS_KEYS = {
  RESUME_PREFIX: 'resume:',
  USER_ID_PREFIX: 'user:id:',
  USER_NAME_PREFIX: 'user:name:',
  USER_PROFILE_PREFIX: 'user:profile:',
} as const;

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get username to delete the reverse mapping
    const username = await upstashRedis.get<string>(`${REDIS_KEYS.USER_ID_PREFIX}${userId}`);

    // Delete all user Redis keys
    const transaction = upstashRedis.multi();
    transaction.del(`${REDIS_KEYS.RESUME_PREFIX}${userId}`);
    transaction.del(`${REDIS_KEYS.USER_ID_PREFIX}${userId}`);
    transaction.del(`${REDIS_KEYS.USER_PROFILE_PREFIX}${userId}`);
    if (username) {
      transaction.del(`${REDIS_KEYS.USER_NAME_PREFIX}${username}`);
    }
    await transaction.exec();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}

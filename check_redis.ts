import { upstashRedis } from './lib/server/redis.ts';

async function check() {
  const keys = await upstashRedis.keys('user:name:*');
  console.log('Usernames:', keys);
}

check().catch(console.error);

import { headers } from 'next/headers';

/** The origin the current page or server action was requested on. */
export async function requestOrigin(): Promise<string> {
  const headersList = await headers();
  const proto = headersList.get('x-forwarded-proto') ?? 'http';
  return `${proto}://${headersList.get('host')}`;
}

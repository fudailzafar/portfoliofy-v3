import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';
import sql from '@/lib/server/db';
import { isOwnS3ImageUrl } from '@/lib/utils';

const UPLOADS_PREFIX = 'next-s3-uploads/';
// DeleteObjects accepts at most 1000 keys per request.
const DELETE_BATCH_SIZE = 1000;

/**
 * Finds the S3 keys of our own uploads referenced anywhere in `text`, whether
 * stored as a bucket URL or as a CDN URL (e.g. inside a post's HTML).
 */
export function extractUploadKeys(text: string, cdnUrl?: string): string[] {
  const cdnOrigin = cdnUrl ? safeOrigin(cdnUrl) : null;
  const keys = new Set<string>();

  for (const match of text.matchAll(/https?:\/\/[^\s"'<>()\\]+/g)) {
    let url: URL;
    try {
      url = new URL(match[0]);
    } catch {
      continue;
    }
    if (!isOwnS3ImageUrl(url.href) && url.origin !== cdnOrigin) continue;

    let key: string;
    try {
      key = decodeURIComponent(url.pathname.slice(1));
    } catch {
      continue;
    }
    if (key.startsWith(UPLOADS_PREFIX)) keys.add(key);
  }

  return [...keys];
}

function safeOrigin(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function getClient() {
  return new S3Client({
    region: process.env.S3_UPLOAD_REGION,
    credentials: {
      accessKeyId: process.env.S3_UPLOAD_KEY!,
      secretAccessKey: process.env.S3_UPLOAD_SECRET!,
    },
  });
}

/**
 * Deletes every file a user uploaded. Uploads since August 2026 live under
 * `next-s3-uploads/{userId}/`; older ones sit in random folders and can only
 * be found through the URLs saved in the user's profile. Those are deleted
 * only when no other user's profile references them.
 *
 * Call this before deleting the user's rows, while their profile still exists.
 */
export async function deleteUserUploads(userId: string): Promise<number> {
  const bucket = process.env.S3_UPLOAD_BUCKET;
  if (!bucket) return 0;

  const client = getClient();
  const ownPrefix = `${UPLOADS_PREFIX}${userId}/`;
  const keys = new Set<string>();

  let continuationToken: string | undefined;
  do {
    const page = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: ownPrefix,
        ContinuationToken: continuationToken,
      }),
    );
    for (const object of page.Contents ?? []) {
      if (object.Key) keys.add(object.Key);
    }
    continuationToken = page.NextContinuationToken;
  } while (continuationToken);

  const [row] = await sql`
    SELECT u.custom_image, r.resume_data::text AS resume_text
    FROM users u
    LEFT JOIN resumes r ON r.user_id = u.id
    WHERE u.id = ${userId}
  `;
  const referenced = extractUploadKeys(
    `${row?.customImage ?? ''} ${row?.resumeText ?? ''}`,
    process.env.NEXT_PUBLIC_CDN_URL,
  );

  const legacyKeys = referenced.filter((key) => !key.startsWith(ownPrefix));
  if (legacyKeys.length > 0) {
    // Skip anything in another user's folder or used on another profile.
    const shared = await sql`
      SELECT k.key
      FROM unnest(${sql.array(legacyKeys)}::text[]) AS k(key)
      WHERE EXISTS (
        SELECT 1
        FROM users u
        LEFT JOIN resumes r ON r.user_id = u.id
        WHERE u.id <> ${userId}
          AND (
            k.key LIKE 'next-s3-uploads/' || u.id || '/%'
            OR position(k.key IN COALESCE(u.custom_image, '')) > 0
            OR position(k.key IN COALESCE(r.resume_data::text, '')) > 0
          )
      )
    `;
    const sharedKeys = new Set(shared.map((s) => s.key as string));
    for (const key of legacyKeys) {
      if (!sharedKeys.has(key)) keys.add(key);
    }
  }
  for (const key of referenced) {
    if (key.startsWith(ownPrefix)) keys.add(key);
  }

  const allKeys = [...keys];
  for (let i = 0; i < allKeys.length; i += DELETE_BATCH_SIZE) {
    const batch = allKeys.slice(i, i + DELETE_BATCH_SIZE);
    const result = await client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
      }),
    );
    if (result.Errors?.length) {
      throw new Error(
        `Failed to delete ${result.Errors.length} uploads for user ${userId}`,
      );
    }
  }

  return allKeys.length;
}

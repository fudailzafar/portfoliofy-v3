import { auth } from '@/auth';
import { upstashRedis } from '@/lib/server/redis';
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.S3_UPLOAD_REGION!,
  credentials: {
    accessKeyId: process.env.S3_UPLOAD_KEY!,
    secretAccessKey: process.env.S3_UPLOAD_SECRET!,
  },
});

const BUCKET = process.env.S3_UPLOAD_BUCKET!;
const REGION = process.env.S3_UPLOAD_REGION!;

// POST /api/user/avatar — upload a profile picture to S3 and store URL in Redis
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image must be under 5MB' }, { status: 400 });
    }

    const userId = session.user.id;
    const ext = file.type.split('/')[1] || 'jpg';
    const key = `avatars/${userId}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        // Cache for 1 year but allow CDN to serve it
        CacheControl: 'public, max-age=31536000',
      }),
    );

    const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

    // Update userProfile in Redis with the custom image
    const existing = await upstashRedis.get<Record<string, any>>(`user:profile:${userId}`);
    await upstashRedis.set(`user:profile:${userId}`, {
      ...existing,
      customImage: url,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Avatar upload failed:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

// DELETE /api/user/avatar — remove custom profile picture, fall back to Google photo
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Try to delete from S3 (both jpg and png extensions)
    for (const ext of ['jpg', 'jpeg', 'png', 'webp', 'gif']) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: `avatars/${userId}.${ext}`,
          }),
        );
      } catch {
        // Ignore — file may not exist for this extension
      }
    }

    // Remove customImage from Redis profile
    const existing = await upstashRedis.get<Record<string, any>>(`user:profile:${userId}`);
    if (existing) {
      const { customImage, ...rest } = existing;
      await upstashRedis.set(`user:profile:${userId}`, rest);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Avatar removal failed:', error);
    return NextResponse.json({ error: 'Failed to remove image' }, { status: 500 });
  }
}

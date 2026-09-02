import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getUserData } from '../../utils';
import { findPageBySlug, estimateReadMinutes } from '@/lib/resume';
import { getOptimizedImageUrl, isOwnS3ImageUrl } from '@/lib/utils';
import { getOgFonts } from '@/lib/server/ogFonts';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string; slug: string }> },
) {
  try {
    // Read the route's own matched params rather than parsing
    // request.nextUrl.pathname — on a subdomain, proxy.ts rewrites the
    // browser-visible path (e.g. /hello-world/og) to /{username}/hello-world/og
    // for routing purposes, but nextUrl.pathname inside the handler still
    // reflects the original, un-prefixed path. Parsing that manually reads
    // the slug as the username and 'og' as the slug. params is populated
    // from the actual matched route and isn't affected by that.
    const { username, slug } = await params;

    const ogFonts = await getOgFonts();
    const { resume, userProfile } = await getUserData(username);
    const found = resume?.resumeData
      ? findPageBySlug(resume.resumeData, slug)
      : undefined;

    const title = found?.title || 'Untitled';
    const name = resume?.resumeData?.header?.name || username;
    const readMinutes = estimateReadMinutes(found?.content || '');

    // Same trust rule as app/[username]/og/route.tsx: this route is public
    // and unauthenticated, and ImageResponse fetches `src` server-side, so
    // only ever trust our own S3 URL for the uploaded avatar.
    const rawProfileImage =
      (userProfile?.customImage && isOwnS3ImageUrl(userProfile.customImage)
        ? userProfile.customImage
        : null) || userProfile?.image;
    const profileImageUrl =
      getOptimizedImageUrl(rawProfileImage) ||
      `${request.nextUrl.origin}/placeholder.svg`;

    // Same 40x40 subtle grid pattern as the profile OG image, for brand
    // consistency across every generated image on the platform.
    const gridSvg = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQwIDBIMHY0MEg0MFYweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0zOS41IDB2NDBNMCAzOS41aDQwIiBzdHJva2U9IiNlNWU1ZTUiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==`;

    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fafafa',
          position: 'relative',
        }}
      >
        {/* Grid Background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${gridSvg})`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Radial Gradient Overlay, anchored to the left where the
              content sits, rather than centered like the profile card */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'radial-gradient(circle at 0% 30%, rgba(250,250,250,1) 0%, rgba(250,250,250,0) 65%)',
          }}
        />

        {/* Content Wrapper — left-aligned */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            padding: '0 80px',
            zIndex: 10,
          }}
        >
          {/* Avatar */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profileImageUrl}
            alt="Profile"
            width={96}
            height={96}
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '48px',
              objectFit: 'cover',
              border: '3px solid white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              marginBottom: '28px',
            }}
          />

          {/* Name */}
          <div
            style={{
              display: 'flex',
              fontFamily: 'Inter-Regular',
              fontSize: '28px',
              color: '#4a4a4a',
              letterSpacing: '-0.01em',
              marginBottom: '20px',
            }}
          >
            {name}
          </div>

          {/* Blog title */}
          <div
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 3,
              overflow: 'hidden',
              fontFamily: 'Inter-Medium',
              fontSize: '64px',
              fontWeight: 500,
              color: '#111111',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              maxWidth: '960px',
              marginBottom: '20px',
            }}
          >
            {title}
          </div>

          {/* Read time */}
          <div
            style={{
              display: 'flex',
              fontFamily: 'Inter-Regular',
              fontSize: '24px',
              color: '#8a8a8a',
              letterSpacing: '-0.01em',
            }}
          >
            {readMinutes} min read
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        fonts: ogFonts,
      },
    );
  } catch (e: any) {
    console.error('Blog OG Image Generation Error:', e);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}

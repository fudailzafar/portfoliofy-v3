import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getUserData } from '../utils';
import { readFileSync } from 'fs';
import { join } from 'path';

const graphikMedium = readFileSync(join(process.cwd(), 'public/fonts/Graphik-Medium.woff'));
const graphikRegular = readFileSync(join(process.cwd(), 'public/fonts/Graphik-Regular.woff'));

export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.pathname.split('/')[1];

    const { user_id, resume, userProfile } = await getUserData(username);

    // Get data from resume
    const name = resume?.resumeData?.header?.name || username;
    const role = resume?.resumeData?.header?.shortAbout || '';
    const location = resume?.resumeData?.header?.location || '';

    let subtitle = role;
    if (role && location) {
      subtitle = `${role} in ${location}`;
    } else if (!role && location) {
      subtitle = `Based in ${location}`;
    }

    // Use profile image from Postgres users table
    const profileImageUrl = userProfile?.customImage || userProfile?.image || `${request.nextUrl.origin}/placeholder.svg`;

    // 40x40 subtle grid pattern
    const gridSvg = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQwIDBIMHY0MGg0MFYweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0zOS41IDB2NDBNMCAzOS41aDQwIiBzdHJva2U9IiNlNWU1ZTUiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==`;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
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
          
          {/* Radial Gradient Overlay for focus */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(250,250,250,1) 0%, rgba(250,250,250,0) 70%)',
            }}
          />

          {/* Content Wrapper */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              padding: '0 40px',
            }}
          >
            {/* Circular Profile Image */}
            <img
              src={profileImageUrl}
              alt="Profile"
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '90px',
                objectFit: 'cover',
                marginBottom: '40px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                border: '4px solid white',
              }}
            />

            {/* Title (Name) */}
            <div
              style={{
                fontFamily: 'Graphik-Medium',
                fontSize: '68px',
                fontWeight: 500,
                color: '#111111',
                marginBottom: '16px',
                textAlign: 'center',
                letterSpacing: '-0.02em',
              }}
            >
              {name}
            </div>

            {/* Subtitle (Role in Location) */}
            {subtitle && (
              <div
                style={{
                  fontFamily: 'Graphik-Regular',
                  fontSize: '36px',
                  color: '#4a4a4a',
                  textAlign: 'center',
                  letterSpacing: '-0.01em',
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Graphik-Medium',
            data: graphikMedium,
            weight: 500,
            style: 'normal',
          },
          {
            name: 'Graphik-Regular',
            data: graphikRegular,
            weight: 400,
            style: 'normal',
          },
        ],
      }
    );
  } catch (e: any) {
    console.error('OG Image Generation Error:', e);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
  

/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Prevent clickjacking — stops this page being loaded in an <iframe>
  { key: 'X-Frame-Options', value: 'DENY' },
  // Block MIME-sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Limit referrer info sent to third parties
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable browser features we don't need
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Enforce HTTPS for 2 years (already present via host; explicit here for completeness)
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/press',
        destination: 'https://app.notion.com/p/Portfoliofy-Press-Kit-081c5b565052824990a60106e1d1c9de?source=copy_link',
        permanent: false,
      },
    ];
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;


// Digital Asset Links: lets the Android app (a Trusted Web Activity) open
// this site full-screen, without a browser address bar. The fingerprints are
// the SHA-256 of the upload key and of Play's app signing key, both listed in
// Play Console under App integrity.
export function GET() {
  const packageName = process.env.ANDROID_PACKAGE_NAME;
  const fingerprints = (process.env.ANDROID_CERT_FINGERPRINTS || '')
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);

  const statements =
    packageName && fingerprints.length > 0
      ? [
          {
            relation: ['delegate_permission/common.handle_all_urls'],
            target: {
              namespace: 'android_app',
              package_name: packageName,
              sha256_cert_fingerprints: fingerprints,
            },
          },
        ]
      : [];

  return Response.json(statements);
}

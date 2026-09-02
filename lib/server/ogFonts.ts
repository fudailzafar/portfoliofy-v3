// Font data for @vercel/og's ImageResponse (used by the OG image routes).
// ImageResponse needs raw font bytes up front — it can't use a next/font
// loader, which only wires up CSS for normal page rendering. Previously
// this read Graphik's font files straight off disk; those aren't ours to
// redistribute (see app/layout.tsx), so this fetches Inter — SIL Open Font
// Licensed, safe to redistribute — from Google Fonts instead, once per
// serverless instance, and caches the result for every OG request after
// that.
//
// Fetching with no custom User-Agent is deliberate: Google's font CSS API
// serves different font formats depending on the request's User-Agent, and
// a plain server-side fetch (no browser UA) gets truetype — the format
// @vercel/og's renderer (Satori) needs, unlike the woff2 a browser would
// get.
let cachedFonts: Promise<
  { name: string; data: ArrayBuffer; weight: 400 | 500; style: 'normal' }[]
> | null = null;

async function fetchInterWeight(weight: 400 | 500): Promise<ArrayBuffer> {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}`,
  ).then((res) => res.text());

  const fontUrlMatch = css.match(
    /src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/,
  );
  if (!fontUrlMatch) {
    throw new Error(`Could not resolve Inter font URL for weight ${weight}`);
  }

  const fontResponse = await fetch(fontUrlMatch[1]);
  return fontResponse.arrayBuffer();
}

export function getOgFonts() {
  if (!cachedFonts) {
    cachedFonts = Promise.all([
      fetchInterWeight(400),
      fetchInterWeight(500),
    ]).then(([regular, medium]) => [
      {
        name: 'Inter-Regular',
        data: regular,
        weight: 400 as const,
        style: 'normal' as const,
      },
      {
        name: 'Inter-Medium',
        data: medium,
        weight: 500 as const,
        style: 'normal' as const,
      },
    ]);
  }
  return cachedFonts;
}

// OG images need raw font bytes (next/font only emits CSS), so fetch Inter
// once per instance. No User-Agent: Google then serves TrueType, which
// Satori needs, instead of woff2.
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

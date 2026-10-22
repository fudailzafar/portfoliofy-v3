// JSON for a <script type="application/ld+json"> tag. Escapes the characters
// that could close the tag or break the script, since profiles put user text
// (names, titles, companies) in here.
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

// Turns a status's plain text into blocks for display, the way the original did:
// lines starting "* " or "- " become a bulleted list, lines starting "1. "
// a numbered list, and web addresses inside the text become links.

export type Inline =
  | { type: 'text'; text: string }
  | { type: 'link'; text: string; href: string };

export type Block =
  | { type: 'paragraph'; lines: Inline[][] }
  | { type: 'bullets'; items: Inline[][] }
  | { type: 'numbers'; start: number; items: Inline[][] };

const BULLET = /^\s*[*-]\s+(.*)$/;
const NUMBER = /^\s*(\d{1,3})[.)]\s+(.*)$/;
// http(s) links and bare www. addresses. Trailing punctuation stays text.
const URL_PATTERN = /\b(?:https?:\/\/|www\.)[^\s<>"']+/gi;
const TRAILING = /[.,!?;:)\]}'"]+$/;

export function linkify(text: string): Inline[] {
  const parts: Inline[] = [];
  let last = 0;
  for (const match of text.matchAll(URL_PATTERN)) {
    let url = match[0];
    const trailing = url.match(TRAILING)?.[0] ?? '';
    // Keep a closing bracket that belongs to the URL, e.g. wikipedia links.
    if (trailing) url = url.slice(0, -trailing.length);
    const start = match.index ?? 0;
    if (start > last)
      parts.push({ type: 'text', text: text.slice(last, start) });
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    parts.push({ type: 'link', text: url, href });
    last = start + url.length;
  }
  if (last < text.length) parts.push({ type: 'text', text: text.slice(last) });
  return parts;
}

export function parseStatusText(text: string): Block[] {
  const blocks: Block[] = [];
  for (const line of text.replace(/\r\n?/g, '\n').split('\n')) {
    const bullet = line.match(BULLET);
    const number = bullet ? null : line.match(NUMBER);
    const prev = blocks[blocks.length - 1];

    if (bullet) {
      const item = linkify(bullet[1]);
      if (prev?.type === 'bullets') prev.items.push(item);
      else blocks.push({ type: 'bullets', items: [item] });
    } else if (number) {
      const item = linkify(number[2]);
      if (prev?.type === 'numbers') prev.items.push(item);
      else
        blocks.push({
          type: 'numbers',
          start: Number(number[1]),
          items: [item],
        });
    } else if (line.trim() === '') {
      // A blank line ends the current block.
      blocks.push({ type: 'paragraph', lines: [] });
    } else if (prev?.type === 'paragraph' && prev.lines.length > 0) {
      prev.lines.push(linkify(line));
    } else {
      blocks.push({ type: 'paragraph', lines: [linkify(line)] });
    }
  }
  // Drop the empty paragraphs left by blank lines.
  return blocks.filter((b) => b.type !== 'paragraph' || b.lines.length > 0);
}

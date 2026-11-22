// How web addresses are shown in statuses and descriptions: without
// "https://" or "www.", and cut to a short length with an ellipsis, like
// the original's "nts.live/shows/the-do-y…". Only the text changes; the link still
// goes to the full address.

export const URL_DISPLAY_MAX = 25;

/** "https://www.nts.live/shows/the-do-your-thing/" -> "nts.live/shows/the-do-y…" */
export function shortenUrl(url: string, max = URL_DISPLAY_MAX): string {
  const bare = url
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/+$/, '');
  return bare.length > max ? `${bare.slice(0, max)}…` : bare;
}

const WEB_ADDRESS = /^(?:https?:\/\/|www\.)\S+$/i;
const ANCHOR = /(<a\b[^>]*>)([^<]*)(<\/a>)/gi;

/**
 * In rich-text HTML, shortens the visible text of links whose text is itself a
 * web address. Links with words as their text ("my portfolio") are left alone.
 * The full address stays in the page for printing and saving as PDF, which
 * should show it in full: the short text hides and the full text shows there.
 */
export function shortenLinkText(html: string): string {
  if (!html || !html.includes('<a')) return html;
  return html.replace(ANCHOR, (whole, open: string, text: string, close) => {
    const plain = text.replace(/&amp;/g, '&');
    if (!WEB_ADDRESS.test(plain.trim())) return whole;
    const short = shortenUrl(plain).replace(/&/g, '&amp;');
    if (short === text) return whole;
    return `${open}<span class="print:hidden">${short}</span><span class="hidden print:inline">${text}</span>${close}`;
  });
}

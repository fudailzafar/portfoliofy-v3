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
 */
export function shortenLinkText(html: string): string {
  if (!html || !html.includes('<a')) return html;
  return html.replace(ANCHOR, (whole, open: string, text: string, close) => {
    const plain = text.replace(/&amp;/g, '&');
    if (!WEB_ADDRESS.test(plain.trim())) return whole;
    return `${open}${shortenUrl(plain).replace(/&/g, '&amp;')}${close}`;
  });
}

type Mode = 'login' | 'signup';

const COPY = {
  login: {
    heading: 'Log in to Portfoliofy',
    intro: 'Use the button below to log in.',
    button: 'Log in',
    textAction: 'log in',
  },
  signup: {
    heading: 'Create your profile',
    intro: 'Use the button below to create your Portfoliofy profile.',
    button: 'Create profile',
    textAction: 'create your profile',
  },
} as const;

const FONT_STACK =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildLoginEmail(link: string, mode: Mode) {
  const copy = COPY[mode];
  const href = escapeHtml(link);

  const text = `Open this link to ${copy.textAction} on Portfoliofy:\n\n${link}\n\nIt expires in 15 minutes and only works once. If you didn't ask for it, you can ignore this email.`;

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>${copy.heading}</title>
    <style>
      @media (prefers-color-scheme: dark) {
        .page { background-color: #222222 !important; }
        .text-primary { color: #eeeeee !important; }
        .text-secondary { color: #aaaaaa !important; }
        .text-muted { color: #9ca3af !important; }
        .button { background-color: #333333 !important; border-color: #333333 !important; color: #eeeeee !important; }
        .divider { border-color: #333333 !important; }
      }
    </style>
  </head>
  <body class="page" style="margin:0;padding:0;background-color:#ffffff;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="page" style="background-color:#ffffff;">
      <tr>
        <td align="center" style="padding:48px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;">
            <tr>
              <td class="text-primary" style="font-family:${FONT_STACK};font-size:14px;line-height:1.6;font-weight:500;color:#111111;padding-bottom:32px;">
                portfoliofy.site
              </td>
            </tr>
            <tr>
              <td class="text-primary" style="font-family:${FONT_STACK};font-size:20px;line-height:1.4;font-weight:500;color:#111111;padding-bottom:8px;">
                ${copy.heading}
              </td>
            </tr>
            <tr>
              <td class="text-secondary" style="font-family:${FONT_STACK};font-size:14px;line-height:1.6;color:#666666;padding-bottom:24px;">
                ${copy.intro} The link expires in 15 minutes and works once.
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:32px;">
                <a href="${href}" class="button" style="display:inline-block;font-family:${FONT_STACK};font-size:14px;line-height:36px;font-weight:500;color:#111111;text-decoration:none;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:0 24px;">${copy.button}</a>
              </td>
            </tr>
            <tr>
              <td class="divider" style="border-top:1px solid #f3f4f6;padding-top:24px;">
                <p class="text-muted" style="margin:0 0 8px;font-family:${FONT_STACK};font-size:12px;line-height:1.6;color:#6b7280;">
                  Button not working? Paste this link into your browser:
                </p>
                <p class="text-muted" style="margin:0 0 16px;font-family:${FONT_STACK};font-size:12px;line-height:1.6;color:#6b7280;word-break:break-all;">
                  <a href="${href}" class="text-muted" style="color:#6b7280;text-decoration:underline;">${href}</a>
                </p>
                <p class="text-muted" style="margin:0;font-family:${FONT_STACK};font-size:12px;line-height:1.6;color:#6b7280;">
                  If you didn&rsquo;t ask for this, you can ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

  return { subject: 'Your Portfoliofy login link', text, html };
}

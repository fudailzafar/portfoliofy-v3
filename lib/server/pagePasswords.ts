import crypto from 'crypto';
import type { AttachmentSchemaType, ResumeDataSchemaType } from '@/lib/resume';

// Password-protected pages. Only a salted scrypt hash is stored, inside the
// page in resume_data. It never leaves the server: owners get a
// `passwordProtected` flag, visitors get a stub with no title or content.

export const PAGE_PASSWORD_MIN_LENGTH = 4;
export const PAGE_PASSWORD_MAX_LENGTH = 128;

const KEY_LENGTH = 32;

export function hashPagePassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export function verifyPagePassword(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split('$');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(
    password,
    Buffer.from(saltHex, 'hex'),
    expected.length,
  );
  return crypto.timingSafeEqual(actual, expected);
}

type ResumeData = ResumeDataSchemaType | null | undefined;

function mapPages<T extends ResumeData>(
  resumeData: T,
  fn: (page: AttachmentSchemaType) => AttachmentSchemaType,
): T {
  if (!resumeData?.pages) return resumeData;
  return { ...resumeData, pages: resumeData.pages.map(fn) };
}

// For the owner's own editor: the hash becomes a flag.
export function toOwnerResume<T extends ResumeData>(resumeData: T): T {
  return mapPages(resumeData, ({ passwordHash, ...page }) => ({
    ...page,
    passwordProtected: !!passwordHash,
  }));
}

// For everyone else: a locked page keeps only what is needed to list and link
// to it. Title, content and thumbnail stay on the server.
export function toPublicResume<T extends ResumeData>(resumeData: T): T {
  return mapPages(resumeData, ({ passwordHash, ...page }) =>
    passwordHash
      ? {
          id: page.id,
          type: page.type,
          slug: page.slug,
          createdAt: page.createdAt,
          hidden: page.hidden,
          isBlurred: page.isBlurred,
          passwordProtected: true,
        }
      : { ...page, passwordProtected: false },
  );
}

// Saves come from the client, which never holds the hashes. Take each page's
// hash from what is already stored, so a save can neither drop nor forge one.
export function withStoredPagePasswords<T extends ResumeData>(
  incoming: T,
  stored: ResumeData,
): T {
  const hashes = new Map(
    (stored?.pages || [])
      .filter((p) => p.passwordHash)
      .map((p) => [p.id, p.passwordHash as string]),
  );
  return mapPages(incoming, ({ passwordHash, passwordProtected, ...page }) => {
    void passwordHash;
    void passwordProtected;
    const hash = hashes.get(page.id);
    return hash ? { ...page, passwordHash: hash } : page;
  });
}

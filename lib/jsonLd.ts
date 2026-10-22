import type { ResumeDataSchemaType } from './resume';

const stripHtml = (html?: string) =>
  html ? html.replace(/<[^>]*>?/gm, '').trim() : '';

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

const isCurrent = (end?: string | null) => !end || /^now$/i.test(end.trim());

// schema.org ProfilePage for a public profile, so search engines and agents
// read it as one person. Uses only what the profile shows: hidden entries
// and hidden contacts stay out.
export function buildProfileJsonLd({
  resume,
  url,
  image,
  dateCreated,
}: {
  resume: ResumeDataSchemaType;
  url: string;
  image?: string;
  dateCreated?: string | Date | null;
}) {
  const { header } = resume;
  const contacts = (resume.contacts || []).filter((c) => !c.hidden);
  const work = (resume.workExperience || []).filter((w) => !w.hidden);
  const education = (resume.education || []).filter((e) => !e.hidden);

  const sameAs = contacts
    .filter(
      (c) =>
        c.platform?.toLowerCase() !== 'email' && c.link?.startsWith('http'),
    )
    .map((c) => c.link);
  const email = contacts
    .find((c) => c.platform?.toLowerCase() === 'email')
    ?.link?.replace(/^mailto:/i, '');

  const worksFor = work
    .filter((w) => isCurrent(w.end))
    .map((w) => ({
      '@type': 'Organization',
      name: w.company,
      ...(w.link?.startsWith('http') && { url: w.link }),
    }));
  const alumniOf = education.map((e) => ({
    '@type': 'EducationalOrganization',
    name: e.school,
    ...(e.link?.startsWith('http') && { url: e.link }),
  }));
  const currentRole = work.find((w) => isCurrent(w.end))?.title;

  const person = {
    '@type': 'Person',
    name: header.name,
    url,
    ...(image && { image }),
    ...(header.shortAbout && { description: header.shortAbout }),
    ...(currentRole && { jobTitle: currentRole }),
    ...(header.location && {
      homeLocation: { '@type': 'Place', name: header.location },
    }),
    ...(email && { email }),
    ...(worksFor.length > 0 && { worksFor }),
    ...(alumniOf.length > 0 && { alumniOf }),
    ...(header.skills?.length > 0 && { knowsAbout: header.skills }),
    ...(sameAs.length > 0 && { sameAs }),
  };

  const summary = stripHtml(resume.summary);
  const created = dateCreated ? new Date(dateCreated) : null;

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url,
    ...(summary && { description: summary }),
    ...(created &&
      !isNaN(created.getTime()) && { dateCreated: created.toISOString() }),
    mainEntity: person,
  };
}

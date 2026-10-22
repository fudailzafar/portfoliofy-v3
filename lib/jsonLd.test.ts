import { describe, expect, it } from 'vitest';
import { buildProfileJsonLd, serializeJsonLd } from './jsonLd';
import type { ResumeDataSchemaType } from './resume';

const resume = (overrides: Partial<ResumeDataSchemaType> = {}) =>
  ({
    header: {
      name: 'Ada Lovelace',
      shortAbout: 'Engineer',
      location: 'London, UK',
      skills: ['Maths', 'Engines'],
    },
    summary: '<p>Writes <b>notes</b>.</p>',
    workExperience: [
      {
        company: 'Analytical Co',
        link: 'https://analytical.example',
        location: 'London',
        title: 'Lead',
        start: '2024',
        end: 'Now',
        description: '',
        hidden: false,
      },
      {
        company: 'Old Job',
        location: 'London',
        title: 'Intern',
        start: '2020',
        end: '2021',
        description: '',
        hidden: false,
      },
      {
        company: 'Secret Co',
        location: 'London',
        title: 'Hidden role',
        start: '2023',
        end: '',
        description: '',
        hidden: true,
      },
    ],
    education: [
      { school: 'Uni', degree: 'BSc', start: '2016', end: '2020' },
      {
        school: 'Hidden School',
        degree: 'X',
        start: '2015',
        end: '2016',
        hidden: true,
      },
    ],
    contacts: [
      { platform: 'GitHub', link: 'https://github.com/ada', hidden: false },
      { platform: 'Email', link: 'mailto:ada@example.com', hidden: true },
    ],
    ...overrides,
  }) as unknown as ResumeDataSchemaType;

describe('serializeJsonLd', () => {
  it('cannot close the script tag', () => {
    const out = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('<');
    expect(out).not.toContain('>');
    expect(JSON.parse(out).name).toBe('</script><script>alert(1)</script>');
  });

  it('escapes ampersands and line separators', () => {
    const out = serializeJsonLd({ a: 'x & y z' });
    expect(out).toContain('\\u0026');
    expect(out).toContain('\\u2028');
    expect(JSON.parse(out).a).toBe('x & y z');
  });
});

describe('buildProfileJsonLd', () => {
  const ld = buildProfileJsonLd({
    resume: resume(),
    url: 'https://example.com/ada',
    image: 'https://example.com/ada.png',
    dateCreated: new Date('2026-01-02T00:00:00Z'),
  });
  const person = ld.mainEntity as Record<string, any>;

  it('wraps a Person in a ProfilePage', () => {
    expect(ld['@type']).toBe('ProfilePage');
    expect(ld.description).toBe('Writes notes.');
    expect(ld.dateCreated).toBe('2026-01-02T00:00:00.000Z');
    expect(person['@type']).toBe('Person');
    expect(person.homeLocation).toEqual({
      '@type': 'Place',
      name: 'London, UK',
    });
    expect(person.knowsAbout).toEqual(['Maths', 'Engines']);
  });

  it('lists only current, visible employers', () => {
    expect(person.worksFor).toEqual([
      {
        '@type': 'Organization',
        name: 'Analytical Co',
        url: 'https://analytical.example',
      },
    ]);
    expect(person.jobTitle).toBe('Lead');
  });

  it('leaves out hidden schools and contacts', () => {
    expect(person.alumniOf).toEqual([
      { '@type': 'EducationalOrganization', name: 'Uni' },
    ]);
    expect(person.sameAs).toEqual(['https://github.com/ada']);
    expect(person.email).toBeUndefined();
  });
});

import { describe, expect, it } from 'vitest';
import { SITE_HOST, classifyHost } from './site';

describe('classifyHost', () => {
  it.each([
    SITE_HOST,
    `www.${SITE_HOST}`,
    'localhost',
    'localhost:3000',
    'portfoliofy-v3-git-main.vercel.app',
    '',
    null,
    undefined,
  ])('treats %s as the main site', (host) => {
    expect(classifyHost(host).kind).toBe('main');
  });

  it('extracts the username from a subdomain of the site host', () => {
    expect(classifyHost(`jane.${SITE_HOST}`)).toEqual({
      kind: 'subdomain',
      hostname: `jane.${SITE_HOST}`,
      username: 'jane',
    });
  });

  it('extracts the username from a localhost subdomain, ignoring the port', () => {
    expect(classifyHost('jane.localhost:3000')).toEqual({
      kind: 'subdomain',
      hostname: 'jane.localhost',
      username: 'jane',
    });
  });

  it('treats any other host as a custom domain, lowercased', () => {
    expect(classifyHost('Abaan.LOL')).toEqual({
      kind: 'custom',
      hostname: 'abaan.lol',
    });
  });

  it('does not mistake a host that merely ends in the site name for a subdomain', () => {
    expect(classifyHost(`not${SITE_HOST}`).kind).toBe('custom');
  });
});

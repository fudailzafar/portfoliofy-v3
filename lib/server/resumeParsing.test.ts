import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  jsonFromReply,
  parseResumeTextWithGroq,
  resumeOutline,
} from './resumeParsing';

const fetchMock = vi.fn();

function groqReply(content: unknown, finish = 'stop') {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      choices: [{ finish_reason: finish, message: { content } }],
    }),
    text: async () => '',
  };
}

describe('resumeOutline', () => {
  it('lists the resume sections but not the app-owned ones', () => {
    const outline = JSON.parse(resumeOutline());
    expect(Object.keys(outline)).toEqual(
      expect.arrayContaining([
        'header',
        'summary',
        'workExperience',
        'education',
      ]),
    );
    for (const skipped of ['pages', 'preferences', 'sectionOrder', 'design']) {
      expect(outline).not.toHaveProperty(skipped);
    }
    expect(outline.workExperience[0]).not.toHaveProperty('id');
    expect(outline.workExperience[0]).not.toHaveProperty('attachments');
    expect(outline.header).toHaveProperty('name');
  });

  it('is small enough for the free per-minute token limit', () => {
    // The full schema is ~30,000 characters; this must stay a fraction of it.
    expect(resumeOutline().length).toBeLessThan(6000);
  });
});

describe('jsonFromReply', () => {
  it('reads plain JSON, fenced JSON and JSON inside prose', () => {
    expect(jsonFromReply('{"a":1}')).toEqual({ a: 1 });
    expect(jsonFromReply('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(jsonFromReply('Here you go: {"a":{"b":2}} done')).toEqual({
      a: { b: 2 },
    });
  });
  it('throws when there is no JSON', () => {
    expect(() => jsonFromReply('sorry, no')).toThrow();
  });
});

describe('parseResumeTextWithGroq', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('GROQ_API_KEY', 'test-key');
    vi.stubEnv('GROQ_MODEL', '');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('returns the parsed resume and tidies it', async () => {
    fetchMock.mockResolvedValue(
      groqReply(
        JSON.stringify({
          header: {
            name: ' Jane Doe ',
            shortAbout:
              'A very long sub-headline that goes well past the limit',
            website: 'janedoe.com',
          },
        }),
      ),
    );
    const out = await parseResumeTextWithGroq('resume text');
    expect(out.header.shortAbout.length).toBeLessThanOrEqual(32);
    expect(out.header.website).toBe('https://janedoe.com');
  });

  it('sends the key, the default model and low reasoning effort', async () => {
    fetchMock.mockResolvedValue(groqReply('{"header":{"name":"A"}}'));
    await parseResumeTextWithGroq('resume text');
    const [url, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(url).toContain('api.groq.com');
    expect(init.headers.Authorization).toBe('Bearer test-key');
    expect(body.model).toBe('openai/gpt-oss-120b');
    expect(body.reasoning_effort).toBe('low');
    expect(body.messages[1].content).toBe('resume text');
  });

  it('uses GROQ_MODEL, without reasoning effort for other models', async () => {
    vi.stubEnv('GROQ_MODEL', 'some/other-model');
    fetchMock.mockResolvedValue(groqReply('{"header":{"name":"A"}}'));
    await parseResumeTextWithGroq('x');
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.model).toBe('some/other-model');
    expect(body).not.toHaveProperty('reasoning_effort');
  });

  it('throws on an HTTP error such as the rate limit', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => 'rate limited',
    });
    await expect(parseResumeTextWithGroq('x')).rejects.toThrow(/429/);
  });

  it('throws when the reply was cut off', async () => {
    fetchMock.mockResolvedValue(groqReply('{"header":{"name":"A"', 'length'));
    await expect(parseResumeTextWithGroq('x')).rejects.toThrow(/cut off/);
  });

  it('throws when the reply has no name', async () => {
    fetchMock.mockResolvedValue(groqReply('{"header":{"name":"  "}}'));
    await expect(parseResumeTextWithGroq('x')).rejects.toThrow(/no name/);
  });

  it('throws when the key is missing', async () => {
    vi.stubEnv('GROQ_API_KEY', '');
    await expect(parseResumeTextWithGroq('x')).rejects.toThrow(/GROQ_API_KEY/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

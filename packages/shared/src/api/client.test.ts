import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { ResumeDataSchema } from '../resume';
import { useResumeStore } from '../store/useResumeStore';
import { createApiClient } from './client';
import { ApiError, ResumeValidationError, SaveConflictError } from './errors';
import { saveResumeData } from './saveResume';

const validData = ResumeDataSchema.parse({
  header: { name: 'Jane', shortAbout: '', location: '', skills: [] },
  summary: '',
  workExperience: [],
  education: [],
  projects: [],
  sideProjects: [],
  speaking: [],
  writing: [],
  exhibitions: [],
  features: [],
  volunteering: [],
  awards: [],
  certifications: [],
  contacts: [],
});

type Fetch = (input: string, init?: RequestInit) => Promise<Response>;

const json = (body: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

const lastCall = (fetchMock: Mock<Fetch>, n = 0) => {
  const [url, init] = fetchMock.mock.calls[n];
  return { url: url as string, init: init as RequestInit };
};

describe('createApiClient', () => {
  let fetchMock: Mock<Fetch>;
  beforeEach(() => {
    fetchMock = vi.fn<Fetch>();
  });

  it('sends a bearer token and uses the base URL', async () => {
    fetchMock.mockResolvedValue(json({ resume: { status: 'live' } }));
    const client = createApiClient({
      baseUrl: 'https://portfoliofy.site/',
      getAccessToken: async () => 'tok',
      fetch: fetchMock,
    });

    await client.getResume();

    const { url, init } = lastCall(fetchMock);
    expect(url).toBe('https://portfoliofy.site/api/resume');
    expect((init.headers as Record<string, string>).Authorization).toBe(
      'Bearer tok',
    );
  });

  it('sends no Authorization header without a token (cookie mode)', async () => {
    fetchMock.mockResolvedValue(json({ username: 'jane' }));
    const client = createApiClient({ fetch: fetchMock });

    await expect(client.getUsername()).resolves.toBe('jane');

    const { url, init } = lastCall(fetchMock);
    expect(url).toBe('/api/username');
    expect(init.headers).not.toHaveProperty('Authorization');
  });

  it('returns undefined when the user has no profile yet', async () => {
    fetchMock.mockResolvedValue(json({}));
    await expect(
      createApiClient({ fetch: fetchMock }).getResume(),
    ).resolves.toBeUndefined();
  });

  it('refreshes once on 401 and retries with the new token', async () => {
    let token = 'old';
    fetchMock
      .mockResolvedValueOnce(json({ error: 'Unauthorized' }, 401))
      .mockResolvedValueOnce(json({ resume: { status: 'live' } }));
    const refresh = vi.fn(async () => {
      token = 'new';
      return true;
    });
    const client = createApiClient({
      getAccessToken: () => token,
      refreshAccessToken: refresh,
      fetch: fetchMock,
    });

    await expect(client.getResume()).resolves.toEqual({ status: 'live' });

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(
      (lastCall(fetchMock, 1).init.headers as Record<string, string>)
        .Authorization,
    ).toBe('Bearer new');
  });

  it('gives up after one refresh, and when refreshing fails', async () => {
    fetchMock.mockResolvedValue(json({ error: 'Unauthorized' }, 401));
    const stillBad = createApiClient({
      getAccessToken: () => 'tok',
      refreshAccessToken: async () => true,
      fetch: fetchMock,
    });
    await expect(stillBad.getResume()).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    fetchMock.mockClear();
    const cannotRefresh = createApiClient({
      getAccessToken: () => 'tok',
      refreshAccessToken: async () => false,
      fetch: fetchMock,
    });
    await expect(cannotRefresh.getResume()).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not try to refresh when no token was sent', async () => {
    fetchMock.mockResolvedValue(json({ error: 'Unauthorized' }, 401));
    const refresh = vi.fn(async () => true);
    const client = createApiClient({
      refreshAccessToken: refresh,
      fetch: fetchMock,
    });

    await expect(client.getResume()).rejects.toMatchObject({ status: 401 });
    expect(refresh).not.toHaveBeenCalled();
  });

  it('turns a 409 into SaveConflictError with the server message', async () => {
    fetchMock.mockResolvedValue(json({ error: 'Changed elsewhere.' }, 409));
    const client = createApiClient({ fetch: fetchMock });

    const error = await client
      .saveResume({ status: 'live', resumeData: validData, version: 3 })
      .catch((e) => e);

    expect(error).toBeInstanceOf(SaveConflictError);
    expect(error.message).toBe('Changed elsewhere.');
  });

  it('reports how long to wait when rate limited', async () => {
    fetchMock.mockResolvedValue(
      json({ error: 'Too many saves.' }, 429, { 'Retry-After': '42' }),
    );
    const error = await createApiClient({ fetch: fetchMock })
      .saveResume({ status: 'live' })
      .catch((e) => e);

    expect(error).toMatchObject({ status: 429, retryAfterSeconds: 42 });
  });

  it('still reports the status when the error body is not JSON', async () => {
    fetchMock.mockResolvedValue(
      new Response('<html>bad gateway</html>', { status: 502 }),
    );
    const error = await createApiClient({ fetch: fetchMock })
      .getUsername()
      .catch((e) => e);

    expect(error).toMatchObject({
      status: 502,
      message: 'Request failed (502)',
    });
  });

  it('validates before sending, so bad data never reaches the server', async () => {
    const client = createApiClient({ fetch: fetchMock });

    await expect(
      client.saveResume({
        status: 'live',
        resumeData: { header: {} } as never,
      }),
    ).rejects.toBeInstanceOf(ResumeValidationError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts the username check as a query, and a claim as a body', async () => {
    fetchMock.mockResolvedValue(json({ available: true }));
    const client = createApiClient({ fetch: fetchMock });

    await client.checkUsername('a b&c');
    expect(lastCall(fetchMock).url).toBe(
      '/api/check-username?username=a+b%26c',
    );
    expect(lastCall(fetchMock).init.method).toBe('POST');

    fetchMock.mockResolvedValue(json({ success: true }));
    await client.claimProfile({ username: 'jane', displayName: 'Jane' });
    expect(lastCall(fetchMock, 1).url).toBe('/api/claim');
    expect(JSON.parse(lastCall(fetchMock, 1).init.body as string)).toEqual({
      username: 'jane',
      displayName: 'Jane',
    });
  });
});

describe('connected apps and account', () => {
  it('lists connected apps and disconnects one by id', async () => {
    const fetchMock = vi.fn<Fetch>();
    const app = {
      clientId: 'pfy_1',
      clientName: 'Claude',
      scopes: ['profile:read'],
      connectedAt: '2026-11-01T00:00:00Z',
      lastUsedAt: null,
    };
    fetchMock.mockResolvedValueOnce(json({ apps: [app] }));
    const client = createApiClient({ fetch: fetchMock });

    await expect(client.listConnectedApps()).resolves.toEqual([app]);
    expect(lastCall(fetchMock).url).toBe('/api/user/connected-apps');

    fetchMock.mockResolvedValueOnce(json({ success: true }));
    await client.disconnectApp('pfy_1');
    const { init } = lastCall(fetchMock, 1);
    expect(init.method).toBe('DELETE');
    expect(JSON.parse(init.body as string)).toEqual({ clientId: 'pfy_1' });
  });

  it('deletes the account with a DELETE and no body', async () => {
    const fetchMock = vi.fn<Fetch>();
    fetchMock.mockResolvedValue(json({ success: true }));

    await createApiClient({ fetch: fetchMock }).deleteAccount();

    const { url, init } = lastCall(fetchMock);
    expect(url).toBe('/api/user');
    expect(init.method).toBe('DELETE');
    expect(init.body).toBeUndefined();
  });
});

describe('saveResumeData', () => {
  beforeEach(() => {
    useResumeStore.setState({ resumeVersion: undefined });
  });

  it('sends the store version and stores the new one', async () => {
    useResumeStore.setState({ resumeVersion: 4 });
    const saveResume = vi.fn(async () => ({ version: 5 }));

    const saved = await saveResumeData({ saveResume } as never, validData, {
      status: 'draft',
    });

    expect(saveResume).toHaveBeenCalledWith({
      status: 'draft',
      resumeData: validData,
      version: 4,
    });
    expect(saved.version).toBe(5);
    expect(useResumeStore.getState().resumeVersion).toBe(5);
  });

  it('defaults to live and leaves the version alone when the save fails', async () => {
    useResumeStore.setState({ resumeVersion: 4 });
    const saveResume = vi.fn(async () => {
      throw new SaveConflictError('Changed elsewhere.');
    });

    await expect(
      saveResumeData({ saveResume } as never, validData),
    ).rejects.toBeInstanceOf(SaveConflictError);

    expect(saveResume).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'live', version: 4 }),
    );
    expect(useResumeStore.getState().resumeVersion).toBe(4);
  });
});

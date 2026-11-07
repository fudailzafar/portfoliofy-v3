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

describe('uploads and avatar', () => {
  const slot = {
    url: 'https://bucket.s3.eu-west-1.amazonaws.com/key?signature=abc',
    key: 'next-s3-uploads/u1/photo.jpg',
    bucket: 'bucket',
    region: 'eu-west-1',
  };

  it('asks for an upload address, then PUTs the file without the token', async () => {
    const fetchMock = vi.fn<Fetch>();
    fetchMock
      .mockResolvedValueOnce(json(slot))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    const client = createApiClient({
      getAccessToken: () => 'tok',
      fetch: fetchMock,
    });
    const file = new Blob(['x'], { type: 'image/jpeg' });

    const result = await client.uploadFile(file, {
      filename: 'photo.jpg',
      filetype: 'image/jpeg',
    });

    const request = lastCall(fetchMock, 0);
    expect(request.url).toBe('/api/s3-upload');
    expect(JSON.parse(request.init.body as string)).toEqual({
      filename: 'photo.jpg',
      filetype: 'image/jpeg',
      _nextS3: { strategy: 'presigned' },
    });
    expect((request.init.headers as Record<string, string>).Authorization).toBe(
      'Bearer tok',
    );

    const put = lastCall(fetchMock, 1);
    expect(put.url).toBe(slot.url);
    expect(put.init.method).toBe('PUT');
    expect(put.init.body).toBe(file);
    expect(put.init.headers).not.toHaveProperty('Authorization');
    expect((put.init.headers as Record<string, string>)['Content-Type']).toBe(
      'image/jpeg',
    );
    expect(result.url).toBe(
      'https://bucket.s3.eu-west-1.amazonaws.com/next-s3-uploads/u1/photo.jpg',
    );
  });

  it('uses a custom storage endpoint when the server names one', async () => {
    const fetchMock = vi.fn<Fetch>();
    fetchMock
      .mockResolvedValueOnce(
        json({ ...slot, endpoint: 'https://files.example.com' }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    const { url } = await createApiClient({ fetch: fetchMock }).uploadFile(
      new Blob(['x']),
      { filename: 'a.png', filetype: 'image/png' },
    );

    expect(url).toBe(
      'https://files.example.com/bucket/next-s3-uploads/u1/photo.jpg',
    );
  });

  it('stops with a readable error if storage refuses the file', async () => {
    const fetchMock = vi.fn<Fetch>();
    fetchMock
      .mockResolvedValueOnce(json(slot))
      .mockResolvedValueOnce(new Response('denied', { status: 403 }));

    const error = await createApiClient({ fetch: fetchMock })
      .uploadFile(new Blob(['x']), { filename: 'a.png', filetype: 'image/png' })
      .catch((e) => e);

    expect(error).toMatchObject({
      status: 403,
      message: 'Upload failed. Try again.',
    });
  });

  it('passes the server error for an unsupported type through', async () => {
    const fetchMock = vi.fn<Fetch>();
    fetchMock.mockResolvedValueOnce(
      json({ error: 'Unsupported file type' }, 400),
    );

    await expect(
      createApiClient({ fetch: fetchMock }).uploadFile(new Blob(['x']), {
        filename: 'a.exe',
        filetype: 'application/x-msdownload',
      }),
    ).rejects.toMatchObject({ status: 400, message: 'Unsupported file type' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reads the account, sets and clears the avatar', async () => {
    const fetchMock = vi.fn<Fetch>();
    const account = {
      username: 'jane',
      name: 'Jane',
      image: null,
      hasCustomImage: false,
      createdAt: '2026-11-01T00:00:00Z',
    };
    fetchMock.mockResolvedValueOnce(json({ account }));
    const client = createApiClient({ fetch: fetchMock });

    await expect(client.getAccount()).resolves.toEqual(account);

    fetchMock.mockResolvedValueOnce(json({ account: null }));
    await expect(client.getAccount()).resolves.toBeNull();

    fetchMock.mockResolvedValue(json({ success: true }));
    await client.setAvatar('https://bucket.s3.eu-west-1.amazonaws.com/a.png');
    expect(JSON.parse(lastCall(fetchMock, 2).init.body as string)).toEqual({
      url: 'https://bucket.s3.eu-west-1.amazonaws.com/a.png',
    });
    await client.removeAvatar();
    expect(lastCall(fetchMock, 3).init.method).toBe('DELETE');
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

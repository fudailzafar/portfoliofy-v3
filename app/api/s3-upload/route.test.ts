import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { authMock, configureMock, configuredHandlerMock } = vi.hoisted(() => {
  const configuredHandlerMock = vi.fn(
    async () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
  );
  return {
    authMock: vi.fn(),
    configureMock: vi.fn(
      (_opts: { key: (req: unknown, filename: string) => string | Promise<string> }) =>
        configuredHandlerMock,
    ),
    configuredHandlerMock,
  };
});

vi.mock('@/auth', () => ({ auth: authMock }));
vi.mock('next-s3-upload/route', () => ({
  POST: Object.assign(vi.fn(), { configure: configureMock }),
}));

import { POST } from './route';

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/s3-upload', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

describe('POST /api/s3-upload', () => {
  beforeEach(() => {
    authMock.mockReset();
    configureMock.mockClear();
    configuredHandlerMock.mockClear();
  });

  it('rejects unauthenticated requests without ever touching the upload handler', async () => {
    authMock.mockResolvedValueOnce(null);

    const res = await POST(makeRequest({ filename: 'a.png', filetype: 'image/png' }));

    expect(res.status).toBe(401);
    expect(configureMock).not.toHaveBeenCalled();
  });

  it('rejects a disallowed file type for an authenticated user', async () => {
    authMock.mockResolvedValueOnce({ user: { id: 'user-1' } });

    const res = await POST(
      makeRequest({ filename: 'a.exe', filetype: 'application/x-msdownload' }),
    );

    expect(res.status).toBe(400);
    expect(configureMock).not.toHaveBeenCalled();
  });

  it('allows every legitimate content type used elsewhere in the app', async () => {
    const legitimateTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'video/mp4',
      'video/quicktime',
      'application/pdf',
    ];

    for (const filetype of legitimateTypes) {
      authMock.mockResolvedValueOnce({ user: { id: 'user-1' } });
      const res = await POST(makeRequest({ filename: 'file', filetype }));
      expect(res.status).toBe(200);
    }
  });

  it('scopes the generated upload key to the authenticated user id', async () => {
    authMock.mockResolvedValueOnce({ user: { id: 'user-42' } });

    await POST(makeRequest({ filename: 'avatar.png', filetype: 'image/png' }));

    expect(configureMock).toHaveBeenCalledTimes(1);
    const { key } = configureMock.mock.calls[0][0];
    const generatedKey = await key({}, 'avatar.png');

    expect(generatedKey).toMatch(/^next-s3-uploads\/user-42\//);
    expect(configuredHandlerMock).toHaveBeenCalledTimes(1);
  });
});

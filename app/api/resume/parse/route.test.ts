import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { generateContentMock, authMock } = vi.hoisted(() => ({
  generateContentMock: vi.fn(),
  authMock: vi.fn(),
}));

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = { generateContent: generateContentMock };
  },
}));
vi.mock('@/auth', () => ({ auth: authMock }));
vi.mock('@/lib/server/rateLimit', () => ({
  checkRateLimit: async () => ({ allowed: true, retryAfterMs: 0 }),
}));

function pdfRequest() {
  const form = new FormData();
  form.append(
    'file',
    new File([new Uint8Array([37, 80, 68, 70])], 'resume.pdf', {
      type: 'application/pdf',
    }),
  );
  return new NextRequest('http://localhost/api/resume/parse', {
    method: 'POST',
    body: form,
  });
}

const apiError = (status: number) =>
  Object.assign(new Error(`Gemini ${status}`), { status });

const goodResponse = {
  text: JSON.stringify({ header: { name: 'Jane Doe' } }),
};

async function loadRoute() {
  vi.resetModules();
  return (await import('./route')).POST;
}

describe('POST /api/resume/parse', () => {
  beforeEach(() => {
    generateContentMock.mockReset();
    authMock.mockResolvedValue({ user: { id: 'u1' } });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('asks gemini-3.8-flash by default', async () => {
    generateContentMock.mockResolvedValue(goodResponse);
    const POST = await loadRoute();
    const res = await POST(pdfRequest());
    expect(res.status).toBe(200);
    expect(generateContentMock).toHaveBeenCalledTimes(1);
    expect(generateContentMock.mock.calls[0][0].model).toBe('gemini-3.8-flash');
  });

  it('uses GEMINI_MODEL when it is set', async () => {
    vi.stubEnv('GEMINI_MODEL', 'some-future-model');
    generateContentMock.mockResolvedValue(goodResponse);
    const POST = await loadRoute();
    await POST(pdfRequest());
    expect(generateContentMock.mock.calls[0][0].model).toBe(
      'some-future-model',
    );
  });

  it('retries a 503 and then succeeds', async () => {
    vi.useFakeTimers();
    generateContentMock
      .mockRejectedValueOnce(apiError(503))
      .mockRejectedValueOnce(apiError(503))
      .mockResolvedValueOnce(goodResponse);
    const POST = await loadRoute();
    const pending = POST(pdfRequest());
    await vi.advanceTimersByTimeAsync(10_000);
    const res = await pending;
    expect(res.status).toBe(200);
    expect(generateContentMock).toHaveBeenCalledTimes(3);
  });

  it('says the reader is busy after three 503s', async () => {
    vi.useFakeTimers();
    generateContentMock.mockRejectedValue(apiError(503));
    const POST = await loadRoute();
    const pending = POST(pdfRequest());
    await vi.advanceTimersByTimeAsync(10_000);
    const res = await pending;
    expect(res.status).toBe(503);
    expect((await res.json()).error).toMatch(/busy/i);
    expect(generateContentMock).toHaveBeenCalledTimes(3);
  });

  it('does not retry other errors (bad key, retired model)', async () => {
    generateContentMock.mockRejectedValue(apiError(404));
    const POST = await loadRoute();
    const res = await POST(pdfRequest());
    expect(res.status).toBe(500);
    expect(generateContentMock).toHaveBeenCalledTimes(1);
  });

  it('logs the error message, not just an object', async () => {
    generateContentMock.mockRejectedValue(apiError(400));
    const POST = await loadRoute();
    await POST(pdfRequest());
    const logged = (console.error as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(logged).toContain('Gemini 400');
    expect(logged).toContain(400);
  });
});

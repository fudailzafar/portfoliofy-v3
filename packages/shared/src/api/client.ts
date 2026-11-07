// A small typed client for the Portfoliofy API. The website uses it with its
// session cookie; the mobile app passes a token getter instead. Nothing here
// depends on the browser or on React Native.

import { Resume, ResumeDataSchema } from '../resume';
import { ApiError, ResumeValidationError, SaveConflictError } from './errors';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export interface ApiClientOptions {
  /** Where the API lives. Leave empty on the website to use the same origin. */
  baseUrl?: string;
  /** The access token to send, if any. Called before every request. */
  getAccessToken?: () => Promise<string | null> | string | null;
  /**
   * Called once when a request that sent a token comes back 401. Return true
   * after getting a new token, and the request is tried once more.
   */
  refreshAccessToken?: () => Promise<boolean>;
  fetch?: FetchLike;
}

/** The signed-in user's account, separate from the profile's content. */
export interface Account {
  username: string;
  name: string | null;
  /** The profile picture: one they uploaded, else the one from Google. */
  image: string | null;
  hasCustomImage: boolean;
  createdAt: string;
}

/** An app connected to the profile, as the server sends it (dates as strings). */
export interface ConnectedApp {
  clientId: string;
  clientName: string;
  scopes: string[];
  connectedAt: string;
  lastUsedAt: string | null;
}

/** The one-off upload address the server hands out for a file. */
interface UploadSlot {
  url: string;
  key: string;
  bucket: string;
  region: string;
  endpoint?: string;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  query?: Record<string, string>;
  body?: unknown;
}

function messageFrom(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'error' in body) {
    const { error } = body as { error: unknown };
    if (typeof error === 'string' && error) return error;
  }
  return fallback;
}

export function createApiClient(options: ApiClientOptions = {}) {
  const baseUrl = (options.baseUrl ?? '').replace(/\/+$/, '');
  const doFetch: FetchLike =
    options.fetch ?? ((input, init) => globalThis.fetch(input, init));

  async function send(path: string, request: RequestOptions) {
    const query = request.query
      ? `?${new URLSearchParams(request.query).toString()}`
      : '';
    const token = (await options.getAccessToken?.()) ?? null;
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (request.body !== undefined)
      headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await doFetch(`${baseUrl}${path}${query}`, {
      method: request.method ?? 'GET',
      headers,
      body:
        request.body === undefined ? undefined : JSON.stringify(request.body),
    });
    return { response, sentToken: token !== null };
  }

  async function request<T>(
    path: string,
    req: RequestOptions = {},
  ): Promise<T> {
    let { response, sentToken } = await send(path, req);

    if (response.status === 401 && sentToken && options.refreshAccessToken) {
      if (await options.refreshAccessToken()) {
        ({ response } = await send(path, req));
      }
    }

    // An error page or an empty body is not JSON; don't let that hide the status.
    const body: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const message = messageFrom(body, `Request failed (${response.status})`);
      if (response.status === 409) throw new SaveConflictError(message);
      const retryAfter = Number(response.headers.get('Retry-After'));
      throw new ApiError(
        message,
        response.status,
        Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined,
      );
    }
    return body as T;
  }

  return {
    /** The signed-in user's profile, or undefined if they haven't made one. */
    async getResume(): Promise<Resume | undefined> {
      const { resume } = await request<{ resume?: Resume }>('/api/resume');
      return resume;
    },

    /**
     * Saves the profile and returns its new version. Throws SaveConflictError
     * if `resume.version` is no longer the stored one, and
     * ResumeValidationError, without calling the server, if the data is invalid.
     */
    async saveResume(resume: Resume): Promise<{ version: number }> {
      if (resume.resumeData) {
        const parsed = ResumeDataSchema.safeParse(resume.resumeData);
        if (!parsed.success) {
          throw new ResumeValidationError(parsed.error.message);
        }
      }
      return request<{ version: number }>('/api/resume', {
        method: 'POST',
        body: resume,
      });
    },

    async getUsername(): Promise<string | null> {
      const { username } = await request<{ username?: string | null }>(
        '/api/username',
      );
      return username ?? null;
    },

    async checkUsername(username: string): Promise<{ available: boolean }> {
      return request('/api/check-username', {
        method: 'POST',
        query: { username },
      });
    },

    async setUsername(username: string): Promise<void> {
      await request('/api/username', { method: 'POST', body: { username } });
    },

    /** Picks a username for a user who has no profile yet. */
    async claimProfile(input: {
      username: string;
      displayName: string;
    }): Promise<void> {
      await request('/api/claim', { method: 'POST', body: input });
    },

    /** The account's details, or null before a profile has been created. */
    async getAccount(): Promise<Account | null> {
      const { account } = await request<{ account: Account | null }>(
        '/api/user',
      );
      return account;
    },

    /** Makes an uploaded image (see uploadFile) the profile picture. */
    async setAvatar(url: string): Promise<void> {
      await request('/api/user/avatar', { method: 'POST', body: { url } });
    },

    /** Goes back to the picture from the Google account. */
    async removeAvatar(): Promise<void> {
      await request('/api/user/avatar', { method: 'DELETE' });
    },

    /**
     * Uploads a file straight to storage and returns where it now lives. The
     * server only hands out a one-off upload address; the file never passes
     * through it, so large photos and videos are fine.
     */
    async uploadFile(
      file: Blob,
      { filename, filetype }: { filename: string; filetype: string },
    ): Promise<{ url: string }> {
      const slot = await request<UploadSlot>('/api/s3-upload', {
        method: 'POST',
        body: { filename, filetype, _nextS3: { strategy: 'presigned' } },
      });
      if (!slot.url || !slot.key) throw new ApiError('Upload failed', 500);

      // Storage, not our API: no sign-in token goes with this request.
      const response = await doFetch(slot.url, {
        method: 'PUT',
        headers: {
          'Content-Type': filetype,
          'Cache-Control': 'max-age=630720000',
        },
        body: file,
      });
      if (!response.ok) {
        throw new ApiError('Upload failed. Try again.', response.status);
      }

      return {
        url: slot.endpoint
          ? `${slot.endpoint}/${slot.bucket}/${slot.key}`
          : `https://${slot.bucket}.s3.${slot.region}.amazonaws.com/${slot.key}`,
      };
    },

    async deleteAccount(): Promise<void> {
      await request('/api/user', { method: 'DELETE' });
    },

    /** Apps, such as AI assistants, that can act on this profile. */
    async listConnectedApps(): Promise<ConnectedApp[]> {
      const { apps } = await request<{ apps: ConnectedApp[] }>(
        '/api/user/connected-apps',
      );
      return apps;
    },

    /** Cuts an app off at once. */
    async disconnectApp(clientId: string): Promise<void> {
      await request('/api/user/connected-apps', {
        method: 'DELETE',
        body: { clientId },
      });
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

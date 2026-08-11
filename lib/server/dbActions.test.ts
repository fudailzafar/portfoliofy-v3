import { describe, it, expect, beforeEach, vi } from 'vitest';

// sql is called as a tagged template: sql`UPDATE ... ${x}`, which is just a
// function call under the hood — a plain vi.fn() works as the mock.
const { sqlMock } = vi.hoisted(() => ({ sqlMock: vi.fn() }));
vi.mock('@/lib/server/db', () => ({ default: sqlMock }));

import { setCustomDomain } from './dbActions';

describe('setCustomDomain', () => {
  beforeEach(() => {
    sqlMock.mockReset();
  });

  it('returns success on a clean write', async () => {
    sqlMock.mockResolvedValueOnce(undefined);

    const result = await setCustomDomain('user-1', 'example.com');

    expect(result).toEqual({ success: true });
  });

  it('classifies a unique-constraint violation as "taken", not a generic error', async () => {
    // The exact shape Postgres throws when users.custom_domain's UNIQUE
    // constraint (users_custom_domain_key) rejects a write — verified
    // directly against the live DB in a rolled-back transaction.
    const conflict = Object.assign(
      new Error(
        'duplicate key value violates unique constraint "users_custom_domain_key"',
      ),
      { code: '23505' },
    );
    sqlMock.mockRejectedValueOnce(conflict);

    const result = await setCustomDomain('user-2', 'already-owned.com');

    expect(result).toEqual({ success: false, reason: 'taken' });
  });

  it('classifies any other DB failure as a generic error, not "taken"', async () => {
    const dbDown = Object.assign(new Error('connection refused'), {
      code: 'ECONNREFUSED',
    });
    sqlMock.mockRejectedValueOnce(dbDown);

    const result = await setCustomDomain('user-3', 'example.com');

    expect(result).toEqual({ success: false, reason: 'error' });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';

// sql is called as a tagged template: sql`UPDATE ... ${x}`, which is just a
// function call under the hood — a plain vi.fn() works as the mock.
const { sqlMock } = vi.hoisted(() => ({ sqlMock: vi.fn() }));
vi.mock('@/lib/server/db', () => ({ default: sqlMock }));

import {
  setCustomDomain,
  createUsernameLookup,
  checkUsernameAvailability,
  updateUsername,
} from './dbActions';

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

describe('username validation', () => {
  beforeEach(() => {
    sqlMock.mockReset();
  });

  describe('createUsernameLookup', () => {
    it('rejects an invalid format without touching the DB', async () => {
      const result = await createUsernameLookup({
        userId: 'user-1',
        username: 'a', // too short
      });

      expect(result).toBe(false);
      expect(sqlMock).not.toHaveBeenCalled();
    });

    it('rejects a reserved word (case-insensitively) without touching the DB', async () => {
      const result = await createUsernameLookup({
        userId: 'user-1',
        username: 'FAQ',
      });

      expect(result).toBe(false);
      expect(sqlMock).not.toHaveBeenCalled();
    });

    it('normalizes to lowercase before insert, so "Bob" and "bob" cannot both be claimed', async () => {
      sqlMock.mockResolvedValueOnce(undefined);

      await createUsernameLookup({ userId: 'user-1', username: 'Bob' });

      // The tagged-template call receives (strings, userId, username, ...) —
      // find whichever positional arg holds the value actually written.
      const insertedValues = sqlMock.mock.calls[0].slice(1);
      expect(insertedValues).toContain('bob');
      expect(insertedValues).not.toContain('Bob');
    });
  });

  describe('checkUsernameAvailability', () => {
    it('reports an invalid format as unavailable without querying the DB', async () => {
      const result = await checkUsernameAvailability('has spaces');

      expect(result).toEqual({ available: false });
      expect(sqlMock).not.toHaveBeenCalled();
    });

    it('reports a reserved word as unavailable', async () => {
      const result = await checkUsernameAvailability('explore');

      expect(result).toEqual({ available: false });
      expect(sqlMock).not.toHaveBeenCalled();
    });

    it('checks availability case-insensitively', async () => {
      sqlMock.mockResolvedValueOnce([{ id: 'existing-user' }]);

      const result = await checkUsernameAvailability('BOB');

      expect(result).toEqual({ available: false });
      const queriedValues = sqlMock.mock.calls[0].slice(1);
      expect(queriedValues).toContain('bob');
    });
  });

  describe('updateUsername', () => {
    it('rejects an invalid format with reason "invalid"', async () => {
      const result = await updateUsername('user-1', 'no way');

      expect(result).toEqual({ success: false, reason: 'invalid' });
      expect(sqlMock).not.toHaveBeenCalled();
    });

    it('rejects a reserved word with reason "reserved", not a misleading "taken"', async () => {
      const result = await updateUsername('user-1', 'www');

      expect(result).toEqual({ success: false, reason: 'reserved' });
      expect(sqlMock).not.toHaveBeenCalled();
    });

    it('classifies a unique-constraint violation as "taken"', async () => {
      const conflict = Object.assign(
        new Error(
          'duplicate key value violates unique constraint "users_username_key"',
        ),
        { code: '23505' },
      );
      sqlMock.mockRejectedValueOnce(conflict);

      const result = await updateUsername('user-1', 'takenname');

      expect(result).toEqual({ success: false, reason: 'taken' });
    });

    it('succeeds and normalizes to lowercase on a clean update', async () => {
      sqlMock.mockResolvedValueOnce({ count: 1 });

      const result = await updateUsername('user-1', 'NewName');

      expect(result).toEqual({ success: true });
      const updatedValues = sqlMock.mock.calls[0].slice(1);
      expect(updatedValues).toContain('newname');
      expect(updatedValues).not.toContain('NewName');
    });
  });
});

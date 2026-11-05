import { describe, it, expect, beforeEach, vi } from 'vitest';

const { sqlMock } = vi.hoisted(() => ({ sqlMock: vi.fn() }));
vi.mock('@/lib/server/db', () => ({ default: sqlMock }));

import {
  consumeLoginToken,
  createLoginToken,
  isValidEmail,
  normalizeEmail,
  resolveEmailUserId,
} from './emailAuth';

describe('email helpers', () => {
  it('normalizes case and surrounding spaces', () => {
    expect(normalizeEmail('  Jane@Example.COM ')).toBe('jane@example.com');
  });

  it('accepts ordinary addresses and rejects malformed ones', () => {
    expect(isValidEmail('jane@example.com')).toBe(true);
    expect(isValidEmail('jane+tag@sub.example.co')).toBe(true);
    expect(isValidEmail('jane@example')).toBe(false);
    expect(isValidEmail('jane example@x.com')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail(`${'a'.repeat(250)}@x.com`)).toBe(false);
  });
});

describe('createLoginToken', () => {
  beforeEach(() => sqlMock.mockReset());

  it('stores only a hash, never the token that goes in the email', async () => {
    sqlMock.mockResolvedValue([]);

    const token = await createLoginToken('jane@example.com');

    const insertArgs = sqlMock.mock.calls[0];
    const stored = insertArgs.slice(1);
    expect(stored).not.toContain(token);
    expect(stored[0]).toMatch(/^[0-9a-f]{64}$/);
    expect(stored[1]).toBe('jane@example.com');
    expect(token.length).toBeGreaterThanOrEqual(43);
  });

  it('gives a different token every time', async () => {
    sqlMock.mockResolvedValue([]);

    const a = await createLoginToken('jane@example.com');
    const b = await createLoginToken('jane@example.com');

    expect(a).not.toBe(b);
  });
});

describe('consumeLoginToken', () => {
  beforeEach(() => sqlMock.mockReset());

  it('returns the email for a valid token', async () => {
    sqlMock.mockResolvedValueOnce([{ email: 'jane@example.com' }]);

    expect(await consumeLoginToken('abc')).toBe('jane@example.com');
  });

  it('returns null when nothing matched (unknown, expired or already used)', async () => {
    sqlMock.mockResolvedValueOnce([]);

    expect(await consumeLoginToken('abc')).toBeNull();
  });

  it('does not touch the database for an empty token', async () => {
    expect(await consumeLoginToken('')).toBeNull();
    expect(sqlMock).not.toHaveBeenCalled();
  });
});

describe('resolveEmailUserId', () => {
  beforeEach(() => sqlMock.mockReset());

  it('reuses the id of an existing account with that email', async () => {
    sqlMock.mockResolvedValueOnce([{ id: '1234567890' }]);

    expect(await resolveEmailUserId('jane@example.com')).toBe('1234567890');
  });

  it('derives the same id every time for a new email', async () => {
    sqlMock.mockResolvedValue([]);

    const first = await resolveEmailUserId('new@example.com');
    const second = await resolveEmailUserId('new@example.com');
    const other = await resolveEmailUserId('other@example.com');

    expect(first).toMatch(/^email_[0-9a-f]{32}$/);
    expect(second).toBe(first);
    expect(other).not.toBe(first);
  });
});

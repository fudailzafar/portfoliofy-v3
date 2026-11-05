import { describe, expect, it } from 'vitest';
import { isValidEmail } from './email';

describe('isValidEmail', () => {
  it.each(['name@example.com', 'a.b+c@mail.co.in', ' name@example.com '])(
    'accepts %s',
    (email) => {
      expect(isValidEmail(email)).toBe(true);
    },
  );

  it.each(['', 'name', 'name@', 'name@example', 'name@example.c', 'a b@c.com'])(
    'rejects "%s"',
    (email) => {
      expect(isValidEmail(email)).toBe(false);
    },
  );
});

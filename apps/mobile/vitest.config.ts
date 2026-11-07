import path from 'node:path';
import { defineConfig } from 'vitest/config';

// Only logic that doesn't touch the native side is tested here; the native
// modules it calls (secure storage, the auth session helpers) are replaced.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'miniflare',
    // Configuration is automatically loaded from `.env`, `package.json` and
    // `wrangler.toml` files by default, but you can pass any additional Miniflare
    // API options here:
    environmentOptions: {
      bindings: {},
      kvNamespaces: ['TEST_NAMESPACE'],
    },
    coverage: {
      include: ['src'],
      exclude: ['test', 'src/**/*.test.ts', 'src/**/*.spec.ts'],
      provider: process.env.CI ? 'c8' : undefined,
      reporter: process.env.CI ? ['text', 'json', 'html', 'lcov'] : undefined,
    },
  },
});

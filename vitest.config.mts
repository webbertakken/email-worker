import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import { defineProject } from 'vitest/config';

// Tests run inside the Cloudflare Workers runtime (workerd) via
// `@cloudflare/vitest-pool-workers`. This replaces the old
// `vitest-environment-miniflare` (miniflare 2.x) setup, which is no longer
// maintained.
//
// Bindings (e.g. KV namespaces, secrets) are picked up from `wrangler.toml`.
// The handler under test is a Cloudflare Email Worker; the tests construct
// `ForwardableEmailMessage` fixtures directly and intercept outbound `fetch`
// to Discord with `vi.spyOn(globalThis, 'fetch')`.
export default defineProject({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: './wrangler.toml' },
    }),
  ],
  test: {
    coverage: {
      // workerd lacks `node:inspector/promises` so v8 coverage can't run
      // inside the Workers pool. Istanbul instruments at transform time.
      provider: 'istanbul',
      reporter: ['text', 'html', 'lcov', 'clover'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/index.ts'],
    },
  },
});

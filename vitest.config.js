import { defineConfig } from 'vitest/config';
// import { defineWebWorkers } from '@vitest/web-worker/pure';

// defineWebWorkers({ clone: 'none' });

export default defineConfig({
  test: {
    setupFiles: ['@vitest/web-worker'],
  },
});

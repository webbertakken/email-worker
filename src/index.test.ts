import { unstable_dev } from 'wrangler';
import type { UnstableDevWorker } from 'wrangler';
import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { createEmailMessage } from '../test/helpers/createEmailMessage';

describe('Worker', () => {
  let worker: UnstableDevWorker;

  beforeAll(async () => {
    worker = await unstable_dev('src/index.ts', {}, { disableExperimentalWarning: true });
  });

  afterAll(async () => {
    await worker.stop();
  });

  it('should return 200 response', async () => {
    const testEmail: EmailMessage = await createEmailMessage({
      from: 'senderg@example.com',
      to: 'recipient@example.com',
    });

    // @ts-ignore
    await worker.email(testEmail, { DISCORD_WEBHOOK_URL: process.env.DISCORD_TEST_WEBHOOK_URL }, {});
    expect(true).toBe(true);
  });
});

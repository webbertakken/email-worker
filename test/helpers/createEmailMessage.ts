import '@vitest/web-worker';
import { createHeaders } from './createHeaders';
import { vi } from 'vitest';

interface Props {
  from?: string;
  to?: string;
  subject?: string;
  body?: string;
  headers?: Record<string, string>;
}

export const createEmailMessage = async ({
  from = '',
  to = '',
  subject = '',
  body = '',
  headers = {},
}: Props): Promise<EmailMessage> => {
  let { readable, writable } = new TransformStream();

  const blob = new Blob([body]);
  await writable.getWriter().write(blob);

  return {
    from,
    to,
    headers: createHeaders({ ...headers, subject }),
    raw: readable,
    rawSize: blob.size,
    setReject: vi.fn().mockImplementation((reason: string) => {}),
    forward: vi.fn().mockImplementation((rcptTo: string, headers?: Headers) => Promise.resolve()),
  } as EmailMessage;
};

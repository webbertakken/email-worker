import { EmailExportedHandler } from '@cloudflare/workers-types';
import { splitMessage, SUBJECT_MAX_LENGTH } from './splitMessage';

// Email trigger
export const email: EmailExportedHandler = async (message, env, ctx) => {
  const url = env.DISCORD_WEBHOOK_URL;

  const { from, to } = message;
  const subject = message.headers.get('subject')?.substring(0, SUBJECT_MAX_LENGTH) || '(no subject)';
  const rawBody = await new Response(message.raw).text();
  const [body = '(empty body)', ...rest] = splitMessage(rawBody);

  const chunks = [`Email from ${from} to ${to} with subject "${subject}":\n\n${body}`, ...rest];
  for (const content of chunks) {
    const data = { content };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.log('Failed to post message to Discord webhook');
      console.log(await response.json());
      throw new Error('Failed to post message to Discord webhook');
    }
  }
};

export default { email };

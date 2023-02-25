import PostalMime from 'postal-mime';
import { EmailExportedHandler } from '@cloudflare/workers-types';
import { splitMessageEllipsis } from './splitMessage';

const DISC_MAX_LEN = 2000;

export const email: EmailExportedHandler = async (message, env, ctx): Promise<void> => {
  // @ts-ignore
  const url = env.DISCORD_WEBHOOK_URL;

  // Get the email message
  const { from, to } = message;
  const subject = message.headers.get('subject') || '(no subject)';
  const rawBody = await new Response(message.raw).arrayBuffer();
  const parser = await new PostalMime();
  const email = await parser.parse(rawBody);

  // Discord message
  const intro = `Email from ${from} to ${to} with subject "${subject}":\n\n`;
  const [body = '(empty body)', ...rest] = splitMessageEllipsis(email.text!, DISC_MAX_LEN, DISC_MAX_LEN - intro.length);
  const discordMessage = [`${intro}${body}`, ...rest];
  for (const part of discordMessage) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: part }),
    });

    if (!response.ok) throw new Error('Failed to post message to Discord webhook.' + (await response.json()));
  }
};

export default { email };

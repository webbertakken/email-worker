import { extract as parseRawEmail } from 'letterparser';
import { splitEllipsis } from './splitMessage';

const DISC_MAX_LEN = 2000;

export async function email(message: any, env: any, ctx?: any): Promise<void> {
  const url = env.DISCORD_WEBHOOK_URL;
  if (!url) throw new Error('Missing DISCORD_WEBHOOK_URL');

  try {
    // Parse email
    const { from, to } = message;
    const subject = message.headers.get('subject') || '(no subject)';
    // BugFix: Replace "UTF-8" with "utf-8" to prevent letterparser from throwing an error for some messages.
    const rawEmail = (await new Response(message.raw).text()).replace(/utf-8/gi, 'utf-8');
    const email = parseRawEmail(rawEmail);

    // Send discord message
    const intro = `Email from ${from} to ${to} with subject "${subject}":\n\n`;
    const [body = '(empty body)', ...rest] = splitEllipsis(email.text!, DISC_MAX_LEN, DISC_MAX_LEN - intro.length);
    const discordMessage = [`${intro}${body}`, ...rest];
    for (const part of discordMessage) {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: part }),
      });
      if (!response.ok) throw new Error('Failed to post message to Discord webhook.' + (await response.json()));
    }
  } catch (error: any) {
    // Report any parsing errors to Discord as well
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: error.stack }),
    });

    if (!response.ok) throw new Error('Failed to post error to Discord webhook.' + (await response.json()));
  }
}

export default { email };

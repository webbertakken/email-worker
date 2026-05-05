import { extract as parseRawEmail } from 'letterparser';
import { splitEllipsis } from './splitMessage';

const DISC_MAX_LEN = 2000;

// Cloudflare Email Workers entry point. The `message` and `env` types depend
// on the worker's wrangler bindings, which are project-specific; using `any`
// here keeps the handler portable and matches the Workers runtime contract.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function email(message: any, env: any, _ctx?: any): Promise<void> {
  const url = env.DISCORD_WEBHOOK_URL;
  if (!url) throw new Error('Missing DISCORD_WEBHOOK_URL');

  try {
    // Parse email
    const { from, to } = message;
    const subject = message.headers.get('subject') || '(no subject)';
    // BugFix: Replace "UTF-8" with "utf-8" to prevent letterparser from throwing an error for some messages.
    const rawEmail = (await new Response(message.raw).text()).replace(/utf-8/gi, 'utf-8');
    const parsed = parseRawEmail(rawEmail);

    // Send discord message. Posts must be sequential to preserve message order in Discord.
    const intro = `Email from ${from} to ${to} with subject "${subject}":\n\n`;
    const [body = '(empty body)', ...rest] = splitEllipsis(parsed.text!, DISC_MAX_LEN, DISC_MAX_LEN - intro.length);
    const discordMessage = [`${intro}${body}`, ...rest];
    for (const part of discordMessage) {
      // eslint-disable-next-line no-await-in-loop -- ordered delivery; cannot parallelise
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: part }),
      });
      if (!response.ok) {
        // eslint-disable-next-line no-await-in-loop -- ordered delivery; cannot parallelise
        const detail = await response.json();
        throw new Error('Failed to post message to Discord webhook.' + detail);
      }
    }
  } catch (error: unknown) {
    // Report any parsing errors to Discord as well
    const stack = error instanceof Error ? error.stack : String(error);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: stack }),
    });

    if (!response.ok) {
      const detail = await response.json();
      throw new Error('Failed to post error to Discord webhook.' + detail, { cause: error });
    }
  }
}

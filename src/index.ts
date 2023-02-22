// Constants
const DISCORD_MAX_LENGTH = 2000
const EMAIL_ADDRESS_MAX_LENGTH = 320
const SUBJECT_MAX_LENGTH = 100
const MESSAGE_LIMIT = DISCORD_MAX_LENGTH - EMAIL_ADDRESS_MAX_LENGTH - SUBJECT_MAX_LENGTH - 5

// Email trigger
export default {
  async email(message, env, ctx) {
    const url = env.DISCORD_WEBHOOK_URL;

    const { from, to } = message;
    const subject = message.headers.get('subject')?.substring(0, SUBJECT_MAX_LENGTH) || '(no subject)'

    let rawEmail = new Response(message.raw)
    let fullBody = await rawEmail.text()
    const [body = '(empty body)', ...rest] = splitMessage(fullBody)

    const chunks = [`Email from ${from} to ${to} with subject "${subject}":\n\n${body}`, ...rest]
    for (const content of chunks) {
      const data = { content }
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        console.log('Failed to post message to Discord webhook');
        console.log(await response.json())
        throw new Error('Failed to post message to Discord webhook');
      }
    }
  }
}

// Max message size must account for ellipsis and level parts that are added to the message.
const splitMessage = (message, maxMessageSize = MESSAGE_LIMIT) => {
  const numberOfMessages = Math.ceil(message.length / maxMessageSize);
  const messages = new Array(numberOfMessages);

  for (let i = 0, pointer = 0; i < numberOfMessages; i++) {
    let messageSize = maxMessageSize;

    let prefix = '';
    if (i !== 0) {
      prefix = '...';
      messageSize -= 3;
    }

    let suffix = '';
    if (i !== numberOfMessages - 1) {
      suffix = '...';
      messageSize -= 3;
    }

    // Break at spaces
    let maxMessage = message.substr(pointer, messageSize);
    const lastSpacePos = maxMessage.lastIndexOf(' ');
    if (lastSpacePos >= maxMessageSize - 250) {
      maxMessage = maxMessage.substr(pointer, lastSpacePos);
      messageSize = lastSpacePos;
    }

    messages[i] = `${prefix}${maxMessage}${suffix}`;
    pointer += messageSize;
  }

  return messages;
}

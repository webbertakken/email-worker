// Constants
export const DISCORD_MAX_LENGTH = 2000;
export const EMAIL_ADDRESS_MAX_LENGTH = 320;
export const SUBJECT_MAX_LENGTH = 100;
export const MESSAGE_LIMIT = DISCORD_MAX_LENGTH - EMAIL_ADDRESS_MAX_LENGTH - SUBJECT_MAX_LENGTH - 5;

// Max message size must account for ellipsis and level parts that are added to the message.
export const splitMessage = (message: string, maxMessageSize: number = MESSAGE_LIMIT) => {
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
};

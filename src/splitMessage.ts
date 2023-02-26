const CHUNK_MAX_LENGTH = 2000;

export function splitEllipsis(
  message: string,
  chunkMaxLength: number = CHUNK_MAX_LENGTH,
  firstChunkMaxLength?: number,
): string[] {
  if (typeof firstChunkMaxLength === 'undefined') firstChunkMaxLength = chunkMaxLength;

  const separator = '[SEPARATOR]';

  return splitMessage(message, chunkMaxLength - 6, firstChunkMaxLength - 3)
    .join(`...${separator}...`)
    .split(`${separator}`);
}

export function splitMessage(
  message: string,
  chunkMaxLength: number = CHUNK_MAX_LENGTH,
  firstChunkMaxLength?: number,
): string[] {
  if (typeof firstChunkMaxLength === 'undefined') firstChunkMaxLength = chunkMaxLength;
  if (message.length <= firstChunkMaxLength) return [message];

  const chunks: string[] = [];

  let startIndex = 0;
  let remainingLength = message.length;
  while (remainingLength > 0) {
    // Chunk length
    let chunkLength = chunks.length === 0 ? firstChunkMaxLength : chunkMaxLength;
    chunkLength = Math.min(chunkLength, remainingLength);

    // Select substring
    let endIndex = startIndex + chunkLength;
    let preChunk: string = message.substring(startIndex, endIndex);
    let next: string = message.charAt(endIndex) || ' ';

    // Determine exact chunk and its length
    let chunk: string;
    const lastSpacePos = preChunk.lastIndexOf(' ');

    if (next === ' ') {
      chunk = preChunk.trim();
      chunkLength = preChunk.length + 1;
    } else if (lastSpacePos === 0) {
      remainingLength -= 1;
      startIndex += 1;
      continue;
    } else if (lastSpacePos === -1) {
      chunk = preChunk.trim();
      chunkLength = preChunk.length;
    } else {
      chunk = preChunk.substring(0, lastSpacePos);
      chunkLength = chunk.length + 1;
      chunk = chunk.trimEnd();
    }

    if (chunk.length === 0) {
      startIndex += chunkLength;
      remainingLength -= chunkLength;
      continue;
    }

    chunks.push(chunk);
    remainingLength -= chunkLength;
    startIndex += chunkLength;
  }

  return chunks;
}

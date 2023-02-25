import { describe, expect, it } from 'vitest';

import { splitMessage, splitMessageEllipsis } from './splitMessage';

describe('splitMessage', () => {
  it('does not split short messages', () => {
    const message = 'This is a short message.';
    const result = splitMessage(message, message.length);
    expect(result).toEqual([message]);
  });

  it("splits a message that doesn't contain spaces", () => {
    const chunkMaxLength = 4;
    const message = 'abcde';
    const result = splitMessage(message, chunkMaxLength);
    expect(result).toEqual(['abcd', 'e']);
  });

  it('splits accurate to the letter', () => {
    const chunkMaxLength = 4;
    const message = 'abcde fghi j k lmno pqrstu vwxyz';
    const result = splitMessage(message, chunkMaxLength);
    expect(result).toEqual(['abcd', 'e', 'fghi', 'j k', 'lmno', 'pqrs', 'tu', 'vwxy', 'z']);
  });

  it('gracefully handles multi space strings', () => {
    const chunkMaxLength = 4;
    const message = 'aaaa  bbbb';
    const result = splitMessage(message, chunkMaxLength);
    expect(result).toEqual(['aaaa', 'bbbb']);
  });

  it('gracefully handles spaces the same size as the max chunk size', () => {
    const chunkMaxLength = 4;
    const message = 'aaaa    bbbb';
    const result = splitMessage(message, chunkMaxLength);
    expect(result).toEqual(['aaaa', 'bbbb']);
  });

  it('gracefully handles tons of spaces', () => {
    const chunkMaxLength = 4;
    const message = 'aaaa          bbbb';
    const result = splitMessage(message, chunkMaxLength);
    expect(result).toEqual(['aaaa', 'bbbb']);
  });

  it('trims always trims all spaces', () => {
    const chunkMaxLength = 4;
    const message = 'aa  bb   cc   d';
    const result = splitMessage(message, chunkMaxLength);
    expect(result).toEqual(['aa', 'bb', 'cc', 'd']);
  });

  it('handles an empty string', () => {
    const chunkMaxLength = 4;
    const message = '';
    const result = splitMessage(message, chunkMaxLength);
    expect(result).toEqual(['']);
  });
});

describe('splitMessageEllipsis', () => {
  it('adds leading ellipsis to all but the first chunk', () => {
    const message = 'This is a long message that will be split into multiple chunks.';
    const result = splitMessageEllipsis(message.repeat(1000));
    for (let i = 1; i < result.length; i++) {
      expect(result[i].startsWith('...')).toBe(true);
    }
  });

  // Adds trailing ellipsis to all but the last chunk
  it('adds trailing ellipsis to all but the last chunk', () => {
    const message = 'This is a long message that will be split into multiple chunks.';
    const result = splitMessageEllipsis(message.repeat(1000));
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].endsWith('...')).toBe(true);
    }
  });

  it('does not add trailing ellipsis to the last chunk', () => {
    const message = 'This is a long message that will be split into multiple chunks.';
    const result = splitMessageEllipsis(message);
    const lastChunk = result[result.length - 1];
    expect(lastChunk.endsWith('...')).toBe(false);
  });

  it('does not add leading ellipsis to the first chunk', () => {
    const message = 'This is a long message that will be split into multiple chunks.';
    const result = splitMessageEllipsis(message);
    const firstChunk = result[0];
    expect(firstChunk.startsWith('...')).toBe(false);
  });

  it('never has a space between ellipsis and the chunk itself', () => {
    const message = 'This is a long message that will be split into multiple chunks.';
    const result = splitMessageEllipsis(message.repeat(1000));
    for (let i = 0; i < result.length; i++) {
      expect(result[i].match(/^\.{3}\s/)).toBeNull();
      expect(result[i].match(/\s\.{3}$/)).toBeNull();
    }
  });

  it('does no exceed the max chunk length', () => {
    const maxChunkLength = 179;
    const message = 'This is a long message that will be split into multiple chunks.';
    const result = splitMessageEllipsis(message.repeat(1000), maxChunkLength);
    for (let i = 0; i < result.length; i++) {
      expect(result[i].length).toBeLessThanOrEqual(maxChunkLength);
    }
  });

  it('handles an empty string', () => {
    const result = splitMessageEllipsis('');
    expect(result).toEqual(['']);
  });
});

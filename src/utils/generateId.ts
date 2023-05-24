/**
 * Default alphabet for generating an ID. This is currently just both cases of
 * alphanumeric characters but is done this way on the chance it's later
 * decided to remove similar looking letters. (For example, 1/l/I, 0/O.)
 */
const DEFAULT_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Generate a user ID - a 12 character string.
 */
export const generateId = (): string => {
  const result: string[] = [];
  for (let i = 0; i < 12; i++) {
    // Note that Math.random returns [0.0, 1.0) - meaning 1.0 will never be returned, just a number close to it
    // This means length * Math.random() returns a random index from 0, inclusive, to length, exclusive.
    result.push(DEFAULT_ALPHABET.charAt(Math.floor(DEFAULT_ALPHABET.length * Math.random())));
  }
  return result.join('');
};

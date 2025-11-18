/**
 * Morse Code Encoder/Decoder Utilities
 * Provides bidirectional conversion between text and morse code
 */

import { MORSE_CODE, translateMorse } from '../MorseHelper';

/**
 * Encode text to morse code
 * @param {string} text - Plain text to encode
 * @param {boolean} includeSpaces - Whether to include word separators (|)
 * @returns {string} Morse code string with dots (·) and dashes (−)
 *
 * Example:
 *   encodeTextToMorse('SOS') => '··· −−− ···'
 *   encodeTextToMorse('HELLO WORLD') => '···· · ·−·· ·−·· −−− | ·−− −−− ·−· ·−·· −··'
 */
export function encodeTextToMorse(text, includeSpaces = true) {
  if (!text) return '';

  // Convert to uppercase for lookup
  const upperText = text.toUpperCase().trim();

  // Split into words
  const words = upperText.split(/\s+/);

  // Encode each word
  const encodedWords = words.map(word => {
    // Encode each character in the word
    const chars = word.split('').map(char => {
      const morseCode = MORSE_CODE[char];
      if (!morseCode) {
        console.warn(`Character '${char}' not found in morse code dictionary`);
        return ''; // Skip unknown characters
      }
      return morseCode;
    }).filter(code => code.length > 0); // Remove empty strings

    // Join characters with spaces (letter separator)
    return chars.join(' ');
  }).filter(word => word.length > 0);

  // Join words with word separator
  if (includeSpaces && encodedWords.length > 1) {
    return encodedWords.join(' | ');
  }

  return encodedWords.join(' ');
}

/**
 * Decode morse code to text (alias for translateMorse)
 * @param {string} morseCode - Morse code string
 * @returns {string} Plain text
 */
export function decodeMorseToText(morseCode) {
  return translateMorse(morseCode);
}

/**
 * Validate if a string is valid morse code
 * @param {string} morse - String to validate
 * @returns {boolean} True if valid morse code
 */
export function isValidMorse(morse) {
  if (!morse) return false;

  // Valid morse only contains: dots, dashes, spaces, and pipe symbols
  const validPattern = /^[·−\-\s|]+$/;
  return validPattern.test(morse);
}

/**
 * Get a random character from a set
 * @param {string[]} characters - Array of characters to choose from
 * @returns {string} Random character
 */
export function getRandomChar(characters) {
  if (!characters || characters.length === 0) return '';
  const randomIndex = Math.floor(Math.random() * characters.length);
  return characters[randomIndex];
}

/**
 * Get a random word from a set
 * @param {string[]} words - Array of words to choose from
 * @returns {string} Random word
 */
export function getRandomWord(words) {
  if (!words || words.length === 0) return '';
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}

/**
 * Generate random morse code string
 * @param {number} length - Number of characters
 * @param {string[]} characterSet - Characters to use (defaults to E, T, A, O, I, N - common letters)
 * @returns {object} { text: string, morse: string }
 */
export function generateRandomMorse(length = 5, characterSet = ['E', 'T', 'A', 'O', 'I', 'N']) {
  const chars = [];
  for (let i = 0; i < length; i++) {
    chars.push(getRandomChar(characterSet));
  }
  const text = chars.join('');
  const morse = encodeTextToMorse(text, false);

  return { text, morse };
}

/**
 * Compare two morse code strings (ignoring minor spacing differences)
 * @param {string} morse1 - First morse string
 * @param {string} morse2 - Second morse string
 * @returns {boolean} True if they match
 */
export function compareMorse(morse1, morse2) {
  if (!morse1 || !morse2) return false;

  // Normalize: trim, replace multiple spaces with single space
  const normalize = (str) => str.trim().replace(/\s+/g, ' ');

  return normalize(morse1) === normalize(morse2);
}

/**
 * Calculate accuracy between user input and target morse
 * @param {string} userMorse - User's morse input
 * @param {string} targetMorse - Correct morse code
 * @returns {number} Accuracy percentage (0-100)
 */
export function calculateMorseAccuracy(userMorse, targetMorse) {
  if (!userMorse || !targetMorse) return 0;

  // Normalize both strings
  const normalize = (str) => str.trim().replace(/\s+/g, ' ');
  const user = normalize(userMorse);
  const target = normalize(targetMorse);

  // If they match perfectly
  if (user === target) return 100;

  // Character-by-character comparison
  const userChars = user.split(' ');
  const targetChars = target.split(' ');

  // Compare using longer length as denominator
  const maxLength = Math.max(userChars.length, targetChars.length);
  if (maxLength === 0) return 0;

  let matches = 0;
  for (let i = 0; i < maxLength; i++) {
    if (i < userChars.length && i < targetChars.length && userChars[i] === targetChars[i]) {
      matches++;
    }
  }

  return Math.round((matches / maxLength) * 100);
}

/**
 * Get all characters by difficulty level
 * @param {string} level - 'easy', 'medium', 'hard', 'expert'
 * @returns {string[]} Array of characters
 */
export function getCharactersByDifficulty(level) {
  const difficulties = {
    easy: ['E', 'T'], // 1 unit each
    beginner: ['E', 'T', 'I', 'A', 'N', 'M'], // 1-2 units
    medium: ['E', 'T', 'I', 'A', 'N', 'M', 'S', 'O', 'H', 'U', 'V', 'F'], // 1-4 units
    intermediate: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'], // All letters
    advanced: Object.keys(MORSE_CODE).filter(char => /[A-Z0-9]/.test(char)), // Letters + numbers
    expert: Object.keys(MORSE_CODE) // Everything including punctuation
  };

  return difficulties[level] || difficulties.medium;
}

/**
 * Common practice words for drills
 */
export const PRACTICE_WORDS = {
  emergency: ['SOS', 'HELP', 'MAYDAY'],
  greetings: ['HI', 'HELLO', 'GOOD', 'DAY', 'BYE'],
  common: ['THE', 'AND', 'YOU', 'ARE', 'THAT', 'THIS', 'WITH', 'FOR', 'NOT', 'BUT'],
  short: ['A', 'I', 'TO', 'IN', 'IS', 'IT', 'OF', 'OR', 'AS', 'AT', 'BE', 'BY', 'DO', 'GO', 'HE', 'IF', 'ME', 'MY', 'NO', 'ON', 'SO', 'UP', 'US', 'WE'],
  medium: ['ABOUT', 'AFTER', 'AGAIN', 'FIRST', 'FOUND', 'GREAT', 'HOUSE', 'LARGE', 'LIGHT', 'MIGHT', 'NEVER', 'OTHER', 'PLACE', 'RIGHT', 'SHALL', 'SMALL', 'STILL', 'THEIR', 'THERE', 'THESE', 'THING', 'THINK', 'THREE', 'UNDER', 'WATER', 'WHERE', 'WHICH', 'WHILE', 'WOULD', 'WRITE'],
  numbers: ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN']
};

export default {
  encodeTextToMorse,
  decodeMorseToText,
  isValidMorse,
  getRandomChar,
  getRandomWord,
  generateRandomMorse,
  compareMorse,
  calculateMorseAccuracy,
  getCharactersByDifficulty,
  PRACTICE_WORDS
};

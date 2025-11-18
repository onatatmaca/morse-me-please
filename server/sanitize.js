// Input sanitization module to prevent XSS and injection attacks

/**
 * Sanitize username - remove HTML tags, script tags, and limit to alphanumeric + basic chars
 * @param {string} username - Raw username input
 * @returns {string} - Sanitized username
 */
const sanitizeUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return '';
  }

  // Remove any HTML tags
  let sanitized = username.replace(/<[^>]*>/g, '');

  // Remove script-related content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove any potential XSS vectors (event handlers, javascript:, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:text\/html/gi, '');

  // Remove any control characters except spaces
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit to 20 characters
  return sanitized.substring(0, 20);
};

/**
 * Sanitize morse code message - ensure it only contains valid morse characters
 * @param {string} morse - Raw morse code input
 * @returns {string} - Sanitized morse code
 */
const sanitizeMorseCode = (morse) => {
  if (!morse || typeof morse !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = morse.replace(/<[^>]*>/g, '');

  // Morse code should only contain: dots (·), dashes (−, -, —), spaces, and pipe (|) for word separator
  // Allow common dash variants and normalize them
  sanitized = sanitized.replace(/[\u2010-\u2015]/g, '-'); // Normalize various dashes to hyphen

  // Keep only valid morse characters: dot (·), dash (-), space, pipe (|)
  sanitized = sanitized.replace(/[^·\-\s|]/g, '');

  // Limit length to prevent abuse (max 10000 characters)
  return sanitized.substring(0, 10000);
};

/**
 * Sanitize translated text - remove HTML and script tags
 * @param {string} text - Raw text input
 * @returns {string} - Sanitized text
 */
const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '');

  // Remove script content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove XSS vectors
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:text\/html/gi, '');

  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Limit length (max 1000 characters)
  return sanitized.substring(0, 1000);
};

/**
 * Validate and sanitize WPM value
 * @param {number} wpm - Words per minute value
 * @returns {number} - Validated WPM (5-50 range)
 */
const sanitizeWPM = (wpm) => {
  const parsed = parseInt(wpm);
  if (isNaN(parsed) || parsed < 5 || parsed > 50) {
    return 12; // Default WPM
  }
  return parsed;
};

/**
 * Validate and sanitize numeric values
 * @param {any} value - Value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {number} defaultValue - Default value if invalid
 * @returns {number} - Validated number
 */
const sanitizeNumber = (value, min, max, defaultValue) => {
  const parsed = parseInt(value);
  if (isNaN(parsed) || parsed < min || parsed > max) {
    return defaultValue;
  }
  return parsed;
};

module.exports = {
  sanitizeUsername,
  sanitizeMorseCode,
  sanitizeText,
  sanitizeWPM,
  sanitizeNumber
};

/**
 * Utility functions for validation
 */

/**
 * Check if a string is valid Base64
 * @param {string} str - String to check
 * @returns {boolean} True if valid Base64
 */
export function isBase64(str) {
  if (!str || str.trim() === '') return false;

  try {
    const base64Pattern = /^[A-Za-z0-9+/]+(={0,2})$/;
    if (!base64Pattern.test(str)) return false;

    // Try to decode
    Buffer.from(str, 'base64');
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a string is valid PEM format
 * @param {string} str - String to check
 * @returns {boolean} True if valid PEM
 */
export function isPEM(str) {
  if (!str || str.trim() === '') return false;

  const trimmed = str.trim();
  return trimmed.includes('-----BEGIN') && trimmed.includes('-----END');
}

/**
 * Check if a string is valid JSON
 * @param {string} str - String to check
 * @returns {boolean} True if valid JSON
 */
export function isJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if value is empty
 * @param {any} value - Value to check
 * @returns {boolean} True if empty
 */
export function isEmpty(value) {
  return value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === '');
}

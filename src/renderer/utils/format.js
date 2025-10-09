/**
 * Date/time formatting and token visualization utilities
 */

/**
 * Format Unix timestamp to human-readable date
 * @param {number} timestamp - Unix timestamp (seconds)
 * @returns {string} Formatted date string
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A';

  try {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    return 'Invalid Date';
  }
}

/**
 * Format expiration time relative to now
 * @param {number} expTimestamp - Expiration Unix timestamp (seconds)
 * @returns {string} Relative time string (e.g., "in 1 hour", "expired 5 minutes ago")
 */
export function formatExpirationRelative(expTimestamp) {
  if (!expTimestamp) return 'N/A';

  const now = Math.floor(Date.now() / 1000);
  const diff = expTimestamp - now;

  if (diff < 0) {
    // Expired
    const absDiff = Math.abs(diff);
    if (absDiff < 60) return `expired ${absDiff} seconds ago`;
    if (absDiff < 3600) return `expired ${Math.floor(absDiff / 60)} minutes ago`;
    if (absDiff < 86400) return `expired ${Math.floor(absDiff / 3600)} hours ago`;
    return `expired ${Math.floor(absDiff / 86400)} days ago`;
  } else {
    // Valid
    if (diff < 60) return `expires in ${diff} seconds`;
    if (diff < 3600) return `expires in ${Math.floor(diff / 60)} minutes`;
    if (diff < 86400) return `expires in ${Math.floor(diff / 3600)} hours`;
    return `expires in ${Math.floor(diff / 86400)} days`;
  }
}

/**
 * Visualize JWT token by separating header, payload, and signature
 * @param {string} token - JWT token string
 * @returns {{header: string, payload: string, signature: string}} Token parts
 */
export function visualizeToken(token) {
  if (!token || typeof token !== 'string') {
    return { header: '', payload: '', signature: '' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { header: token, payload: '', signature: '' };
  }

  return {
    header: parts[0],
    payload: parts[1],
    signature: parts[2]
  };
}

/**
 * Format JSON object for display (pretty print)
 * @param {Object} obj - Object to format
 * @returns {string} Formatted JSON string
 */
export function formatJSON(obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return JSON.stringify({ error: 'Unable to format JSON' });
  }
}

/**
 * Calculate payload size in bytes
 * @param {Object} payload - Payload object
 * @returns {number} Size in bytes
 */
export function getPayloadSize(payload) {
  try {
    const jsonString = JSON.stringify(payload);
    return new Blob([jsonString]).size;
  } catch {
    return 0;
  }
}

/**
 * Format bytes to human-readable size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size (e.g., "1.5 KB", "2 MB")
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  if (bytes < 1024) return `${bytes} Bytes`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

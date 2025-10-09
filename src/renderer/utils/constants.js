/**
 * Renderer-specific constants
 */

// Expiration presets
export const EXPIRATION_PRESETS = [
  { value: '1h', label: '1 Hour', seconds: 3600 },
  { value: '1d', label: '1 Day', seconds: 86400 },
  { value: '1w', label: '1 Week', seconds: 604800 },
  { value: 'custom', label: 'Custom', seconds: null }
];

// Algorithm options
export const ALGORITHMS = [
  { value: 'HS256', label: 'HS256 (HMAC + SHA256)' },
  { value: 'RS256', label: 'RS256 (RSA + SHA256)' }
];

// Common JWT claims
export const COMMON_CLAIMS = [
  { name: 'userId', label: 'User ID', type: 'string' },
  { name: 'username', label: 'Username', type: 'string' },
  { name: 'email', label: 'Email', type: 'string' },
  { name: 'roleCode', label: 'Role Code', type: 'string' },
  { name: 'merchantId', label: 'Merchant ID', type: 'string' },
  { name: 'sub', label: 'Subject (sub)', type: 'string' },
  { name: 'iss', label: 'Issuer (iss)', type: 'string' },
  { name: 'aud', label: 'Audience (aud)', type: 'string' }
];

// Key format hints
export const KEY_FORMAT_HINTS = {
  HS256: 'Base64-encoded secret key (e.g., dGVzdC1rZXktc2VjcmV0...)',
  RS256: 'PEM-encoded RSA private key (-----BEGIN RSA PRIVATE KEY-----...)'
};

export default {
  EXPIRATION_PRESETS,
  ALGORITHMS,
  COMMON_CLAIMS,
  KEY_FORMAT_HINTS
};

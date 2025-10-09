/**
 * @typedef {Object} Profile
 * @property {string} id - Unique identifier (UUID v4)
 * @property {string} name - User-defined profile name (1-50 characters)
 * @property {'HS256'|'RS256'} algorithm - JWT signing algorithm
 * @property {string} encryptedKey - Encrypted signing key (Base64)
 * @property {Object} payload - JWT payload template with claims
 * @property {'1h'|'1d'|'1w'|'custom'} [expirationPreset] - Default expiration preset
 * @property {number} [customExpiration] - Custom expiration Unix timestamp
 * @property {string} createdAt - ISO 8601 creation timestamp
 * @property {string} updatedAt - ISO 8601 last modification timestamp
 */

/**
 * @typedef {Object} JWTToken
 * @property {string} raw - Complete JWT token (header.payload.signature)
 * @property {Object} header - Decoded header containing algorithm and type
 * @property {Object} payload - Decoded payload containing claims
 * @property {string} signature - Base64url-encoded signature portion
 * @property {string} [generatedAt] - ISO 8601 timestamp when token was generated
 */

/**
 * @typedef {Object} Key
 * @property {string} [plaintextKey] - Unencrypted key (exists only in memory during token generation)
 * @property {string} encryptedKey - Encrypted key for persistent storage (Base64)
 * @property {'HS256'|'RS256'} algorithm - Algorithm this key is used for
 */

/**
 * @typedef {Object} Payload
 * @property {string} [userId] - User identifier
 * @property {string} [username] - User display name
 * @property {string} [email] - User email address
 * @property {string} [roleCode] - User role/permission code
 * @property {string} [merchantId] - Merchant identifier (for e-commerce scenarios)
 * @property {string} [sub] - Subject (standard JWT claim)
 * @property {string} [iss] - Issuer (standard JWT claim)
 * @property {string} [aud] - Audience (standard JWT claim)
 * @property {number} exp - Expiration time (Unix timestamp)
 * @property {number} [iat] - Issued at time (Unix timestamp)
 * @property {number} [nbf] - Not before time (Unix timestamp)
 */

/**
 * @typedef {Object} ApplicationSettings
 * @property {string} [lastSelectedProfileId] - ID of the last selected profile (UUID)
 * @property {string} version - Settings schema version for migration
 * @property {'light'|'dark'} [theme] - UI theme
 * @property {WindowBounds} [windowBounds] - Window position and size for persistence
 */

/**
 * @typedef {Object} WindowBounds
 * @property {number} x - Window X position
 * @property {number} y - Window Y position
 * @property {number} width - Window width
 * @property {number} height - Window height
 */

module.exports = {};

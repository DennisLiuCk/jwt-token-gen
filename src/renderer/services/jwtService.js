import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token
 * @param {string} algorithm - The signing algorithm (HS256 or RS256)
 * @param {string} key - The signing key (Base64 for HS256, PEM for RS256)
 * @param {Object} payload - The JWT payload claims
 * @param {string|number} expirationPreset - Expiration preset ('1h', '1d', '1w') or custom timestamp
 * @returns {Object} Generated JWT token with metadata
 */
export function generateToken(algorithm, key, payload, expirationPreset) {
  try {
    // Prepare the key based on algorithm
    let signingKey = key;
    if (algorithm === 'HS256') {
      // Decode Base64 key for HMAC
      signingKey = Buffer.from(key, 'base64');
    }
    // For RS256, use PEM string directly

    // Add iat (issued at) if not present
    const tokenPayload = {
      ...payload,
      iat: payload.iat || Math.floor(Date.now() / 1000)
    };

    // Calculate expiration
    if (typeof expirationPreset === 'number') {
      // Custom timestamp
      tokenPayload.exp = expirationPreset;
    } else {
      // Preset
      const expirationSeconds = parseExpiration(expirationPreset);
      tokenPayload.exp = tokenPayload.iat + expirationSeconds;
    }

    // Sign the token
    const token = jwt.sign(tokenPayload, signingKey, {
      algorithm: algorithm
    });

    // Clear key from memory (security best practice)
    signingKey = null;

    // Decode for display purposes
    const decoded = jwt.decode(token, { complete: true });

    return {
      raw: token,
      header: decoded.header,
      payload: decoded.payload,
      signature: token.split('.')[2],
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
}

/**
 * Parse expiration preset to seconds
 * @param {string} preset - Expiration preset ('1h', '1d', '1w')
 * @returns {number} Expiration time in seconds
 */
function parseExpiration(preset) {
  const presets = {
    '1h': 3600,      // 1 hour
    '1d': 86400,     // 1 day
    '1w': 604800     // 1 week
  };

  if (presets[preset]) {
    return presets[preset];
  }

  throw new Error(`Invalid expiration preset: ${preset}`);
}

/**
 * Parse an existing JWT token (decode without verification)
 * @param {string} token - The JWT token to parse
 * @returns {Object} Decoded token with header and payload
 */
export function parseToken(token) {
  try {
    // Validate token format (three Base64url segments)
    if (!/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token)) {
      throw new Error('Invalid JWT format. Expected: header.payload.signature');
    }

    const decoded = jwt.decode(token, { complete: true });

    if (!decoded) {
      throw new Error('Failed to decode token. Token may be malformed.');
    }

    return {
      raw: token,
      header: decoded.header,
      payload: decoded.payload,
      signature: token.split('.')[2]
    };
  } catch (error) {
    throw new Error(`Token parsing failed: ${error.message}`);
  }
}

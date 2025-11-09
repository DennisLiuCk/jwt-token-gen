/**
 * Mock for jsonwebtoken
 * Provides simplified JWT operations for testing
 */

/**
 * Mock sign function
 */
function sign(payload, secret, options = {}) {
  const header = {
    alg: options.algorithm || 'HS256',
    typ: 'JWT',
  };

  // Simple mock token - not a real JWT, but enough for testing
  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signatureB64 = 'mock-signature-' + Math.random().toString(36).substring(7);

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

/**
 * Mock verify function
 */
function verify(token, secret, options = {}) {
  try {
    const decoded = decode(token, { complete: true });

    if (!decoded) {
      throw new Error('Invalid token');
    }

    // Check expiration if present
    if (decoded.payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (decoded.payload.exp < now) {
        const error = new Error('jwt expired');
        error.name = 'TokenExpiredError';
        error.expiredAt = new Date(decoded.payload.exp * 1000);
        throw error;
      }
    }

    return decoded.payload;
  } catch (error) {
    throw error;
  }
}

/**
 * Mock decode function
 */
function decode(token, options = {}) {
  try {
    const parts = token.split('.');

    if (parts.length !== 3) {
      return null;
    }

    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

    if (options.complete) {
      return {
        header,
        payload,
        signature: parts[2],
      };
    }

    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Mock JsonWebTokenError
 */
class JsonWebTokenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'JsonWebTokenError';
  }
}

/**
 * Mock TokenExpiredError
 */
class TokenExpiredError extends JsonWebTokenError {
  constructor(message, expiredAt) {
    super(message);
    this.name = 'TokenExpiredError';
    this.expiredAt = expiredAt;
  }
}

/**
 * Mock NotBeforeError
 */
class NotBeforeError extends JsonWebTokenError {
  constructor(message, date) {
    super(message);
    this.name = 'NotBeforeError';
    this.date = date;
  }
}

module.exports = {
  sign,
  verify,
  decode,
  JsonWebTokenError,
  TokenExpiredError,
  NotBeforeError,
};

const crypto = require('crypto');
const os = require('os');

// Generate a machine-specific key
// NOTE: This is a fallback implementation since node-dpapi is not available
// In production, this should use Windows DPAPI via node-dpapi
function getMachineKey() {
  const username = os.userInfo().username;
  const hostname = os.hostname();
  const seed = `${username}@${hostname}`;

  // Create a deterministic key based on machine/user
  return crypto.createHash('sha256').update(seed).digest();
}

const ALGORITHM = 'aes-256-cbc';
const MACHINE_KEY = getMachineKey();

/**
 * Encrypt a plaintext key for secure storage
 * @param {string} plaintextKey - The plaintext key to encrypt
 * @returns {string} Base64-encoded encrypted key
 */
function encryptKey(plaintextKey) {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, MACHINE_KEY, iv);

    let encrypted = cipher.update(plaintextKey, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Combine IV and encrypted data
    const combined = Buffer.concat([iv, Buffer.from(encrypted, 'base64')]);
    return combined.toString('base64');
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypt an encrypted key
 * @param {string} encryptedKey - Base64-encoded encrypted key
 * @returns {string} Decrypted plaintext key
 */
function decryptKey(encryptedKey) {
  try {
    const combined = Buffer.from(encryptedKey, 'base64');

    // Extract IV and encrypted data
    const iv = combined.slice(0, 16);
    const encrypted = combined.slice(16);

    const decipher = crypto.createDecipheriv(ALGORITHM, MACHINE_KEY, iv);

    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error('Unable to decrypt key. This profile may have been created on a different machine or by a different user.');
  }
}

module.exports = {
  encryptKey,
  decryptKey
};

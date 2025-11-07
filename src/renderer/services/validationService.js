/**
 * Validate key format based on algorithm
 * @param {string} key - The key to validate
 * @param {string} algorithm - The algorithm (HS256 or RS256)
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
export function validateKey(key, algorithm) {
  if (!key || key.trim() === '') {
    return { valid: false, error: 'Key cannot be empty' };
  }

  if (algorithm === 'HS256') {
    return validateBase64(key);
  } else if (algorithm === 'RS256') {
    return validatePEM(key);
  }

  return { valid: false, error: 'Unknown algorithm' };
}

/**
 * Validate Base64 format
 * @param {string} value - The value to validate
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
export function validateBase64(value) {
  try {
    // Base64 regex pattern
    const base64Pattern = /^[A-Za-z0-9+/]+(={0,2})$/;

    if (!base64Pattern.test(value)) {
      return {
        valid: false,
        error: 'Invalid Base64 format. Expected characters: A-Z, a-z, 0-9, +, /, ='
      };
    }

    // Try to decode to verify it's valid Base64
    Buffer.from(value, 'base64');

    return { valid: true, error: null };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid Base64 encoding. Please check the key format.'
    };
  }
}

/**
 * Validate PEM format (for RSA private keys)
 * @param {string} value - The PEM string to validate
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
export function validatePEM(value) {
  try {
    const trimmed = value.trim();

    // Check for BEGIN/END markers
    if (!trimmed.includes('-----BEGIN') || !trimmed.includes('-----END')) {
      return {
        valid: false,
        error: 'Invalid PEM format. Must contain -----BEGIN and -----END markers'
      };
    }

    // Check for RSA PRIVATE KEY marker
    if (!trimmed.includes('RSA PRIVATE KEY') && !trimmed.includes('PRIVATE KEY')) {
      return {
        valid: false,
        error: 'Must be an RSA private key (-----BEGIN RSA PRIVATE KEY-----)'
      };
    }

    // Extract the body between markers
    const lines = trimmed.split('\n');
    const bodyLines = lines.filter(line =>
      !line.includes('-----BEGIN') &&
      !line.includes('-----END') &&
      line.trim() !== ''
    );

    if (bodyLines.length === 0) {
      return {
        valid: false,
        error: 'PEM body is empty'
      };
    }

    // Validate Base64 content
    const body = bodyLines.join('');
    const base64Result = validateBase64(body);

    if (!base64Result.valid) {
      return {
        valid: false,
        error: `PEM body contains invalid Base64: ${base64Result.error}`
      };
    }

    return { valid: true, error: null };
  } catch (error) {
    return {
      valid: false,
      error: `PEM validation failed: ${error.message}`
    };
  }
}

/**
 * Validate JSON payload
 * @param {string} jsonString - The JSON string to validate
 * @returns {{valid: boolean, error: string|null, data: Object|null}} Validation result with parsed data
 */
export function validateJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);

    if (typeof parsed !== 'object' || parsed === null) {
      return {
        valid: false,
        error: 'JSON must be an object',
        data: null
      };
    }

    // Check payload size (64KB limit)
    const size = new Blob([jsonString]).size;
    if (size > 65536) {
      return {
        valid: false,
        error: `Payload too large (${Math.round(size/1024)}KB). Maximum is 64KB.`,
        data: null
      };
    }

    return { valid: true, error: null, data: parsed };
  } catch (error) {
    return {
      valid: false,
      error: `Invalid JSON: ${error.message}`,
      data: null
    };
  }
}

/**
 * Validate profile name
 * @param {string} name - The profile name to validate
 * @param {Array} existingProfiles - Existing profiles to check for duplicates
 * @param {string} currentProfileId - Current profile ID (for edit mode)
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
export function validateProfileName(name, existingProfiles = [], currentProfileId = null) {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Profile name cannot be empty' };
  }

  if (name.length < 1 || name.length > 50) {
    return {
      valid: false,
      error: 'Profile name must be between 1 and 50 characters'
    };
  }

  // Check for duplicates (exclude current profile in edit mode)
  const duplicate = existingProfiles.find(p =>
    p.name.toLowerCase() === name.toLowerCase() &&
    p.id !== currentProfileId
  );

  if (duplicate) {
    return {
      valid: false,
      error: 'A profile with this name already exists'
    };
  }

  return { valid: true, error: null };
}

/**
 * Infer the type of a value
 * @param {*} value - The value to infer type from
 * @returns {string} Type name: 'string', 'number', 'boolean', 'null', 'object', 'array'
 */
export function inferType(value) {
  if (value === null) {
    return 'null';
  }
  if (Array.isArray(value)) {
    return 'array';
  }
  if (typeof value === 'object') {
    return 'object';
  }
  return typeof value; // 'string', 'number', 'boolean', 'undefined', etc.
}

/**
 * Validate if a value can be converted to the specified type
 * @param {*} value - The value to validate
 * @param {string} type - Target type ('string', 'number', 'boolean', 'null')
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
export function validateValueType(value, type) {
  if (type === 'null') {
    return { valid: true, error: null };
  }

  if (type === 'string') {
    return { valid: true, error: null };
  }

  if (type === 'number') {
    const num = Number(value);
    if (isNaN(num) && value !== '') {
      return {
        valid: false,
        error: `Cannot convert "${value}" to number`
      };
    }
    return { valid: true, error: null };
  }

  if (type === 'boolean') {
    const strValue = String(value).toLowerCase();
    if (strValue !== 'true' && strValue !== 'false' && strValue !== '0' && strValue !== '1' && strValue !== '') {
      return {
        valid: false,
        error: `Cannot convert "${value}" to boolean. Use: true, false, 0, or 1`
      };
    }
    return { valid: true, error: null };
  }

  return { valid: false, error: `Unknown type: ${type}` };
}

/**
 * Convert a string value to the specified type
 * @param {string} stringValue - The string value to convert
 * @param {string} type - Target type ('string', 'number', 'boolean', 'null')
 * @returns {*} Converted value
 */
export function convertStringToType(stringValue, type) {
  if (type === 'null') {
    return null;
  }

  if (type === 'string') {
    return stringValue;
  }

  if (type === 'number') {
    if (stringValue === '' || stringValue === null || stringValue === undefined) {
      return 0;
    }
    const num = Number(stringValue);
    if (isNaN(num)) {
      throw new Error(`Cannot convert "${stringValue}" to number`);
    }
    return num;
  }

  if (type === 'boolean') {
    const strValue = String(stringValue).toLowerCase();
    if (strValue === 'true' || strValue === '1') {
      return true;
    }
    if (strValue === 'false' || strValue === '0' || strValue === '') {
      return false;
    }
    throw new Error(`Cannot convert "${stringValue}" to boolean`);
  }

  throw new Error(`Unknown type: ${type}`);
}

/**
 * Convert any value to the specified type
 * @param {*} value - The value to convert
 * @param {string} type - Target type ('string', 'number', 'boolean', 'null')
 * @returns {*} Converted value
 */
export function convertValue(value, type) {
  if (type === 'null') {
    return null;
  }

  if (type === 'string') {
    return value === null || value === undefined ? '' : String(value);
  }

  if (type === 'number') {
    if (value === null || value === undefined || value === '') {
      return 0;
    }
    const num = Number(value);
    if (isNaN(num)) {
      throw new Error(`Cannot convert "${value}" to number`);
    }
    return num;
  }

  if (type === 'boolean') {
    if (typeof value === 'boolean') {
      return value;
    }
    const strValue = String(value).toLowerCase();
    if (strValue === 'true' || strValue === '1') {
      return true;
    }
    if (strValue === 'false' || strValue === '0' || strValue === '') {
      return false;
    }
    throw new Error(`Cannot convert "${value}" to boolean`);
  }

  throw new Error(`Unknown type: ${type}`);
}

/**
 * Mock factories for generating test data
 * Provides factory functions to create test data with custom properties
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Create a mock profile with custom properties
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock profile
 */
export function createMockProfile(overrides = {}) {
  const id = overrides.id || `profile-${uuidv4()}`;
  const algorithm = overrides.algorithm || 'HS256';

  return {
    id,
    name: `Test Profile ${id.slice(-4)}`,
    algorithm,
    key: algorithm === 'HS256'
      ? 'dGVzdC1rZXk=' // base64: "test-key"
      : '-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----',
    encryptedKey: `encrypted-${id}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a mock payload with custom properties
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock payload
 */
export function createMockPayload(overrides = {}) {
  return {
    sub: '1234567890',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    ...overrides,
  };
}

/**
 * Create a mock JWT token object with custom properties
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock token object
 */
export function createMockToken(overrides = {}) {
  const payload = createMockPayload(overrides.payload);
  const header = {
    alg: overrides.algorithm || 'HS256',
    typ: 'JWT',
    ...overrides.header,
  };

  return {
    raw: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
    header,
    payload,
    signature: 'dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
    generatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a mock profile group with custom properties
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock profile group
 */
export function createMockProfileGroup(overrides = {}) {
  const id = overrides.id || `group-${uuidv4()}`;

  return {
    id,
    name: `Test Group ${id.slice(-4)}`,
    profiles: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a mock payload template with custom properties
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock payload template
 */
export function createMockPayloadTemplate(overrides = {}) {
  const id = overrides.id || `template-${uuidv4()}`;

  return {
    id,
    name: `Test Template ${id.slice(-4)}`,
    payload: {
      sub: '',
      name: '',
      ...overrides.payload,
    },
    ...overrides,
  };
}

/**
 * Create a mock token history item with custom properties
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock history item
 */
export function createMockHistoryItem(overrides = {}) {
  const id = overrides.id || `history-${uuidv4()}`;

  return {
    id,
    token: createMockToken(overrides.token),
    profile: createMockProfile(overrides.profile),
    payload: createMockPayload(overrides.payload),
    generatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a mock IPC response
 * @param {boolean} success - Whether the response is successful
 * @param {*} data - Response data
 * @param {string} error - Error message (if failed)
 * @returns {Object} Mock IPC response
 */
export function createMockIpcResponse(success = true, data = null, error = null) {
  return {
    success,
    data: success ? data : null,
    error: success ? null : error || 'Mock error',
  };
}

/**
 * Create multiple mock profiles
 * @param {number} count - Number of profiles to create
 * @param {Object} baseOverrides - Base properties for all profiles
 * @returns {Array} Array of mock profiles
 */
export function createMockProfiles(count = 3, baseOverrides = {}) {
  return Array.from({ length: count }, (_, i) =>
    createMockProfile({
      ...baseOverrides,
      name: `Profile ${i + 1}`,
    })
  );
}

/**
 * Create multiple mock payload templates
 * @param {number} count - Number of templates to create
 * @param {Object} baseOverrides - Base properties for all templates
 * @returns {Array} Array of mock templates
 */
export function createMockTemplates(count = 3, baseOverrides = {}) {
  return Array.from({ length: count }, (_, i) =>
    createMockPayloadTemplate({
      ...baseOverrides,
      name: `Template ${i + 1}`,
    })
  );
}

/**
 * Create multiple mock token history items
 * @param {number} count - Number of items to create
 * @param {Object} baseOverrides - Base properties for all items
 * @returns {Array} Array of mock history items
 */
export function createMockHistory(count = 5, baseOverrides = {}) {
  return Array.from({ length: count }, (_, i) =>
    createMockHistoryItem({
      ...baseOverrides,
      generatedAt: new Date(Date.now() - i * 60000).toISOString(), // Each 1 minute apart
    })
  );
}

/**
 * Create a mock React event
 * @param {string} type - Event type (e.g., 'change', 'click')
 * @param {Object} overrides - Event property overrides
 * @returns {Object} Mock event
 */
export function createMockEvent(type = 'change', overrides = {}) {
  return {
    type,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target: {
      value: '',
      name: '',
      checked: false,
      ...overrides.target,
    },
    currentTarget: overrides.currentTarget || overrides.target || {},
    bubbles: true,
    cancelable: true,
    ...overrides,
  };
}

/**
 * Create a mock file
 * @param {string} name - File name
 * @param {string} content - File content
 * @param {string} type - MIME type
 * @returns {File} Mock file object
 */
export function createMockFile(name = 'test.txt', content = 'test content', type = 'text/plain') {
  const blob = new Blob([content], { type });
  const file = new File([blob], name, { type });
  return file;
}

/**
 * Create a mock clipboard event
 * @param {Object} overrides - Event property overrides
 * @returns {Object} Mock clipboard event
 */
export function createMockClipboardEvent(overrides = {}) {
  return {
    clipboardData: {
      getData: jest.fn().mockReturnValue(''),
      setData: jest.fn(),
      ...overrides.clipboardData,
    },
    preventDefault: jest.fn(),
    ...overrides,
  };
}

/**
 * Create a mock keyboard event
 * @param {string} key - Key pressed
 * @param {Object} overrides - Event property overrides
 * @returns {Object} Mock keyboard event
 */
export function createMockKeyboardEvent(key = 'Enter', overrides = {}) {
  return {
    key,
    code: `Key${key.toUpperCase()}`,
    keyCode: key.charCodeAt(0),
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    ...overrides,
  };
}

/**
 * Create a mock ResizeObserver
 * @returns {Class} Mock ResizeObserver class
 */
export function createMockResizeObserver() {
  return class ResizeObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  };
}

/**
 * Create a mock IntersectionObserver
 * @returns {Class} Mock IntersectionObserver class
 */
export function createMockIntersectionObserver() {
  return class IntersectionObserver {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
    }
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  };
}

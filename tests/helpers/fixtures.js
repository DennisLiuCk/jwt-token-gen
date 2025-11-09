/**
 * Test data fixtures for JWT Token Generator
 * Provides reusable test data for consistent testing
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Sample JWT profiles for testing
 */
export const mockProfiles = {
  hs256Profile: {
    id: 'profile-hs256-001',
    name: 'Test HS256 Profile',
    algorithm: 'HS256',
    key: 'dGVzdC1zZWNyZXQta2V5LWZvci1obWFjLTI1Ng==', // base64: "test-secret-key-for-hmac-256"
    encryptedKey: 'encrypted-test-key-hs256',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  rs256Profile: {
    id: 'profile-rs256-001',
    name: 'Test RS256 Profile',
    algorithm: 'RS256',
    key: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7VJTUt9Us8cKj\n-----END PRIVATE KEY-----',
    encryptedKey: 'encrypted-test-key-rs256',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  minimalProfile: {
    id: 'profile-minimal-001',
    name: 'Minimal Profile',
    algorithm: 'HS256',
    key: 'bWluaW1hbA==', // base64: "minimal"
  },
};

/**
 * Sample JWT payloads for testing
 */
export const mockPayloads = {
  standard: {
    sub: '1234567890',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'user',
  },
  admin: {
    sub: 'admin-001',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    permissions: ['read', 'write', 'delete'],
  },
  withClaims: {
    sub: '1234567890',
    name: 'John Doe',
    iat: 1516239022,
    exp: 1516242622,
    iss: 'test-issuer',
    aud: 'test-audience',
  },
  minimal: {
    sub: 'test-user',
  },
  empty: {},
};

/**
 * Sample JWT tokens for testing
 */
export const mockTokens = {
  valid: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  withExpiration: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxNzMxMTM0NDAwfQ.VnLnJnS4xJ-sP_VGO0gSYvPLdQGlLCx7MK6vZLmPnBI',
  invalid: 'invalid.token.format',
  malformed: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid-payload.invalid-signature',
};

/**
 * Sample profile groups for testing
 */
export const mockProfileGroups = {
  development: {
    id: 'group-dev-001',
    name: 'Development',
    profiles: ['profile-hs256-001'],
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  production: {
    id: 'group-prod-001',
    name: 'Production',
    profiles: ['profile-rs256-001'],
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  empty: {
    id: 'group-empty-001',
    name: 'Empty Group',
    profiles: [],
    createdAt: '2024-01-01T00:00:00.000Z',
  },
};

/**
 * Sample payload templates for testing
 */
export const mockPayloadTemplates = {
  userAuth: {
    id: 'template-user-001',
    name: 'User Authentication',
    payload: {
      sub: '',
      name: '',
      email: '',
      role: 'user',
    },
  },
  apiAccess: {
    id: 'template-api-001',
    name: 'API Access',
    payload: {
      sub: '',
      scope: 'api:read api:write',
      client_id: '',
    },
  },
  custom: {
    id: 'template-custom-001',
    name: 'Custom Template',
    payload: {
      custom_field: 'custom_value',
    },
  },
};

/**
 * Sample token history for testing
 */
export const mockTokenHistory = [
  {
    id: 'history-001',
    token: mockTokens.valid,
    profile: mockProfiles.hs256Profile,
    payload: mockPayloads.standard,
    generatedAt: '2024-01-01T12:00:00.000Z',
  },
  {
    id: 'history-002',
    token: mockTokens.withExpiration,
    profile: mockProfiles.rs256Profile,
    payload: mockPayloads.admin,
    generatedAt: '2024-01-01T13:00:00.000Z',
  },
];

/**
 * Mock IPC responses for testing
 */
export const mockIpcResponses = {
  success: {
    success: true,
    data: null,
  },
  error: {
    success: false,
    error: 'Test error message',
  },
  profilesSuccess: {
    success: true,
    data: [mockProfiles.hs256Profile, mockProfiles.rs256Profile],
  },
  profileSuccess: {
    success: true,
    data: mockProfiles.hs256Profile,
  },
  encryptionSuccess: {
    success: true,
    data: 'encrypted-key-data',
  },
  decryptionSuccess: {
    success: true,
    data: mockProfiles.hs256Profile.key,
  },
};

/**
 * Expiration presets for testing
 */
export const mockExpirationPresets = {
  oneHour: '1h',
  oneDay: '1d',
  oneWeek: '1w',
  customTimestamp: Math.floor(Date.now() / 1000) + 7200, // 2 hours from now
};

/**
 * Validation error messages for testing
 */
export const mockValidationErrors = {
  emptyKey: 'Key cannot be empty',
  invalidBase64: 'Invalid Base64 format',
  invalidPEM: 'Invalid PEM format',
  emptyPayload: 'Payload cannot be empty',
  invalidJSON: 'Invalid JSON format',
  missingRequired: 'Required field is missing',
};

/**
 * Material-UI component props for testing
 */
export const mockMuiProps = {
  select: {
    onChange: jest.fn(),
    value: 'HS256',
    label: 'Algorithm',
  },
  textField: {
    onChange: jest.fn(),
    value: '',
    label: 'Test Field',
  },
  button: {
    onClick: jest.fn(),
    variant: 'contained',
    color: 'primary',
  },
};

/**
 * Mock window.electronAPI for testing
 */
export const mockElectronAPI = {
  getProfiles: jest.fn().mockResolvedValue(mockIpcResponses.profilesSuccess),
  getRecentProfiles: jest.fn().mockResolvedValue({ success: true, data: [] }),
  getPayloadTemplates: jest.fn().mockResolvedValue({ success: true, data: [] }),
  getTokenHistory: jest.fn().mockResolvedValue({ success: true, data: [] }),
  getProfileGroups: jest.fn().mockResolvedValue({ success: true, data: [] }),
  decryptKey: jest.fn().mockResolvedValue(mockIpcResponses.decryptionSuccess),
  saveProfile: jest.fn().mockResolvedValue(mockIpcResponses.profileSuccess),
  deleteProfile: jest.fn().mockResolvedValue(mockIpcResponses.success),
  encryptKey: jest.fn().mockResolvedValue(mockIpcResponses.encryptionSuccess),
  savePayloadTemplate: jest.fn().mockResolvedValue(mockIpcResponses.success),
  deletePayloadTemplate: jest.fn().mockResolvedValue(mockIpcResponses.success),
  saveTokenToHistory: jest.fn().mockResolvedValue(mockIpcResponses.success),
  clearTokenHistory: jest.fn().mockResolvedValue(mockIpcResponses.success),
  createProfileGroup: jest.fn().mockResolvedValue(mockIpcResponses.success),
  updateProfileGroup: jest.fn().mockResolvedValue(mockIpcResponses.success),
  deleteProfileGroup: jest.fn().mockResolvedValue(mockIpcResponses.success),
};

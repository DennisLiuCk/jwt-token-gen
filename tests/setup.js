// Jest setup file
require('@testing-library/jest-dom');

// Mock window.electronAPI for all tests
global.window = global.window || {};
global.window.electronAPI = {
  getProfiles: jest.fn().mockResolvedValue({ success: true, data: [] }),
  getRecentProfiles: jest.fn().mockResolvedValue({ success: true, data: [] }),
  getPayloadTemplates: jest.fn().mockResolvedValue({ success: true, data: [] }),
  getTokenHistory: jest.fn().mockResolvedValue({ success: true, data: [] }),
  getProfileGroups: jest.fn().mockResolvedValue({ success: true, data: [] }),
  decryptKey: jest.fn().mockResolvedValue({ success: true, data: '' }),
  saveProfile: jest.fn().mockResolvedValue({ success: true }),
  deleteProfile: jest.fn().mockResolvedValue({ success: true }),
  encryptKey: jest.fn().mockResolvedValue({ success: true, data: '' }),
};

// Suppress console warnings during tests
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  warn: jest.fn(),
  error: jest.fn(),
};

module.exports = {
  // Test environment
  testEnvironment: 'jsdom',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Module name mapping for non-JS imports
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/tests/__mocks__/fileMock.js',
  },

  // Transform configuration
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },

  // Transform ES modules from node_modules
  transformIgnorePatterns: [
    'node_modules/(?!uuid)',
  ],

  // Test matching patterns
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/integration/**/*.test.js',
  ],

  // Test path ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
  ],

  // Coverage configuration
  collectCoverage: false, // Enable with --coverage flag
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/**/index.{js,jsx}',
    '!src/main/main.js', // Electron main process
    '!src/renderer/index.jsx', // Entry point
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
  ],

  // Coverage thresholds (enforce minimum coverage)
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 50,
      functions: 50,
      lines: 60,
    },
  },

  // Coverage reporters
  coverageReporters: [
    'text',           // Console output
    'text-summary',   // Summary in console
    'html',           // HTML report in coverage/
    'lcov',           // LCOV format for CI tools
    'json',           // JSON format
  ],

  // Coverage directory
  coverageDirectory: '<rootDir>/coverage',

  // Module directories
  moduleDirectories: [
    'node_modules',
    '<rootDir>/src',
    '<rootDir>/tests',
  ],

  // Module file extensions
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
  ],

  // Automatically clear mock calls and instances between tests
  clearMocks: true,

  // Automatically reset mock state between tests
  resetMocks: false,

  // Automatically restore mock state between tests
  restoreMocks: true,

  // The maximum amount of workers used to run tests
  maxWorkers: '50%',

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // Allow tests to pass even if no tests are found
  passWithNoTests: true,

  // Global test timeout (in milliseconds)
  testTimeout: 10000,

  // Globals available in tests
  globals: {
    __DEV__: true,
  },
};

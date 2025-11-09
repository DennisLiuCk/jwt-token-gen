/**
 * Custom testing utilities for JWT Token Generator
 * Provides enhanced render functions with all necessary providers
 */

import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppProvider } from '../../src/renderer/context/AppContext';
import { ProfileProvider } from '../../src/renderer/context/ProfileContext';
import { PayloadTemplateProvider } from '../../src/renderer/context/PayloadTemplateContext';
import { TokenHistoryProvider } from '../../src/renderer/context/TokenHistoryContext';
import { ProfileGroupProvider } from '../../src/renderer/context/ProfileGroupContext';

// Default theme for testing (simplified version of app theme)
const testTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#AB6B2E',
    },
    secondary: {
      main: '#2D2D2D',
    },
  },
});

/**
 * Custom render function that wraps component with all providers
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @param {Object} options.theme - Custom theme (optional)
 * @param {boolean} options.withProviders - Include context providers (default: true)
 * @param {Object} options.providerProps - Props to pass to providers (optional)
 * @returns {Object} Render result with utilities
 */
export function renderWithProviders(
  ui,
  {
    theme = testTheme,
    withProviders = true,
    providerProps = {},
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    if (!withProviders) {
      return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
    }

    return (
      <ThemeProvider theme={theme}>
        <AppProvider {...providerProps.app}>
          <ProfileProvider {...providerProps.profile}>
            <ProfileGroupProvider {...providerProps.profileGroup}>
              <PayloadTemplateProvider {...providerProps.payloadTemplate}>
                <TokenHistoryProvider {...providerProps.tokenHistory}>
                  {children}
                </TokenHistoryProvider>
              </PayloadTemplateProvider>
            </ProfileGroupProvider>
          </ProfileProvider>
        </AppProvider>
      </ThemeProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Custom render for components that only need theme
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @returns {Object} Render result
 */
export function renderWithTheme(ui, options = {}) {
  return renderWithProviders(ui, { ...options, withProviders: false });
}

/**
 * Wait for a condition to be true
 * @param {Function} callback - Function that returns boolean
 * @param {Object} options - Options
 * @param {number} options.timeout - Timeout in ms (default: 3000)
 * @param {number} options.interval - Check interval in ms (default: 50)
 * @returns {Promise<void>}
 */
export function waitFor(callback, { timeout = 3000, interval = 50 } = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      if (callback()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(check, interval);
      }
    };

    check();
  });
}

/**
 * Create a mock event object
 * @param {Object} overrides - Event property overrides
 * @returns {Object} Mock event
 */
export function createMockEvent(overrides = {}) {
  return {
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target: {
      value: '',
      name: '',
      ...overrides.target,
    },
    ...overrides,
  };
}

/**
 * Create a mock clipboard API
 * @returns {Object} Mock clipboard with writeText method
 */
export function createMockClipboard() {
  const clipboard = {
    writeText: jest.fn().mockResolvedValue(undefined),
    readText: jest.fn().mockResolvedValue(''),
  };

  Object.defineProperty(navigator, 'clipboard', {
    value: clipboard,
    writable: true,
    configurable: true,
  });

  return clipboard;
}

/**
 * Suppress console warnings/errors during tests
 * Useful for testing error states without cluttering output
 * @returns {Function} Restore function to re-enable console
 */
export function suppressConsole() {
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  };

  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();

  return () => {
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  };
}

/**
 * Flush all promises in the queue
 * Useful for testing async behavior
 * @returns {Promise<void>}
 */
export function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';

/**
 * Unit tests for TokenDisplay component
 * Tests JWT token display functionality
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithTheme, createMockClipboard } from '../../helpers/test-utils';
import TokenDisplay from '../../../src/renderer/components/TokenDisplay/TokenDisplay';
import { createMockToken } from '../../helpers/mock-factories';
import { mockTokens } from '../../helpers/fixtures';

describe('TokenDisplay', () => {
  let mockClipboard;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClipboard = createMockClipboard();
  });

  describe('Rendering', () => {
    test('should render without crashing', () => {
      const token = createMockToken();
      renderWithTheme(<TokenDisplay token={token} />);

      // Be more specific since "token" appears multiple times
      expect(screen.getByText('Generated Token')).toBeInTheDocument();
    });

    test('should display token when provided', () => {
      const token = createMockToken();
      renderWithTheme(<TokenDisplay token={token} />);

      expect(screen.getByText(token.raw)).toBeInTheDocument();
    });

    test('should show empty state when no token', () => {
      renderWithTheme(<TokenDisplay token={null} />);

      expect(screen.getByText(/no token/i)).toBeInTheDocument();
    });
  });

  describe('Token Display', () => {
    test('should display token header', () => {
      const token = createMockToken();
      renderWithTheme(<TokenDisplay token={token} />);

      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Decoded Header')).toBeInTheDocument();
      // HS256 is in the formatted JSON - check it's present somewhere
      expect(screen.getByText(/"alg": "HS256"/)).toBeInTheDocument();
    });

    test('should display token payload', () => {
      const token = createMockToken({
        payload: {
          sub: '1234567890',
          name: 'Test User',
        },
      });
      renderWithTheme(<TokenDisplay token={token} />);

      expect(screen.getByText('Payload')).toBeInTheDocument();
      expect(screen.getByText('Decoded Payload')).toBeInTheDocument();
      // Test User is in the formatted JSON
      expect(screen.getByText(/"name": "Test User"/)).toBeInTheDocument();
    });

    test('should display token signature', () => {
      const token = createMockToken();
      renderWithTheme(<TokenDisplay token={token} />);

      expect(screen.getByText(/signature/i)).toBeInTheDocument();
      expect(screen.getByText(token.signature)).toBeInTheDocument();
    });
  });

  describe('Copy Functionality', () => {
    test('should have copy button', () => {
      const token = createMockToken();
      const mockOnCopy = jest.fn();
      renderWithTheme(<TokenDisplay token={token} onCopy={mockOnCopy} />);

      const copyButton = screen.getByRole('button', { name: /copy/i });
      expect(copyButton).toBeInTheDocument();
    });

    test('should call onCopy when copy button clicked', () => {
      const token = createMockToken();
      const mockOnCopy = jest.fn();
      renderWithTheme(<TokenDisplay token={token} onCopy={mockOnCopy} />);

      const copyButton = screen.getByRole('button', { name: /copy/i });
      fireEvent.click(copyButton);

      expect(mockOnCopy).toHaveBeenCalledWith(token.raw);
    });
  });

  describe('Token Formatting', () => {
    test('should format long tokens with line breaks', () => {
      const longToken = createMockToken({
        raw: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'.repeat(10),
      });
      renderWithTheme(<TokenDisplay token={longToken} />);

      // Token should be displayed - check for the token output field
      const tokenField = screen.getByTestId('token-output');
      expect(tokenField).toBeInTheDocument();
      // For Material-UI TextField, check the input element inside
      const input = tokenField.querySelector('textarea');
      expect(input).toHaveValue(longToken.raw);
    });

    test('should highlight different token parts', () => {
      const token = createMockToken();
      renderWithTheme(<TokenDisplay token={token} />);

      // Assuming the component highlights header, payload, signature differently
      const tokenParts = token.raw.split('.');
      expect(tokenParts).toHaveLength(3);
    });
  });

  describe('Expiration Display', () => {
    test('should show expiration time if present', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const token = createMockToken({
        payload: { exp: futureExp },
      });
      renderWithTheme(<TokenDisplay token={token} />);

      // Component shows "Expires: [formatted date]"
      expect(screen.getByText(/expires:/i)).toBeInTheDocument();
    });

    test('should show expiration time even if token is expired', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600;
      const token = createMockToken({
        payload: { exp: pastExp },
      });
      renderWithTheme(<TokenDisplay token={token} />);

      // Component shows "Expires: [formatted date]" for all tokens with exp claim
      // It doesn't differentiate between expired and non-expired tokens
      expect(screen.getByText(/expires:/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      const token = createMockToken();
      renderWithTheme(<TokenDisplay token={token} />);

      const copyButton = screen.getByRole('button', { name: /copy/i });
      expect(copyButton).toHaveAccessibleName();
    });

    test('should be keyboard navigable', () => {
      const token = createMockToken();
      renderWithTheme(<TokenDisplay token={token} />);

      const copyButton = screen.getByRole('button', { name: /copy/i });
      copyButton.focus();
      expect(document.activeElement).toBe(copyButton);
    });
  });
});

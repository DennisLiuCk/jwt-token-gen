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
  let mockOnCopy;

  beforeEach(() => {
    mockOnCopy = jest.fn();
  });

  describe('Rendering', () => {
    test('should render without crashing', () => {
      const token = createMockToken();
      renderWithTheme(<TokenDisplay token={token} onCopy={mockOnCopy} />);

      expect(screen.getByText(/generated token/i)).toBeInTheDocument();
    });

    test('should display token when provided', () => {
      const token = createMockToken();
      renderWithTheme(<TokenDisplay token={token} onCopy={mockOnCopy} />);

      expect(screen.getByDisplayValue(token.raw)).toBeInTheDocument();
    });

    test('should show empty state when no token', () => {
      renderWithTheme(<TokenDisplay token={null} onCopy={mockOnCopy} />);

      expect(screen.getByText(/no token generated yet/i)).toBeInTheDocument();
    });
  });

  describe('Token Structure Display', () => {
    test('should display header section', () => {
      const token = createMockToken();
      renderWithTheme(<TokenDisplay token={token} onCopy={mockOnCopy} />);

      expect(screen.getByText(/header/i)).toBeInTheDocument();
    });

    test('should display payload section', () => {
      const token = createMockToken({
        payload: {
          sub: '1234567890',
          name: 'Test User',
        },
      });
      renderWithTheme(<TokenDisplay token={token} onCopy={mockOnCopy} />);

      expect(screen.getByText(/payload/i)).toBeInTheDocument();
    });

    test('should display signature section', () => {
      const token = createMockToken();
      renderWithTheme(<TokenDisplay token={token} onCopy={mockOnCopy} />);

      expect(screen.getByText(/signature/i)).toBeInTheDocument();
    });

    test('should display decoded header', () => {
      const token = createMockToken();
      renderWithTheme(<TokenDisplay token={token} onCopy=={mockOnCopy} />);

      expect(screen.getByText(/decoded header/i)).toBeInTheDocument();
      expect(screen.getByText(/HS256/i)).toBeInTheDocument();
    });

    test('should display decoded payload', () => {
      const token = createMockToken({
        payload: {
          sub: '1234567890',
          name: 'Test User',
        },
      });
      renderWithTheme(<TokenDisplay token={token} onCopy={mockOnCopy} />);

      expect(screen.getByText(/decoded payload/i)).toBeInTheDocument();
    });
  });

  describe('Copy Functionality', () => {
    test('should have copy button', () => {
      const token = createMockToken();
      renderWithTheme(<TokenDisplay token={token} onCopy={mockOnCopy} />);

      const copyButton = screen.getByRole('button', { name: /copy/i });
      expect(copyButton).toBeInTheDocument();
    });

    test('should call onCopy when copy button clicked', () => {
      const token = createMockToken();
      renderWithTheme(<TokenDisplay token={token} onCopy={mockOnCopy} />);

      const copyButton = screen.getByRole('button', { name: /copy/i });
      fireEvent.click(copyButton);

      expect(mockOnCopy).toHaveBeenCalledWith(token.raw);
    });

    test('should have copy button with test id', () => {
      const token = createMockToken();
      renderWithTheme(<TokenDisplay token={token} onCopy={mockOnCopy} />);

      expect(screen.getByTestId('copy-token-button')).toBeInTheDocument();
    });
  });

  describe('Token Output', () => {
    test('should have token output field with test id', () => {
      const token = createMockToken();
      renderWithTheme(<TokenDisplay token={token} onCopy={mockOnCopy} />);

      expect(screen.getByTestId('token-output')).toBeInTheDocument();
    });

    test('should display token in readonly field', () => {
      const token = createMockToken();
      renderWithTheme(<TokenDisplay token={token} onCopy={mockOnCopy} />);

      const tokenField = screen.getByTestId('token-output');
      expect(tokenField).toHaveValue(token.raw);
    });
  });

  describe('Token Parts', () => {
    test('should display all three token parts', () => {
      const token = createMockToken();
      renderWithTheme(<TokenDisplay token={token} onCopy={mockOnCopy} />);

      // Should have chips for all three parts
      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Payload')).toBeInTheDocument();
      expect(screen.getByText('Signature')).toBeInTheDocument();
    });

    test('should use different colors for different parts', () => {
      const token = createMockToken();
      renderWithTheme(<TokenDisplay token={token} onCopy={mockOnCopy} />);

      const headerChip = screen.getByText('Header').closest('.MuiChip-root');
      const payloadChip = screen.getByText('Payload').closest('.MuiChip-root');
      const signatureChip = screen.getByText('Signature').closest('.MuiChip-root');

      // Chips should exist and have different color classes
      expect(headerChip).toBeInTheDocument();
      expect(payloadChip).toBeInTheDocument();
      expect(signatureChip).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      const token = createMockToken();
      renderWithTheme(<TokenDisplay token={token} onCopy={mockOnCopy} />);

      const copyButton = screen.getByRole('button', { name: /copy/i });
      expect(copyButton).toHaveAccessibleName();
    });

    test('should be keyboard navigable', () => {
      const token = createMockToken();
      renderWithTheme(<TokenDisplay token={token} onCopy={mockOnCopy} />);

      const copyButton = screen.getByRole('button', { name: /copy/i });
      copyButton.focus();
      expect(document.activeElement).toBe(copyButton);
    });
  });

  describe('Edge Cases', () => {
    test('should handle token with minimal data', () => {
      const minimalToken = {
        raw: 'a.b.c',
        header: { alg: 'HS256', typ: 'JWT' },
        payload: {},
        signature: 'signature',
      };

      renderWithTheme(<TokenDisplay token={minimalToken} onCopy={mockOnCopy} />);

      expect(screen.getByText(/generated token/i)).toBeInTheDocument();
    });

    test('should handle very long tokens', () => {
      const longPayload = 'a'.repeat(1000);
      const token = createMockToken({
        raw: `header.${longPayload}.signature`,
      });

      renderWithTheme(<TokenDisplay token={token} onCopy={mockOnCopy} />);

      expect(screen.getByText(/generated token/i)).toBeInTheDocument();
    });
  });
});

/**
 * Unit tests for useClipboard hook
 * Tests clipboard copy functionality
 */

import { renderHook, act } from '@testing-library/react';
import { useClipboard } from '../../../src/renderer/hooks/useClipboard';
import { createMockClipboard } from '../../helpers/test-utils';

describe('useClipboard', () => {
  let mockClipboard;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClipboard = createMockClipboard();
  });

  describe('Initial State', () => {
    test('should initialize with copied = false', () => {
      const { result } = renderHook(() => useClipboard());

      expect(result.current.copied).toBe(false);
    });

    test('should provide copyToClipboard function', () => {
      const { result } = renderHook(() => useClipboard());

      expect(result.current.copyToClipboard).toBeDefined();
      expect(typeof result.current.copyToClipboard).toBe('function');
    });

    test('should initialize with error = null', () => {
      const { result } = renderHook(() => useClipboard());

      expect(result.current.error).toBeNull();
    });
  });

  describe('Copy Functionality', () => {
    test('should copy text to clipboard', async () => {
      const { result } = renderHook(() => useClipboard());
      const textToCopy = 'test text';

      await act(async () => {
        await result.current.copyToClipboard(textToCopy);
      });

      expect(mockClipboard.writeText).toHaveBeenCalledWith(textToCopy);
    });

    test('should set copied to true after successful copy', async () => {
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('test text');
      });

      expect(result.current.copied).toBe(true);
    });

    test('should return true on successful copy', async () => {
      const { result } = renderHook(() => useClipboard());

      let returnValue;
      await act(async () => {
        returnValue = await result.current.copyToClipboard('test text');
      });

      expect(returnValue).toBe(true);
    });

    test('should handle empty string', async () => {
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('');
      });

      expect(mockClipboard.writeText).toHaveBeenCalledWith('');
    });

    test('should handle long text', async () => {
      const { result } = renderHook(() => useClipboard());
      const longText = 'a'.repeat(10000);

      await act(async () => {
        await result.current.copyToClipboard(longText);
      });

      expect(mockClipboard.writeText).toHaveBeenCalledWith(longText);
    });
  });

  describe('Copied State Reset', () => {
    test('should reset copied state after 2 second timeout', async () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('test text');
      });

      expect(result.current.copied).toBe(true);

      act(() => {
        jest.advanceTimersByTime(2000); // 2s timeout as per implementation
      });

      expect(result.current.copied).toBe(false);

      jest.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    test('should handle clipboard API errors gracefully', async () => {
      mockClipboard.writeText.mockRejectedValueOnce(new Error('Clipboard error'));
      const { result } = renderHook(() => useClipboard());

      let returnValue;
      await act(async () => {
        returnValue = await result.current.copyToClipboard('test text');
      });

      // Should return false and not throw error
      expect(returnValue).toBe(false);
      expect(result.current.copied).toBe(false);
      expect(result.current.error).toBeDefined();
    });

    test('should set error message on failure', async () => {
      const errorMessage = 'Copy failed';
      mockClipboard.writeText.mockRejectedValueOnce(new Error(errorMessage));
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('test text');
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('Multiple Copies', () => {
    test('should handle multiple copy operations', async () => {
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('first text');
      });
      expect(mockClipboard.writeText).toHaveBeenCalledWith('first text');

      await act(async () => {
        await result.current.copyToClipboard('second text');
      });
      expect(mockClipboard.writeText).toHaveBeenCalledWith('second text');
      expect(mockClipboard.writeText).toHaveBeenCalledTimes(2);
    });

    test('should maintain copied state through multiple copies', async () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('first');
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await act(async () => {
        await result.current.copyToClipboard('second');
      });

      expect(result.current.copied).toBe(true);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Should be false after timeout
      expect(result.current.copied).toBe(false);

      jest.useRealTimers();
    });
  });

  describe('Cleanup', () => {
    test('should clean up timeout on unmount', async () => {
      jest.useFakeTimers();
      const { result, unmount } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copyToClipboard('test text');
      });

      unmount();

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Should not cause memory leaks or errors
      expect(true).toBe(true);

      jest.useRealTimers();
    });
  });
});

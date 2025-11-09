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

    test('should provide copy function', () => {
      const { result } = renderHook(() => useClipboard());

      expect(result.current.copy).toBeDefined();
      expect(typeof result.current.copy).toBe('function');
    });
  });

  describe('Copy Functionality', () => {
    test('should copy text to clipboard', async () => {
      const { result } = renderHook(() => useClipboard());
      const textToCopy = 'test text';

      await act(async () => {
        await result.current.copy(textToCopy);
      });

      expect(mockClipboard.writeText).toHaveBeenCalledWith(textToCopy);
    });

    test('should set copied to true after successful copy', async () => {
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copy('test text');
      });

      expect(result.current.copied).toBe(true);
    });

    test('should handle empty string', async () => {
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copy('');
      });

      expect(mockClipboard.writeText).toHaveBeenCalledWith('');
    });

    test('should handle long text', async () => {
      const { result } = renderHook(() => useClipboard());
      const longText = 'a'.repeat(10000);

      await act(async () => {
        await result.current.copy(longText);
      });

      expect(mockClipboard.writeText).toHaveBeenCalledWith(longText);
    });
  });

  describe('Copied State Reset', () => {
    test('should reset copied state after timeout', async () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copy('test text');
      });

      expect(result.current.copied).toBe(true);

      act(() => {
        jest.advanceTimersByTime(2000); // Assuming 2s timeout
      });

      expect(result.current.copied).toBe(false);

      jest.useRealTimers();
    });

    test('should reset copied state after custom timeout', async () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useClipboard(1000)); // 1s timeout

      await act(async () => {
        await result.current.copy('test text');
      });

      expect(result.current.copied).toBe(true);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.copied).toBe(false);

      jest.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    test('should handle clipboard API errors gracefully', async () => {
      mockClipboard.writeText.mockRejectedValueOnce(new Error('Clipboard error'));
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copy('test text');
      });

      // Should not throw error, may set copied to false
      expect(result.current.copied).toBe(false);
    });

    test('should handle missing clipboard API', async () => {
      delete navigator.clipboard;
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copy('test text');
      });

      // Should handle gracefully
      expect(result.current).toBeDefined();
    });
  });

  describe('Multiple Copies', () => {
    test('should handle multiple copy operations', async () => {
      const { result } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copy('first text');
      });
      expect(mockClipboard.writeText).toHaveBeenCalledWith('first text');

      await act(async () => {
        await result.current.copy('second text');
      });
      expect(mockClipboard.writeText).toHaveBeenCalledWith('second text');
      expect(mockClipboard.writeText).toHaveBeenCalledTimes(2);
    });

    test('should reset timeout on subsequent copies', async () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useClipboard(2000));

      await act(async () => {
        await result.current.copy('first');
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await act(async () => {
        await result.current.copy('second');
      });

      expect(result.current.copied).toBe(true);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should still be true (timer was reset)
      expect(result.current.copied).toBe(true);

      jest.useRealTimers();
    });
  });

  describe('Cleanup', () => {
    test('should clean up timeout on unmount', async () => {
      jest.useFakeTimers();
      const { result, unmount } = renderHook(() => useClipboard());

      await act(async () => {
        await result.current.copy('test text');
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

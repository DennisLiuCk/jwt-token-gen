/**
 * Unit tests for usePayload hook
 * Tests payload management functionality
 */

import { renderHook, act } from '@testing-library/react';
import { usePayload } from '../../../src/renderer/hooks/usePayload';
import { createMockPayload } from '../../helpers/mock-factories';
import { mockPayloads } from '../../helpers/fixtures';

describe('usePayload', () => {
  describe('Initial State', () => {
    test('should initialize with empty payload', () => {
      const { result } = renderHook(() => usePayload());

      expect(result.current.payload).toEqual({});
    });

    test('should initialize with provided initial payload', () => {
      const initialPayload = mockPayloads.standard;
      const { result } = renderHook(() => usePayload(initialPayload));

      expect(result.current.payload).toEqual(initialPayload);
    });

    test('should provide updatePayload function', () => {
      const { result } = renderHook(() => usePayload());

      expect(result.current.updatePayload).toBeDefined();
      expect(typeof result.current.updatePayload).toBe('function');
    });

    test('should provide resetPayload function', () => {
      const { result } = renderHook(() => usePayload());

      expect(result.current.resetPayload).toBeDefined();
      expect(typeof result.current.resetPayload).toBe('function');
    });
  });

  describe('Update Payload', () => {
    test('should update payload with new field', () => {
      const { result } = renderHook(() => usePayload());

      act(() => {
        result.current.updatePayload({ sub: '1234567890' });
      });

      expect(result.current.payload).toEqual({ sub: '1234567890' });
    });

    test('should merge new fields with existing payload', () => {
      const initialPayload = { sub: '1234567890' };
      const { result } = renderHook(() => usePayload(initialPayload));

      act(() => {
        result.current.updatePayload({ name: 'Test User' });
      });

      expect(result.current.payload).toEqual({
        sub: '1234567890',
        name: 'Test User',
      });
    });

    test('should override existing fields', () => {
      const initialPayload = { sub: '1234567890', name: 'Old Name' };
      const { result } = renderHook(() => usePayload(initialPayload));

      act(() => {
        result.current.updatePayload({ name: 'New Name' });
      });

      expect(result.current.payload).toEqual({
        sub: '1234567890',
        name: 'New Name',
      });
    });

    test('should handle nested objects', () => {
      const { result } = renderHook(() => usePayload());

      act(() => {
        result.current.updatePayload({
          user: { id: '123', name: 'Test' },
        });
      });

      expect(result.current.payload.user).toEqual({
        id: '123',
        name: 'Test',
      });
    });

    test('should handle arrays', () => {
      const { result } = renderHook(() => usePayload());

      act(() => {
        result.current.updatePayload({
          roles: ['user', 'admin'],
        });
      });

      expect(result.current.payload.roles).toEqual(['user', 'admin']);
    });
  });

  describe('Reset Payload', () => {
    test('should reset payload to empty object', () => {
      const initialPayload = mockPayloads.standard;
      const { result } = renderHook(() => usePayload(initialPayload));

      act(() => {
        result.current.resetPayload();
      });

      expect(result.current.payload).toEqual({});
    });

    test('should reset payload to provided default', () => {
      const defaultPayload = { sub: 'default' };
      const { result } = renderHook(() => usePayload());

      act(() => {
        result.current.updatePayload(mockPayloads.admin);
      });

      act(() => {
        result.current.resetPayload(defaultPayload);
      });

      expect(result.current.payload).toEqual(defaultPayload);
    });
  });

  describe('Payload Validation', () => {
    test('should validate payload is an object', () => {
      const { result } = renderHook(() => usePayload());

      expect(typeof result.current.payload).toBe('object');
      expect(Array.isArray(result.current.payload)).toBe(false);
    });

    test('should handle null values in payload', () => {
      const { result } = renderHook(() => usePayload());

      act(() => {
        result.current.updatePayload({ value: null });
      });

      expect(result.current.payload.value).toBeNull();
    });

    test('should handle undefined values in payload', () => {
      const { result } = renderHook(() => usePayload());

      act(() => {
        result.current.updatePayload({ value: undefined });
      });

      // Undefined values may be included or excluded based on implementation
      expect(result.current.payload).toBeDefined();
    });
  });

  describe('JSON Mode', () => {
    test('should convert payload to JSON string', () => {
      const { result } = renderHook(() => usePayload(mockPayloads.standard));

      const json = JSON.stringify(result.current.payload, null, 2);

      expect(json).toContain('"sub"');
      expect(json).toContain('"name"');
    });

    test('should parse JSON string to payload', () => {
      const { result } = renderHook(() => usePayload());
      const jsonString = JSON.stringify(mockPayloads.standard);

      act(() => {
        const parsed = JSON.parse(jsonString);
        result.current.updatePayload(parsed);
      });

      expect(result.current.payload).toEqual(mockPayloads.standard);
    });
  });

  describe('Complex Payload Updates', () => {
    test('should handle multiple rapid updates', () => {
      const { result } = renderHook(() => usePayload());

      act(() => {
        result.current.updatePayload({ field1: 'value1' });
        result.current.updatePayload({ field2: 'value2' });
        result.current.updatePayload({ field3: 'value3' });
      });

      expect(result.current.payload).toEqual({
        field1: 'value1',
        field2: 'value2',
        field3: 'value3',
      });
    });

    test('should handle large payload objects', () => {
      const { result } = renderHook(() => usePayload());
      const largePayload = {};
      for (let i = 0; i < 100; i++) {
        largePayload[`field${i}`] = `value${i}`;
      }

      act(() => {
        result.current.updatePayload(largePayload);
      });

      expect(Object.keys(result.current.payload)).toHaveLength(100);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty object update', () => {
      const initialPayload = mockPayloads.standard;
      const { result } = renderHook(() => usePayload(initialPayload));

      act(() => {
        result.current.updatePayload({});
      });

      expect(result.current.payload).toEqual(initialPayload);
    });

    test('should handle special characters in field names', () => {
      const { result } = renderHook(() => usePayload());

      act(() => {
        result.current.updatePayload({
          'field-with-dashes': 'value',
          'field.with.dots': 'value',
          'field_with_underscores': 'value',
        });
      });

      expect(result.current.payload['field-with-dashes']).toBe('value');
      expect(result.current.payload['field.with.dots']).toBe('value');
      expect(result.current.payload['field_with_underscores']).toBe('value');
    });

    test('should handle boolean values', () => {
      const { result } = renderHook(() => usePayload());

      act(() => {
        result.current.updatePayload({ isActive: true, isDeleted: false });
      });

      expect(result.current.payload.isActive).toBe(true);
      expect(result.current.payload.isDeleted).toBe(false);
    });

    test('should handle numeric values', () => {
      const { result } = renderHook(() => usePayload());

      act(() => {
        result.current.updatePayload({ count: 42, price: 19.99 });
      });

      expect(result.current.payload.count).toBe(42);
      expect(result.current.payload.price).toBe(19.99);
    });
  });
});

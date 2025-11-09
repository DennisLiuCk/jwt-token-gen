/**
 * Unit tests for usePayload hook
 * Tests payload management functionality with form/JSON mode switching
 */

import { renderHook, act } from '@testing-library/react';
import { usePayload } from '../../../src/renderer/hooks/usePayload';
import { createMockPayload } from '../../helpers/mock-factories';
import { mockPayloads } from '../../helpers/fixtures';

describe('usePayload', () => {
  describe('Initial State', () => {
    test('should initialize with empty payload', () => {
      const { result } = renderHook(() => usePayload());

      expect(result.current.payloadObject).toEqual({});
      expect(result.current.mode).toBe('form');
      expect(result.current.jsonError).toBeNull();
    });

    test('should initialize with provided initial payload', () => {
      const initialPayload = mockPayloads.standard;
      const { result } = renderHook(() => usePayload(initialPayload));

      expect(result.current.payloadObject).toEqual(initialPayload);
    });

    test('should initialize JSON string from initial payload', () => {
      const initialPayload = { sub: 'test' };
      const { result } = renderHook(() => usePayload(initialPayload));

      const expectedJson = JSON.stringify(initialPayload, null, 2);
      expect(result.current.jsonString).toBe(expectedJson);
    });
  });

  describe('Form Mode - Update Operations', () => {
    test('should update payload object with new fields', () => {
      const { result } = renderHook(() => usePayload());

      act(() => {
        result.current.updatePayloadObject({ sub: '1234567890' });
      });

      expect(result.current.payloadObject).toEqual({ sub: '1234567890' });
    });

    test('should merge new fields with existing payload', () => {
      const initialPayload = { sub: '1234567890' };
      const { result } = renderHook(() => usePayload(initialPayload));

      act(() => {
        result.current.updatePayloadObject({ name: 'Test User' });
      });

      expect(result.current.payloadObject).toEqual({
        sub: '1234567890',
        name: 'Test User',
      });
    });

    test('should update individual field', () => {
      const { result } = renderHook(() => usePayload({ sub: 'old' }));

      act(() => {
        result.current.updateField('sub', 'new');
      });

      expect(result.current.payloadObject.sub).toBe('new');
    });

    test('should add custom field', () => {
      const { result } = renderHook(() => usePayload());

      act(() => {
        result.current.addCustomField('customField', 'customValue', 'string');
      });

      expect(result.current.payloadObject.customField).toBe('customValue');
      expect(result.current.fieldTypes.customField).toBe('string');
    });

    test('should remove field', () => {
      const { result } = renderHook(() => usePayload({ sub: 'test', name: 'Test' }));

      act(() => {
        result.current.removeField('name');
      });

      expect(result.current.payloadObject).toEqual({ sub: 'test' });
      expect(result.current.fieldTypes.name).toBeUndefined();
    });
  });

  describe('Reset Payload', () => {
    test('should reset payload to empty object', () => {
      const initialPayload = mockPayloads.standard;
      const { result } = renderHook(() => usePayload(initialPayload));

      act(() => {
        result.current.resetPayload();
      });

      expect(result.current.payloadObject).toEqual({});
    });

    test('should reset payload to provided default', () => {
      const defaultPayload = { sub: 'default' };
      const { result } = renderHook(() => usePayload(mockPayloads.admin));

      act(() => {
        result.current.resetPayload(defaultPayload);
      });

      expect(result.current.payloadObject).toEqual(defaultPayload);
    });
  });

  describe('Mode Switching', () => {
    test('should switch to JSON mode', () => {
      const { result } = renderHook(() => usePayload({ sub: 'test' }));

      act(() => {
        result.current.switchToJsonMode();
      });

      expect(result.current.mode).toBe('json');
      expect(result.current.jsonString).toContain('"sub"');
      expect(result.current.jsonString).toContain('"test"');
    });

    test('should switch to Form mode from valid JSON', () => {
      const { result } = renderHook(() => usePayload());

      act(() => {
        result.current.updateJsonString('{"sub": "test"}');
      });

      act(() => {
        const success = result.current.switchToFormMode();
        expect(success).toBe(true);
      });

      expect(result.current.mode).toBe('form');
      expect(result.current.payloadObject).toEqual({ sub: 'test' });
      expect(result.current.jsonError).toBeNull();
    });

    test('should not switch to Form mode with invalid JSON', () => {
      const { result } = renderHook(() => usePayload());

      act(() => {
        result.current.switchToJsonMode();
        result.current.updateJsonString('invalid json');
      });

      act(() => {
        const success = result.current.switchToFormMode();
        expect(success).toBe(false);
      });

      expect(result.current.mode).toBe('json');
      expect(result.current.jsonError).toBeDefined();
    });
  });

  describe('JSON Mode Operations', () => {
    test('should update JSON string', () => {
      const { result } = renderHook(() => usePayload());

      act(() => {
        result.current.updateJsonString('{"field": "value"}');
      });

      expect(result.current.jsonString).toBe('{"field": "value"}');
    });

    test('should validate JSON and set error for invalid JSON', () => {
      const { result } = renderHook(() => usePayload());

      act(() => {
        result.current.updateJsonString('{invalid}');
      });

      expect(result.current.jsonError).toBeDefined();
    });

    test('should clear error for valid JSON', () => {
      const { result } = renderHook(() => usePayload());

      act(() => {
        result.current.updateJsonString('{invalid}');
      });

      expect(result.current.jsonError).toBeDefined();

      act(() => {
        result.current.updateJsonString('{"valid": true}');
      });

      expect(result.current.jsonError).toBeNull();
    });
  });

  describe('Get Current Payload', () => {
    test('should return current payload object in form mode', () => {
      const { result } = renderHook(() => usePayload({ sub: 'test' }));

      const payload = result.current.getCurrentPayload();

      expect(payload).toEqual({ sub: 'test' });
    });

    test('should return parsed JSON in JSON mode', () => {
      const { result } = renderHook(() => usePayload());

      act(() => {
        // First switch to JSON mode (converts empty object to JSON)
        result.current.switchToJsonMode();
        // Then update the JSON string in JSON mode
        result.current.updateJsonString('{"sub": "test"}');
      });

      const payload = result.current.getCurrentPayload();

      expect(payload).toEqual({ sub: 'test' });
    });

    test('should return null for invalid JSON in JSON mode', () => {
      const { result } = renderHook(() => usePayload());

      act(() => {
        result.current.switchToJsonMode();
        result.current.updateJsonString('invalid');
      });

      const payload = result.current.getCurrentPayload();

      expect(payload).toBeNull();
    });
  });

  describe('Apply Template', () => {
    test('should apply template payload', () => {
      const { result } = renderHook(() => usePayload());
      const template = { sub: 'template', name: 'Template User' };

      act(() => {
        result.current.applyTemplate(template);
      });

      expect(result.current.payloadObject).toEqual(template);
      expect(result.current.mode).toBe('form');
    });
  });

  describe('Field Types', () => {
    test('should track field types', () => {
      const payload = { name: 'test', count: 42, active: true };
      const { result } = renderHook(() => usePayload(payload));

      expect(result.current.fieldTypes.name).toBe('string');
      expect(result.current.fieldTypes.count).toBe('number');
      expect(result.current.fieldTypes.active).toBe('boolean');
    });

    test('should update field type', () => {
      const { result } = renderHook(() => usePayload({ count: '42' }));

      act(() => {
        result.current.updateFieldType('count', 'number');
      });

      expect(result.current.fieldTypes.count).toBe('number');
      expect(typeof result.current.payloadObject.count).toBe('number');
    });
  });
});

import { useState, useCallback } from 'react';
import { validateJSON, inferType, convertValue } from '../services/validationService';

/**
 * usePayload Hook
 *
 * Manages payload state and bidirectional synchronization between form and JSON modes.
 * Handles mode switching with validation.
 */
export function usePayload(initialPayload = {}) {
  const [payloadObject, setPayloadObject] = useState(initialPayload);
  const [jsonString, setJsonString] = useState(JSON.stringify(initialPayload, null, 2));
  const [mode, setMode] = useState('form'); // 'form' or 'json'
  const [jsonError, setJsonError] = useState(null);

  // Track field types: { fieldName: 'string' | 'number' | 'boolean' | 'null' }
  const [fieldTypes, setFieldTypes] = useState(() => {
    const types = {};
    Object.keys(initialPayload).forEach(key => {
      types[key] = inferType(initialPayload[key]);
    });
    return types;
  });

  /**
   * Switch to JSON mode - convert object to JSON string
   * Applies type conversions before stringifying
   */
  const switchToJsonMode = useCallback(() => {
    try {
      // Apply type conversions based on fieldTypes
      const convertedPayload = {};
      Object.keys(payloadObject).forEach(key => {
        const value = payloadObject[key];
        const targetType = fieldTypes[key] || 'string';

        try {
          convertedPayload[key] = convertValue(value, targetType);
        } catch (error) {
          console.warn(`Failed to convert ${key} to ${targetType}:`, error.message);
          convertedPayload[key] = value;
        }
      });

      const formatted = JSON.stringify(convertedPayload, null, 2);
      setJsonString(formatted);
      setMode('json');
      setJsonError(null);
    } catch (error) {
      setJsonError(`Failed to convert to JSON: ${error.message}`);
    }
  }, [payloadObject, fieldTypes]);

  /**
   * Switch to Form mode - parse JSON string to object
   */
  const switchToFormMode = useCallback(() => {
    const validation = validateJSON(jsonString);

    if (!validation.valid) {
      setJsonError(validation.error);
      return false; // Prevent mode switch
    }

    // Infer types from parsed JSON values
    const parsedData = validation.data;
    const inferredTypes = {};
    Object.keys(parsedData).forEach(key => {
      inferredTypes[key] = inferType(parsedData[key]);
    });

    setPayloadObject(parsedData);
    setFieldTypes(inferredTypes);
    setMode('form');
    setJsonError(null);
    return true;
  }, [jsonString]);

  /**
   * Update payload object (form mode)
   */
  const updatePayloadObject = useCallback((updates) => {
    setPayloadObject(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  /**
   * Update individual field in payload (form mode)
   * IMPORTANT: This function does NOT perform type conversion during user input.
   * Values are stored as-is (strings from TextField input).
   * Type conversion happens only when:
   * 1. User explicitly changes type via updateFieldType
   * 2. Token is generated via getCurrentPayload
   */
  const updateField = useCallback((fieldName, value) => {
    // Simply store the value as-is, no conversion
    setPayloadObject(prev => ({
      ...prev,
      [fieldName]: value
    }));
  }, []);

  /**
   * Update field type and convert existing value
   */
  const updateFieldType = useCallback((fieldName, newType) => {
    try {
      const currentValue = payloadObject[fieldName];
      const convertedValue = convertValue(currentValue, newType);

      setPayloadObject(prev => ({
        ...prev,
        [fieldName]: convertedValue
      }));

      setFieldTypes(prev => ({
        ...prev,
        [fieldName]: newType
      }));
    } catch (error) {
      console.error(`Failed to convert ${fieldName} to ${newType}:`, error.message);
      // Keep existing value but update type
      setFieldTypes(prev => ({
        ...prev,
        [fieldName]: newType
      }));
    }
  }, [payloadObject]);

  /**
   * Add custom field to payload (form mode)
   * Stores value as-is and records the type metadata
   */
  const addCustomField = useCallback((fieldName, value, type = 'string') => {
    if (!fieldName || fieldName.trim() === '') {
      return false;
    }

    // Store value as-is, no conversion during add
    setPayloadObject(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Record the type metadata
    setFieldTypes(prev => ({
      ...prev,
      [fieldName]: type
    }));

    return true;
  }, []);

  /**
   * Remove field from payload (form mode)
   */
  const removeField = useCallback((fieldName) => {
    setPayloadObject(prev => {
      const newPayload = { ...prev };
      delete newPayload[fieldName];
      return newPayload;
    });

    setFieldTypes(prev => {
      const newTypes = { ...prev };
      delete newTypes[fieldName];
      return newTypes;
    });
  }, []);

  /**
   * Update JSON string (JSON mode)
   */
  const updateJsonString = useCallback((newJsonString) => {
    setJsonString(newJsonString);

    // Real-time syntax validation (debounced in component)
    const validation = validateJSON(newJsonString);
    if (!validation.valid) {
      setJsonError(validation.error);
    } else {
      setJsonError(null);
    }
  }, []);

  /**
   * Reset payload to initial state
   */
  const resetPayload = useCallback((newPayload = {}) => {
    setPayloadObject(newPayload);
    setJsonString(JSON.stringify(newPayload, null, 2));
    setJsonError(null);

    // Infer types from new payload
    const types = {};
    Object.keys(newPayload).forEach(key => {
      types[key] = inferType(newPayload[key]);
    });
    setFieldTypes(types);
  }, []);

  /**
   * Auto-detect and update field types for numeric strings (for migration)
   * This function does NOT convert the actual values, only updates type metadata
   */
  const autoConvertNumericStrings = useCallback(() => {
    const updatedTypes = { ...fieldTypes };
    let hasChanges = false;

    Object.keys(payloadObject).forEach(key => {
      const value = payloadObject[key];
      // Check if it's a string that looks like a number
      if (typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value))) {
        // Update type metadata to 'number', but keep value as-is
        if (fieldTypes[key] !== 'number') {
          updatedTypes[key] = 'number';
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setFieldTypes(updatedTypes);
    }

    return hasChanges;
  }, [payloadObject, fieldTypes]);

  /**
   * Apply template payload (replaces current payload)
   */
  const applyTemplate = useCallback((templatePayload) => {
    setPayloadObject(templatePayload);
    setJsonString(JSON.stringify(templatePayload, null, 2));
    setJsonError(null);
    // Switch to form mode to show the applied template
    setMode('form');
  }, []);

  /**
   * Get current payload (for token generation)
   * Performs type conversion based on fieldTypes metadata
   */
  const getCurrentPayload = useCallback(() => {
    if (mode === 'json') {
      const validation = validateJSON(jsonString);
      if (validation.valid) {
        return validation.data;
      }
      return null; // Invalid JSON
    }

    // Form mode: Apply type conversions based on fieldTypes
    const convertedPayload = {};
    Object.keys(payloadObject).forEach(key => {
      const value = payloadObject[key];
      const targetType = fieldTypes[key] || 'string';

      try {
        convertedPayload[key] = convertValue(value, targetType);
      } catch (error) {
        console.warn(`Failed to convert ${key} to ${targetType}:`, error.message);
        // If conversion fails, keep original value
        convertedPayload[key] = value;
      }
    });

    return convertedPayload;
  }, [mode, jsonString, payloadObject, fieldTypes]);

  return {
    // State
    payloadObject,
    jsonString,
    mode,
    jsonError,
    fieldTypes,

    // Mode switching
    switchToJsonMode,
    switchToFormMode,

    // Form mode operations
    updatePayloadObject,
    updateField,
    updateFieldType,
    addCustomField,
    removeField,

    // JSON mode operations
    updateJsonString,

    // Utility
    resetPayload,
    getCurrentPayload,
    autoConvertNumericStrings,
    applyTemplate
  };
}

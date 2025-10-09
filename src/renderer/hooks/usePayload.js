import { useState, useCallback } from 'react';
import { validateJSON } from '../services/validationService';

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

  /**
   * Switch to JSON mode - convert object to JSON string
   */
  const switchToJsonMode = useCallback(() => {
    try {
      const formatted = JSON.stringify(payloadObject, null, 2);
      setJsonString(formatted);
      setMode('json');
      setJsonError(null);
    } catch (error) {
      setJsonError(`Failed to convert to JSON: ${error.message}`);
    }
  }, [payloadObject]);

  /**
   * Switch to Form mode - parse JSON string to object
   */
  const switchToFormMode = useCallback(() => {
    const validation = validateJSON(jsonString);

    if (!validation.valid) {
      setJsonError(validation.error);
      return false; // Prevent mode switch
    }

    setPayloadObject(validation.data);
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
   */
  const updateField = useCallback((fieldName, value) => {
    setPayloadObject(prev => ({
      ...prev,
      [fieldName]: value
    }));
  }, []);

  /**
   * Add custom field to payload (form mode)
   */
  const addCustomField = useCallback((fieldName, value) => {
    if (!fieldName || fieldName.trim() === '') {
      return false;
    }

    setPayloadObject(prev => ({
      ...prev,
      [fieldName]: value
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
  }, []);

  /**
   * Get current payload (for token generation)
   */
  const getCurrentPayload = useCallback(() => {
    if (mode === 'json') {
      const validation = validateJSON(jsonString);
      if (validation.valid) {
        return validation.data;
      }
      return null; // Invalid JSON
    }
    return payloadObject;
  }, [mode, jsonString, payloadObject]);

  return {
    // State
    payloadObject,
    jsonString,
    mode,
    jsonError,

    // Mode switching
    switchToJsonMode,
    switchToFormMode,

    // Form mode operations
    updatePayloadObject,
    updateField,
    addCustomField,
    removeField,

    // JSON mode operations
    updateJsonString,

    // Utility
    resetPayload,
    getCurrentPayload
  };
}

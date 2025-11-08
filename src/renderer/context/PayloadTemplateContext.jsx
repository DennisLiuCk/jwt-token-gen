import React, { createContext, useContext, useState, useEffect } from 'react';

const PayloadTemplateContext = createContext();

export function usePayloadTemplate() {
  const context = useContext(PayloadTemplateContext);
  if (!context) {
    throw new Error('usePayloadTemplate must be used within PayloadTemplateProvider');
  }
  return context;
}

export function PayloadTemplateProvider({ children }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      setLoading(true);
      setError(null);
      const result = await window.electronAPI.loadPayloadTemplates();
      if (result.success) {
        setTemplates(result.data);
      } else {
        setError(result.error || 'Failed to load payload templates');
      }
    } catch (err) {
      setError(`Error loading templates: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function createTemplate(templateData) {
    try {
      // Validate template count
      if (templates.length >= 30) {
        setError('Maximum payload template limit (30) reached');
        return null;
      }

      // Check for duplicate names
      if (templates.some(t => t.name === templateData.name)) {
        setError('A template with this name already exists');
        return null;
      }

      // Create template object
      const newTemplate = {
        id: crypto.randomUUID(),
        name: templateData.name,
        description: templateData.description || '',
        payload: templateData.payload || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await window.electronAPI.savePayloadTemplate(newTemplate);
      if (result.success) {
        await loadTemplates();
        return result.data;
      } else {
        setError(result.error);
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function updateTemplate(templateId, updates) {
    try {
      const existingTemplate = templates.find(t => t.id === templateId);
      if (!existingTemplate) {
        setError('Template not found');
        return null;
      }

      // Check for duplicate names (excluding current template)
      if (updates.name && updates.name !== existingTemplate.name) {
        if (templates.some(t => t.name === updates.name && t.id !== templateId)) {
          setError('A template with this name already exists');
          return null;
        }
      }

      const updatedTemplate = {
        ...existingTemplate,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const result = await window.electronAPI.savePayloadTemplate(updatedTemplate);
      if (result.success) {
        await loadTemplates();
        return result.data;
      } else {
        setError(result.error);
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function deleteTemplate(templateId) {
    try {
      const result = await window.electronAPI.deletePayloadTemplate(templateId);
      if (result.success) {
        await loadTemplates();
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  const value = {
    templates,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    loading,
    error,
    setError
  };

  return (
    <PayloadTemplateContext.Provider value={value}>
      {children}
    </PayloadTemplateContext.Provider>
  );
}

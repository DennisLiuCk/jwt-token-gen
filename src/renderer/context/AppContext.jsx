import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

export function AppProvider({ children }) {
  const [settings, setSettings] = useState({
    lastSelectedProfileId: null,
    version: '1.0.0',
    theme: 'light',
    windowBounds: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const result = await window.electronAPI.getSettings();
      if (result.success) {
        setSettings(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings(newSettings) {
    try {
      const result = await window.electronAPI.saveSettings(newSettings);
      if (result.success) {
        setSettings(result.data);
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
    settings,
    saveSettings,
    loading,
    error,
    setError
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

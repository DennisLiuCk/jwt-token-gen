import React, { createContext, useContext, useState, useEffect } from 'react';

const TokenHistoryContext = createContext();

export function useTokenHistory() {
  const context = useContext(TokenHistoryContext);
  if (!context) {
    throw new Error('useTokenHistory must be used within TokenHistoryProvider');
  }
  return context;
}

export function TokenHistoryProvider({ children }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setLoading(true);
      setError(null);
      const result = await window.electronAPI.loadTokenHistory();
      if (result.success) {
        setHistory(result.data);
      } else {
        setError(result.error || 'Failed to load token history');
      }
    } catch (err) {
      setError(`Error loading token history: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function addToHistory(historyEntry) {
    try {
      setError(null);
      const result = await window.electronAPI.addTokenHistory(historyEntry);
      if (result.success) {
        // Reload history to get updated list
        await loadHistory();
        return result.data;
      } else {
        setError(result.error || 'Failed to add to token history');
        return null;
      }
    } catch (err) {
      setError(`Error adding to token history: ${err.message}`);
      return null;
    }
  }

  async function clearHistory() {
    try {
      setError(null);
      const result = await window.electronAPI.clearTokenHistory();
      if (result.success) {
        setHistory([]);
        return true;
      } else {
        setError(result.error || 'Failed to clear token history');
        return false;
      }
    } catch (err) {
      setError(`Error clearing token history: ${err.message}`);
      return false;
    }
  }

  const value = {
    history,
    loading,
    error,
    addToHistory,
    clearHistory,
    refreshHistory: loadHistory
  };

  return (
    <TokenHistoryContext.Provider value={value}>
      {children}
    </TokenHistoryContext.Provider>
  );
}

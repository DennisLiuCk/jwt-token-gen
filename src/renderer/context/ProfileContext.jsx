import React, { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext();

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
}

export function ProfileProvider({ children }) {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    try {
      setLoading(true);
      const result = await window.electronAPI.loadProfiles();
      if (result.success) {
        setProfiles(result.data);
        // Auto-select first profile if available
        if (result.data.length > 0 && !selectedProfile) {
          setSelectedProfile(result.data[0]);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(profile) {
    try {
      const result = await window.electronAPI.saveProfile(profile);
      if (result.success) {
        await loadProfiles();
        setHasUnsavedChanges(false);
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

  async function deleteProfile(profileId) {
    try {
      const result = await window.electronAPI.deleteProfile(profileId);
      if (result.success) {
        await loadProfiles();
        if (selectedProfile?.id === profileId) {
          setSelectedProfile(profiles[0] || null);
        }
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

  function selectProfile(profile) {
    if (hasUnsavedChanges) {
      // Should show warning dialog before switching
      return false;
    }
    setSelectedProfile(profile);
    return true;
  }

  const value = {
    profiles,
    selectedProfile,
    selectProfile,
    loadProfiles,
    saveProfile,
    deleteProfile,
    loading,
    error,
    setError,
    hasUnsavedChanges,
    setHasUnsavedChanges
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

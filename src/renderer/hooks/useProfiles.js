import { useState, useEffect } from 'react';
import ipcService from '../services/ipcService';

/**
 * Custom hook for profile management
 * @returns {Object} Profile state and operations
 */
export function useProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    try {
      setLoading(true);
      setError(null);
      const data = await ipcService.loadProfiles();
      setProfiles(data);

      // Auto-select first profile if none selected
      if (data.length > 0 && !selectedProfile) {
        setSelectedProfile(data[0]);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to load profiles:', err);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(profile) {
    try {
      setError(null);
      const saved = await ipcService.saveProfile(profile);
      await loadProfiles();
      return saved;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function deleteProfile(profileId) {
    try {
      setError(null);
      await ipcService.deleteProfile(profileId);
      await loadProfiles();

      // If deleted profile was selected, select first available
      if (selectedProfile?.id === profileId) {
        setSelectedProfile(profiles[0] || null);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  function selectProfile(profile) {
    setSelectedProfile(profile);
  }

  return {
    profiles,
    selectedProfile,
    selectProfile,
    loadProfiles,
    saveProfile,
    deleteProfile,
    loading,
    error
  };
}

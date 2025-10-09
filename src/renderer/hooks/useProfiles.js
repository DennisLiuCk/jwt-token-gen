import { useState, useEffect } from 'react';
import ipcService from '../services/ipcService';

/**
 * Custom hook for profile management
 * @returns {Object} Object containing:
 *   - profiles: Array of all profiles
 *   - selectedProfile: Currently selected profile object
 *   - selectProfile: Function to select a profile
 *   - loadProfiles: Function to reload profiles from storage
 *   - saveProfile: Function to save a profile
 *   - deleteProfile: Function to delete a profile
 *   - loading: Boolean indicating if profiles are loading
 *   - error: Error message if operation failed
 */
export function useProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  /**
   * Load all profiles from storage via IPC
   */
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
      // Profile loading error stored in state for display
    } finally {
      setLoading(false);
    }
  }

  /**
   * Save a profile to storage via IPC
   * @param {Object} profile - The profile object to save
   * @returns {Promise<Object>} The saved profile
   */
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

  /**
   * Delete a profile from storage via IPC
   * @param {string} profileId - The ID of the profile to delete
   */
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

  /**
   * Select a profile as the current profile
   * @param {Object} profile - The profile to select
   */
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

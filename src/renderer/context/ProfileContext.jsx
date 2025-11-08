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
      setError(null);
      const result = await window.electronAPI.loadProfiles();
      if (result.success) {
        setProfiles(result.data);
        // Auto-select first profile if available
        if (result.data.length > 0 && !selectedProfile) {
          setSelectedProfile(result.data[0]);
        }
      } else {
        setError(result.error || 'Failed to load profiles');
      }
    } catch (err) {
      setError(`Error loading profiles: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function createProfile(profileData) {
    try {
      // Validate profile count
      if (profiles.length >= 50) {
        setError('Maximum profile limit (50) reached');
        return null;
      }

      // Check for duplicate names
      if (profiles.some(p => p.name === profileData.name)) {
        setError('A profile with this name already exists');
        return null;
      }

      // Encrypt the key if provided
      let encryptedKey = '';
      if (profileData.key) {
        const encryptResult = await window.electronAPI.encryptKey(profileData.key);
        if (encryptResult.success) {
          encryptedKey = encryptResult.data;
        } else {
          setError('Failed to encrypt key: ' + encryptResult.error);
          return null;
        }
      }

      // Create profile object
      const newProfile = {
        id: crypto.randomUUID(),
        name: profileData.name,
        algorithm: profileData.algorithm,
        encryptedKey,
        payload: profileData.payload || {},
        expirationPreset: profileData.expirationPreset || '1h',
        customExpiration: profileData.customExpiration || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await window.electronAPI.saveProfile(newProfile);
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

  async function updateProfile(profileId, updates) {
    try {
      const existingProfile = profiles.find(p => p.id === profileId);
      if (!existingProfile) {
        setError('Profile not found');
        return null;
      }

      // Check for duplicate names (excluding current profile)
      if (updates.name && updates.name !== existingProfile.name) {
        if (profiles.some(p => p.name === updates.name && p.id !== profileId)) {
          setError('A profile with this name already exists');
          return null;
        }
      }

      // Encrypt new key if provided
      let encryptedKey = existingProfile.encryptedKey;
      if (updates.key) {
        const encryptResult = await window.electronAPI.encryptKey(updates.key);
        if (encryptResult.success) {
          encryptedKey = encryptResult.data;
        } else {
          setError('Failed to encrypt key: ' + encryptResult.error);
          return null;
        }
      }

      // Prepare updates object (remove empty/undefined key field)
      const cleanedUpdates = { ...updates };
      if (!cleanedUpdates.key) {
        delete cleanedUpdates.key;
      }

      // Merge updates with existing profile
      const updatedProfile = {
        ...existingProfile,
        ...cleanedUpdates,
        encryptedKey,
        updatedAt: new Date().toISOString()
      };

      // Remove the plaintext key if it was included
      delete updatedProfile.key;

      const result = await window.electronAPI.saveProfile(updatedProfile);
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

  async function duplicateProfile(profileId) {
    try {
      const original = profiles.find(p => p.id === profileId);
      if (!original) {
        setError('Profile not found');
        return null;
      }

      // Create a copy with new ID and name
      const newProfile = {
        ...original,
        id: crypto.randomUUID(),
        name: `${original.name} (Copy)`,
        encryptedKey: '', // Security: don't copy encrypted key
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await window.electronAPI.saveProfile(newProfile);
      if (result.success) {
        await loadProfiles();
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

  async function toggleFavorite(profileId) {
    try {
      const profile = profiles.find(p => p.id === profileId);
      if (!profile) {
        setError('Profile not found');
        return false;
      }

      const updated = {
        ...profile,
        isFavorite: !profile.isFavorite
      };

      const result = await window.electronAPI.saveProfile(updated);
      if (result.success) {
        await loadProfiles();
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

  async function toggleTemplate(profileId) {
    try {
      const profile = profiles.find(p => p.id === profileId);
      if (!profile) {
        setError('Profile not found');
        return false;
      }

      const updated = {
        ...profile,
        isTemplate: !profile.isTemplate
      };

      const result = await window.electronAPI.saveProfile(updated);
      if (result.success) {
        await loadProfiles();
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

  async function selectProfile(profile, force = false) {
    if (hasUnsavedChanges && !force) {
      // Caller should handle showing warning dialog
      return false;
    }

    setSelectedProfile(profile);
    setHasUnsavedChanges(false);

    // Track as recently used
    if (profile && profile.id) {
      try {
        await window.electronAPI.addRecentProfile(profile.id);
      } catch (err) {
        console.error('Failed to update recent profiles:', err);
      }
    }

    return true;
  }

  function discardChanges() {
    setHasUnsavedChanges(false);
  }

  const value = {
    profiles,
    selectedProfile,
    selectProfile,
    loadProfiles,
    createProfile,
    updateProfile,
    deleteProfile,
    duplicateProfile,
    toggleFavorite,
    toggleTemplate,
    loading,
    error,
    setError,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    discardChanges
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

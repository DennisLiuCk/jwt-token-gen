/**
 * IPC Service - Wraps electronAPI calls with error handling
 */

export class IPCService {
  // Profile operations
  async loadProfiles() {
    try {
      const result = await window.electronAPI.loadProfiles();
      if (!result.success) {
        throw new Error(result.error || 'Failed to load profiles');
      }
      return result.data;
    } catch (error) {
      console.error('IPC loadProfiles error:', error);
      throw new Error('Unable to load profiles. Please restart the application.');
    }
  }

  async getProfile(profileId) {
    try {
      const result = await window.electronAPI.getProfile(profileId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to get profile');
      }
      return result.data;
    } catch (error) {
      console.error('IPC getProfile error:', error);
      throw new Error('Unable to load profile.');
    }
  }

  async saveProfile(profile) {
    try {
      const result = await window.electronAPI.saveProfile(profile);
      if (!result.success) {
        throw new Error(result.error || 'Failed to save profile');
      }
      return result.data;
    } catch (error) {
      console.error('IPC saveProfile error:', error);
      throw new Error('Unable to save profile.');
    }
  }

  async deleteProfile(profileId) {
    try {
      const result = await window.electronAPI.deleteProfile(profileId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete profile');
      }
      return true;
    } catch (error) {
      console.error('IPC deleteProfile error:', error);
      throw new Error('Unable to delete profile.');
    }
  }

  // Crypto operations
  async encryptKey(plaintextKey) {
    try {
      const result = await window.electronAPI.encryptKey(plaintextKey);
      if (!result.success) {
        throw new Error(result.error || 'Failed to encrypt key');
      }
      return result.data;
    } catch (error) {
      console.error('IPC encryptKey error:', error);
      throw new Error('Unable to encrypt key.');
    }
  }

  async decryptKey(encryptedKey) {
    try {
      const result = await window.electronAPI.decryptKey(encryptedKey);
      if (!result.success) {
        throw new Error(result.error || 'Failed to decrypt key');
      }
      return result.data;
    } catch (error) {
      console.error('IPC decryptKey error:', error);
      throw new Error('Unable to decrypt key. This profile may have been created on a different machine.');
    }
  }

  // Settings operations
  async getSettings() {
    try {
      const result = await window.electronAPI.getSettings();
      if (!result.success) {
        throw new Error(result.error || 'Failed to get settings');
      }
      return result.data;
    } catch (error) {
      console.error('IPC getSettings error:', error);
      throw new Error('Unable to load settings.');
    }
  }

  async saveSettings(settings) {
    try {
      const result = await window.electronAPI.saveSettings(settings);
      if (!result.success) {
        throw new Error(result.error || 'Failed to save settings');
      }
      return result.data;
    } catch (error) {
      console.error('IPC saveSettings error:', error);
      throw new Error('Unable to save settings.');
    }
  }
}

// Export singleton instance
export default new IPCService();

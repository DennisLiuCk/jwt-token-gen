/**
 * IPC Service - Wraps electronAPI calls with error handling
 * Provides a clean interface for renderer process to communicate with main process.
 * All methods return user-friendly error messages and handle IPC failures gracefully.
 */

export class IPCService {
  /**
   * Load all profiles from storage
   * @returns {Promise<Array>} Array of profile objects
   * @throws {Error} User-friendly error message if loading fails
   */
  async loadProfiles() {
    try {
      const result = await window.electronAPI.loadProfiles();
      if (!result.success) {
        throw new Error(result.error || 'Failed to load profiles');
      }
      return result.data;
    } catch (error) {
      throw new Error('Unable to load profiles. Please restart the application.');
    }
  }

  /**
   * Get a specific profile by ID
   * @param {string} profileId - The profile ID to retrieve
   * @returns {Promise<Object>} The profile object
   * @throws {Error} User-friendly error message if retrieval fails
   */
  async getProfile(profileId) {
    try {
      const result = await window.electronAPI.getProfile(profileId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to get profile');
      }
      return result.data;
    } catch (error) {
      throw new Error('Unable to load profile.');
    }
  }

  /**
   * Save a profile to storage (create or update)
   * @param {Object} profile - The profile object to save
   * @returns {Promise<Object>} The saved profile object
   * @throws {Error} User-friendly error message if save fails
   */
  async saveProfile(profile) {
    try {
      const result = await window.electronAPI.saveProfile(profile);
      if (!result.success) {
        throw new Error(result.error || 'Failed to save profile');
      }
      return result.data;
    } catch (error) {
      throw new Error('Unable to save profile.');
    }
  }

  /**
   * Delete a profile from storage
   * @param {string} profileId - The ID of the profile to delete
   * @returns {Promise<boolean>} True if deletion successful
   * @throws {Error} User-friendly error message if deletion fails
   */
  async deleteProfile(profileId) {
    try {
      const result = await window.electronAPI.deleteProfile(profileId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete profile');
      }
      return true;
    } catch (error) {
      throw new Error('Unable to delete profile.');
    }
  }

  /**
   * Encrypt a key using Windows DPAPI
   * @param {string} plaintextKey - The plaintext key to encrypt
   * @returns {Promise<string>} Base64-encoded encrypted key
   * @throws {Error} User-friendly error message if encryption fails
   */
  async encryptKey(plaintextKey) {
    try {
      const result = await window.electronAPI.encryptKey(plaintextKey);
      if (!result.success) {
        throw new Error(result.error || 'Failed to encrypt key');
      }
      return result.data;
    } catch (error) {
      throw new Error('Unable to encrypt key.');
    }
  }

  /**
   * Decrypt a key using Windows DPAPI
   * @param {string} encryptedKey - The Base64-encoded encrypted key
   * @returns {Promise<string>} The decrypted plaintext key
   * @throws {Error} User-friendly error message if decryption fails
   */
  async decryptKey(encryptedKey) {
    try {
      const result = await window.electronAPI.decryptKey(encryptedKey);
      if (!result.success) {
        throw new Error(result.error || 'Failed to decrypt key');
      }
      return result.data;
    } catch (error) {
      throw new Error('Unable to decrypt key. This profile may have been created on a different machine.');
    }
  }

  /**
   * Get application settings
   * @returns {Promise<Object>} The settings object
   * @throws {Error} User-friendly error message if retrieval fails
   */
  async getSettings() {
    try {
      const result = await window.electronAPI.getSettings();
      if (!result.success) {
        throw new Error(result.error || 'Failed to get settings');
      }
      return result.data;
    } catch (error) {
      throw new Error('Unable to load settings.');
    }
  }

  /**
   * Save application settings
   * @param {Object} settings - The settings object to save
   * @returns {Promise<Object>} The saved settings object
   * @throws {Error} User-friendly error message if save fails
   */
  async saveSettings(settings) {
    try {
      const result = await window.electronAPI.saveSettings(settings);
      if (!result.success) {
        throw new Error(result.error || 'Failed to save settings');
      }
      return result.data;
    } catch (error) {
      throw new Error('Unable to save settings.');
    }
  }
}

/**
 * Singleton instance of IPCService
 * @type {IPCService}
 */
export default new IPCService();

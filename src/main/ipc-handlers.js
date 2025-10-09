/**
 * IPC Handlers Module
 * Registers all IPC communication handlers between main and renderer processes.
 * Handles profile operations, crypto operations, and settings management.
 */

const { ipcMain } = require('electron');
const storage = require('./storage');
const crypto = require('./crypto');

/**
 * Register all IPC handlers for the application
 * Should be called once when the app is ready
 */
function registerHandlers() {
  // Initialize default profiles on first launch
  storage.initializeDefaultProfiles();

  // Profile operations
  ipcMain.handle('profiles:load', async () => {
    try {
      const profiles = storage.getAllProfiles();
      return { success: true, data: profiles };
    } catch (error) {
      console.error('Failed to load profiles:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('profiles:get', async (event, profileId) => {
    try {
      const profile = storage.getProfileById(profileId);
      if (!profile) {
        return { success: false, error: 'Profile not found' };
      }
      return { success: true, data: profile };
    } catch (error) {
      console.error('Failed to get profile:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('profiles:save', async (event, profile) => {
    try {
      const saved = storage.saveProfile(profile);
      return { success: true, data: saved };
    } catch (error) {
      console.error('Failed to save profile:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('profiles:delete', async (event, profileId) => {
    try {
      storage.deleteProfile(profileId);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete profile:', error);
      return { success: false, error: error.message };
    }
  });

  // Crypto operations
  ipcMain.handle('crypto:encrypt', async (event, plaintextKey) => {
    try {
      const encrypted = crypto.encryptKey(plaintextKey);
      return { success: true, data: encrypted };
    } catch (error) {
      console.error('Failed to encrypt key:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('crypto:decrypt', async (event, encryptedKey) => {
    try {
      const decrypted = crypto.decryptKey(encryptedKey);
      return { success: true, data: decrypted };
    } catch (error) {
      console.error('Failed to decrypt key:', error);
      return { success: false, error: error.message };
    }
  });

  // Settings operations
  ipcMain.handle('settings:get', async () => {
    try {
      const settings = storage.getSettings();
      return { success: true, data: settings };
    } catch (error) {
      console.error('Failed to get settings:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('settings:save', async (event, settings) => {
    try {
      const saved = storage.saveSettings(settings);
      return { success: true, data: saved };
    } catch (error) {
      console.error('Failed to save settings:', error);
      return { success: false, error: error.message };
    }
  });
}

module.exports = { registerHandlers };

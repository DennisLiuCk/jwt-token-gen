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

  // Recent profiles operations
  ipcMain.handle('profiles:addRecent', async (event, profileId) => {
    try {
      const recentIds = storage.addToRecentProfiles(profileId);
      return { success: true, data: recentIds };
    } catch (error) {
      console.error('Failed to add to recent profiles:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('profiles:getRecent', async () => {
    try {
      const recentProfiles = storage.getRecentProfiles();
      return { success: true, data: recentProfiles };
    } catch (error) {
      console.error('Failed to get recent profiles:', error);
      return { success: false, error: error.message };
    }
  });

  // Payload template operations
  ipcMain.handle('payloadTemplates:load', async () => {
    try {
      const templates = storage.getAllPayloadTemplates();
      return { success: true, data: templates };
    } catch (error) {
      console.error('Failed to load payload templates:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('payloadTemplates:get', async (event, templateId) => {
    try {
      const template = storage.getPayloadTemplateById(templateId);
      if (!template) {
        return { success: false, error: 'Payload template not found' };
      }
      return { success: true, data: template };
    } catch (error) {
      console.error('Failed to get payload template:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('payloadTemplates:save', async (event, template) => {
    try {
      const saved = storage.savePayloadTemplate(template);
      return { success: true, data: saved };
    } catch (error) {
      console.error('Failed to save payload template:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('payloadTemplates:delete', async (event, templateId) => {
    try {
      storage.deletePayloadTemplate(templateId);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete payload template:', error);
      return { success: false, error: error.message };
    }
  });

  // P3.1: Token History operations
  ipcMain.handle('tokenHistory:load', async () => {
    try {
      const history = storage.getAllTokenHistory();
      return { success: true, data: history };
    } catch (error) {
      console.error('Failed to load token history:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('tokenHistory:add', async (event, historyEntry) => {
    try {
      const added = storage.addTokenHistory(historyEntry);
      return { success: true, data: added };
    } catch (error) {
      console.error('Failed to add token history:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('tokenHistory:clear', async () => {
    try {
      storage.clearTokenHistory();
      return { success: true };
    } catch (error) {
      console.error('Failed to clear token history:', error);
      return { success: false, error: error.message };
    }
  });

  // P3.2: Profile Groups operations
  ipcMain.handle('profileGroups:load', async () => {
    try {
      const groups = storage.getAllProfileGroups();
      return { success: true, data: groups };
    } catch (error) {
      console.error('Failed to load profile groups:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('profileGroups:get', async (event, groupId) => {
    try {
      const group = storage.getProfileGroupById(groupId);
      if (!group) {
        return { success: false, error: 'Profile group not found' };
      }
      return { success: true, data: group };
    } catch (error) {
      console.error('Failed to get profile group:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('profileGroups:save', async (event, group) => {
    try {
      const saved = storage.saveProfileGroup(group);
      return { success: true, data: saved };
    } catch (error) {
      console.error('Failed to save profile group:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('profileGroups:delete', async (event, groupId) => {
    try {
      storage.deleteProfileGroup(groupId);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete profile group:', error);
      return { success: false, error: error.message };
    }
  });
}

module.exports = { registerHandlers };

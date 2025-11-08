const { ipcRenderer } = require('electron');

// Since nodeIntegration is enabled and contextIsolation is disabled,
// we expose the API directly on window
window.electronAPI = {
  // Profile operations
  loadProfiles: () => ipcRenderer.invoke('profiles:load'),
  getProfile: (profileId) => ipcRenderer.invoke('profiles:get', profileId),
  saveProfile: (profile) => ipcRenderer.invoke('profiles:save', profile),
  deleteProfile: (profileId) => ipcRenderer.invoke('profiles:delete', profileId),

  // Recent profiles operations
  addRecentProfile: (profileId) => ipcRenderer.invoke('profiles:addRecent', profileId),
  getRecentProfiles: () => ipcRenderer.invoke('profiles:getRecent'),

  // Payload template operations
  loadPayloadTemplates: () => ipcRenderer.invoke('payloadTemplates:load'),
  getPayloadTemplate: (templateId) => ipcRenderer.invoke('payloadTemplates:get', templateId),
  savePayloadTemplate: (template) => ipcRenderer.invoke('payloadTemplates:save', template),
  deletePayloadTemplate: (templateId) => ipcRenderer.invoke('payloadTemplates:delete', templateId),

  // Key encryption/decryption operations
  encryptKey: (plaintextKey) => ipcRenderer.invoke('crypto:encrypt', plaintextKey),
  decryptKey: (encryptedKey) => ipcRenderer.invoke('crypto:decrypt', encryptedKey),

  // Settings operations
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),

  // P3.1: Token History operations
  loadTokenHistory: () => ipcRenderer.invoke('tokenHistory:load'),
  addTokenHistory: (historyEntry) => ipcRenderer.invoke('tokenHistory:add', historyEntry),
  clearTokenHistory: () => ipcRenderer.invoke('tokenHistory:clear'),

  // P3.2: Profile Groups operations
  loadProfileGroups: () => ipcRenderer.invoke('profileGroups:load'),
  getProfileGroup: (groupId) => ipcRenderer.invoke('profileGroups:get', groupId),
  saveProfileGroup: (group) => ipcRenderer.invoke('profileGroups:save', group),
  deleteProfileGroup: (groupId) => ipcRenderer.invoke('profileGroups:delete', groupId)
};

const { ipcRenderer } = require('electron');

// Since nodeIntegration is enabled and contextIsolation is disabled,
// we expose the API directly on window
window.electronAPI = {
  // Profile operations
  loadProfiles: () => ipcRenderer.invoke('profiles:load'),
  getProfile: (profileId) => ipcRenderer.invoke('profiles:get', profileId),
  saveProfile: (profile) => ipcRenderer.invoke('profiles:save', profile),
  deleteProfile: (profileId) => ipcRenderer.invoke('profiles:delete', profileId),

  // Key encryption/decryption operations
  encryptKey: (plaintextKey) => ipcRenderer.invoke('crypto:encrypt', plaintextKey),
  decryptKey: (encryptedKey) => ipcRenderer.invoke('crypto:decrypt', encryptedKey),

  // Settings operations
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings)
};

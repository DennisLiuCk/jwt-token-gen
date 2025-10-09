const Store = require('electron-store');
const { v4: uuidv4 } = require('uuid');

// JSON schema for validation
const schema = {
  profiles: {
    type: 'array',
    maxItems: 50,
    items: {
      type: 'object',
      required: ['id', 'name', 'algorithm', 'encryptedKey', 'payload', 'createdAt', 'updatedAt'],
      properties: {
        id: { type: 'string' },
        name: { type: 'string', minLength: 1, maxLength: 50 },
        algorithm: { type: 'string', enum: ['HS256', 'RS256'] },
        encryptedKey: { type: 'string' },
        payload: { type: 'object' },
        expirationPreset: { type: 'string', enum: ['1h', '1d', '1w', 'custom'] },
        customExpiration: { type: ['number', 'null'] },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' }
      }
    }
  },
  settings: {
    type: 'object',
    required: ['version'],
    properties: {
      lastSelectedProfileId: { type: ['string', 'null'] },
      version: { type: 'string' },
      theme: { type: 'string', enum: ['light', 'dark'] },
      windowBounds: {
        type: ['object', 'null'],
        properties: {
          x: { type: 'number' },
          y: { type: 'number' },
          width: { type: 'number' },
          height: { type: 'number' }
        }
      }
    }
  }
};

const store = new Store({ schema });

// Initialize default profiles on first launch
function initializeDefaultProfiles() {
  if (!store.has('profiles') || store.get('profiles').length === 0) {
    const defaultProfiles = require('../shared/defaultProfiles');
    store.set('profiles', defaultProfiles);
  }

  if (!store.has('settings')) {
    store.set('settings', {
      lastSelectedProfileId: null,
      version: '1.0.0',
      theme: 'light',
      windowBounds: null
    });
  }
}

// Profile CRUD operations
function getAllProfiles() {
  return store.get('profiles', []);
}

function getProfileById(profileId) {
  const profiles = getAllProfiles();
  return profiles.find(p => p.id === profileId);
}

function saveProfile(profile) {
  const profiles = getAllProfiles();
  const now = new Date().toISOString();

  const existingIndex = profiles.findIndex(p => p.id === profile.id);

  if (existingIndex >= 0) {
    // Update existing profile
    profiles[existingIndex] = {
      ...profile,
      updatedAt: now
    };
  } else {
    // Create new profile
    if (profiles.length >= 50) {
      throw new Error('Maximum profile limit (50) reached');
    }
    profiles.push({
      id: profile.id || uuidv4(),
      ...profile,
      createdAt: now,
      updatedAt: now
    });
  }

  store.set('profiles', profiles);
  return profiles[existingIndex >= 0 ? existingIndex : profiles.length - 1];
}

function deleteProfile(profileId) {
  const profiles = getAllProfiles();
  const filtered = profiles.filter(p => p.id !== profileId);

  if (filtered.length === profiles.length) {
    throw new Error('Profile not found');
  }

  store.set('profiles', filtered);

  // Update settings if deleted profile was selected
  const settings = getSettings();
  if (settings.lastSelectedProfileId === profileId) {
    settings.lastSelectedProfileId = null;
    saveSettings(settings);
  }

  return true;
}

// Settings operations
function getSettings() {
  return store.get('settings', {
    lastSelectedProfileId: null,
    version: '1.0.0',
    theme: 'light',
    windowBounds: null
  });
}

function saveSettings(settings) {
  store.set('settings', settings);
  return settings;
}

module.exports = {
  initializeDefaultProfiles,
  getAllProfiles,
  getProfileById,
  saveProfile,
  deleteProfile,
  getSettings,
  saveSettings
};

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
        updatedAt: { type: 'string' },
        // New fields for enhanced UX
        isTemplate: { type: 'boolean' },
        isFavorite: { type: 'boolean' },
        group: { type: 'string' },
        lastUsedAt: { type: ['string', 'null'] },
        // P3.3: Payload variants per profile
        payloadVariants: {
          type: 'array',
          maxItems: 10,
          items: {
            type: 'object',
            required: ['id', 'name', 'payload', 'createdAt', 'updatedAt'],
            properties: {
              id: { type: 'string' },
              name: { type: 'string', minLength: 1, maxLength: 50 },
              description: { type: 'string', maxLength: 200 },
              payload: { type: 'object' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' }
            }
          }
        }
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
      },
      recentProfileIds: {
        type: 'array',
        maxItems: 10,
        items: { type: 'string' }
      }
    }
  },
  payloadTemplates: {
    type: 'array',
    maxItems: 30,
    items: {
      type: 'object',
      required: ['id', 'name', 'payload', 'createdAt', 'updatedAt'],
      properties: {
        id: { type: 'string' },
        name: { type: 'string', minLength: 1, maxLength: 50 },
        description: { type: 'string', maxLength: 200 },
        payload: { type: 'object' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' }
      }
    }
  },
  // P3.1: Token generation history
  tokenHistory: {
    type: 'array',
    maxItems: 20,
    items: {
      type: 'object',
      required: ['id', 'profileId', 'profileName', 'algorithm', 'generatedAt'],
      properties: {
        id: { type: 'string' },
        profileId: { type: 'string' },
        profileName: { type: 'string' },
        algorithm: { type: 'string', enum: ['HS256', 'RS256'] },
        expirationPreset: { type: 'string' },
        payloadSummary: { type: 'string', maxLength: 200 },
        generatedAt: { type: 'string' },
        expiresAt: { type: ['string', 'null'] }
      }
    }
  },
  // P3.2: Profile groups
  profileGroups: {
    type: 'array',
    maxItems: 20,
    items: {
      type: 'object',
      required: ['id', 'name', 'createdAt', 'updatedAt'],
      properties: {
        id: { type: 'string' },
        name: { type: 'string', minLength: 1, maxLength: 50 },
        color: { type: 'string' },
        description: { type: 'string', maxLength: 200 },
        collapsed: { type: 'boolean' },
        order: { type: 'number' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' }
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
      windowBounds: null,
      recentProfileIds: []
    });
  }

  if (!store.has('payloadTemplates')) {
    store.set('payloadTemplates', []);
  }

  // P3.1: Initialize token history
  if (!store.has('tokenHistory')) {
    store.set('tokenHistory', []);
  }

  // P3.2: Initialize profile groups
  if (!store.has('profileGroups')) {
    store.set('profileGroups', []);
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
    windowBounds: null,
    recentProfileIds: []
  });
}

function saveSettings(settings) {
  store.set('settings', settings);
  return settings;
}

// Recent profiles tracking
function addToRecentProfiles(profileId) {
  const settings = getSettings();
  let recentIds = settings.recentProfileIds || [];

  // Remove if already exists
  recentIds = recentIds.filter(id => id !== profileId);

  // Add to front
  recentIds.unshift(profileId);

  // Keep only last 10
  recentIds = recentIds.slice(0, 10);

  settings.recentProfileIds = recentIds;
  saveSettings(settings);
  return recentIds;
}

function getRecentProfiles() {
  const settings = getSettings();
  const recentIds = settings.recentProfileIds || [];
  const profiles = getAllProfiles();

  return recentIds
    .map(id => profiles.find(p => p.id === id))
    .filter(p => p !== undefined);
}

// Payload Template CRUD operations
function getAllPayloadTemplates() {
  return store.get('payloadTemplates', []);
}

function getPayloadTemplateById(templateId) {
  const templates = getAllPayloadTemplates();
  return templates.find(t => t.id === templateId);
}

function savePayloadTemplate(template) {
  const templates = getAllPayloadTemplates();
  const now = new Date().toISOString();

  const existingIndex = templates.findIndex(t => t.id === template.id);

  if (existingIndex >= 0) {
    // Update existing template
    templates[existingIndex] = {
      ...template,
      updatedAt: now
    };
  } else {
    // Create new template
    if (templates.length >= 30) {
      throw new Error('Maximum payload template limit (30) reached');
    }
    templates.push({
      id: template.id || uuidv4(),
      ...template,
      createdAt: now,
      updatedAt: now
    });
  }

  store.set('payloadTemplates', templates);
  return templates[existingIndex >= 0 ? existingIndex : templates.length - 1];
}

function deletePayloadTemplate(templateId) {
  const templates = getAllPayloadTemplates();
  const filtered = templates.filter(t => t.id !== templateId);

  if (filtered.length === templates.length) {
    throw new Error('Payload template not found');
  }

  store.set('payloadTemplates', filtered);
  return true;
}

// P3.1: Token History CRUD operations
function getAllTokenHistory() {
  return store.get('tokenHistory', []);
}

function addTokenHistory(historyEntry) {
  const history = getAllTokenHistory();
  const now = new Date().toISOString();

  const newEntry = {
    id: historyEntry.id || uuidv4(),
    profileId: historyEntry.profileId,
    profileName: historyEntry.profileName,
    algorithm: historyEntry.algorithm,
    expirationPreset: historyEntry.expirationPreset || 'N/A',
    payloadSummary: historyEntry.payloadSummary || '',
    generatedAt: now,
    expiresAt: historyEntry.expiresAt || null
  };

  // Add to front
  history.unshift(newEntry);

  // Keep only last 20
  const trimmed = history.slice(0, 20);

  store.set('tokenHistory', trimmed);
  return newEntry;
}

function clearTokenHistory() {
  store.set('tokenHistory', []);
  return true;
}

// P3.2: Profile Groups CRUD operations
function getAllProfileGroups() {
  return store.get('profileGroups', []);
}

function getProfileGroupById(groupId) {
  const groups = getAllProfileGroups();
  return groups.find(g => g.id === groupId);
}

function saveProfileGroup(group) {
  const groups = getAllProfileGroups();
  const now = new Date().toISOString();

  const existingIndex = groups.findIndex(g => g.id === group.id);

  if (existingIndex >= 0) {
    // Update existing group
    groups[existingIndex] = {
      ...group,
      updatedAt: now
    };
  } else {
    // Create new group
    if (groups.length >= 20) {
      throw new Error('Maximum profile group limit (20) reached');
    }
    groups.push({
      id: group.id || uuidv4(),
      name: group.name,
      color: group.color || '#1976d2',
      description: group.description || '',
      collapsed: group.collapsed !== undefined ? group.collapsed : false,
      order: group.order !== undefined ? group.order : groups.length,
      createdAt: now,
      updatedAt: now
    });
  }

  store.set('profileGroups', groups);
  return groups[existingIndex >= 0 ? existingIndex : groups.length - 1];
}

function deleteProfileGroup(groupId) {
  const groups = getAllProfileGroups();
  const filtered = groups.filter(g => g.id !== groupId);

  if (filtered.length === groups.length) {
    throw new Error('Profile group not found');
  }

  store.set('profileGroups', filtered);

  // Update profiles that belonged to this group
  const profiles = getAllProfiles();
  const updatedProfiles = profiles.map(p => {
    if (p.group === groupId) {
      return { ...p, group: 'ungrouped' };
    }
    return p;
  });
  store.set('profiles', updatedProfiles);

  return true;
}

module.exports = {
  initializeDefaultProfiles,
  getAllProfiles,
  getProfileById,
  saveProfile,
  deleteProfile,
  getSettings,
  saveSettings,
  addToRecentProfiles,
  getRecentProfiles,
  getAllPayloadTemplates,
  getPayloadTemplateById,
  savePayloadTemplate,
  deletePayloadTemplate,
  // P3.1: Token History
  getAllTokenHistory,
  addTokenHistory,
  clearTokenHistory,
  // P3.2: Profile Groups
  getAllProfileGroups,
  getProfileGroupById,
  saveProfileGroup,
  deleteProfileGroup
};

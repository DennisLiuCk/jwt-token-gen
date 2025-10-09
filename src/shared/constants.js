// IPC Channel Names
const IPC_CHANNELS = {
  PROFILES_LOAD: 'profiles:load',
  PROFILES_GET: 'profiles:get',
  PROFILES_SAVE: 'profiles:save',
  PROFILES_DELETE: 'profiles:delete',
  CRYPTO_ENCRYPT: 'crypto:encrypt',
  CRYPTO_DECRYPT: 'crypto:decrypt',
  SETTINGS_GET: 'settings:get',
  SETTINGS_SAVE: 'settings:save'
};

// Application Limits
const LIMITS = {
  MAX_PROFILES: 50,
  MAX_PAYLOAD_SIZE: 65536, // 64KB in bytes
  MAX_PROFILE_NAME_LENGTH: 50,
  MIN_PROFILE_NAME_LENGTH: 1
};

// Default Values
const DEFAULTS = {
  ALGORITHM: 'HS256',
  EXPIRATION_PRESET: '1h',
  THEME: 'light',
  VERSION: '1.0.0'
};

// Expiration Presets (in seconds)
const EXPIRATION_PRESETS = {
  '1h': 3600,
  '1d': 86400,
  '1w': 604800
};

module.exports = {
  IPC_CHANNELS,
  LIMITS,
  DEFAULTS,
  EXPIRATION_PRESETS
};

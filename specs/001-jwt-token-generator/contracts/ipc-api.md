# IPC API Contract

**Feature**: 001-jwt-token-generator
**Date**: 2025-10-09
**Purpose**: Define Inter-Process Communication (IPC) contracts between Electron main and renderer processes

## Overview

This document defines the IPC channels and message formats for communication between the Electron main process (privileged, Node.js access) and renderer process (sandboxed, browser context). All IPC communication uses the secure `contextBridge` + `ipcRenderer.invoke/handle` pattern.

## Security Model

**Renderer Process**:
- Runs in sandboxed environment
- No direct Node.js or Electron API access
- Communicates with main process via `window.electronAPI` exposed by preload script
- Cannot access file system, encryption APIs, or system resources directly

**Main Process**:
- Full Node.js and Electron API access
- Handles file system operations (profile storage)
- Performs DPAPI encryption/decryption
- Validates all inputs from renderer before processing

## IPC Channel Namespaces

Channels are organized by functional area:

- `profiles:*` - Profile CRUD operations
- `crypto:*` - Key encryption/decryption
- `settings:*` - Application settings
- `jwt:*` - JWT token operations (if needed in main process)

---

## Profile Operations

### profiles:load

**Purpose**: Load all profiles from persistent storage

**Direction**: Renderer → Main → Renderer

**Request**:
```javascript
// No parameters
await window.electronAPI.loadProfiles();
```

**Response**:
```javascript
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Profile Name",
      "algorithm": "HS256" | "RS256",
      "encryptedKey": "base64-encrypted-key",
      "payload": { /* object */ },
      "expirationPreset": "1h" | "1d" | "1w" | "custom",
      "customExpiration": number | null,
      "createdAt": "ISO 8601 string",
      "updatedAt": "ISO 8601 string"
    },
    // ... more profiles
  ],
  "error": null
}
```

**Error Response**:
```javascript
{
  "success": false,
  "data": null,
  "error": {
    "code": "LOAD_FAILED",
    "message": "Unable to load profiles from storage",
    "details": "File corrupted or inaccessible"
  }
}
```

**Error Codes**:
- `LOAD_FAILED` - Storage file corrupted or inaccessible
- `PARSE_ERROR` - JSON parsing failed
- `VALIDATION_ERROR` - Schema validation failed

---

### profiles:save

**Purpose**: Create a new profile or update an existing one

**Direction**: Renderer → Main → Renderer

**Request**:
```javascript
await window.electronAPI.saveProfile({
  id: "uuid (omit for new profile)",
  name: "Profile Name",
  algorithm: "HS256" | "RS256",
  encryptedKey: "base64-encrypted-key", // Already encrypted by crypto:encrypt
  payload: { /* object */ },
  expirationPreset: "1h" | "1d" | "1w" | "custom",
  customExpiration: number | null
});
```

**Response**:
```javascript
{
  "success": true,
  "data": {
    "id": "uuid (generated if new)",
    "name": "Profile Name",
    "algorithm": "HS256",
    "encryptedKey": "base64-encrypted-key",
    "payload": { /* object */ },
    "expirationPreset": "1h",
    "customExpiration": null,
    "createdAt": "2025-10-09T10:00:00Z",
    "updatedAt": "2025-10-09T10:00:00Z"
  },
  "error": null
}
```

**Error Response**:
```javascript
{
  "success": false,
  "data": null,
  "error": {
    "code": "DUPLICATE_NAME" | "PROFILE_LIMIT_REACHED" | "VALIDATION_ERROR",
    "message": "User-friendly error message",
    "details": "Technical details for debugging"
  }
}
```

**Error Codes**:
- `DUPLICATE_NAME` - Profile name already exists
- `PROFILE_LIMIT_REACHED` - Maximum 50 profiles exceeded
- `VALIDATION_ERROR` - Invalid profile data (missing fields, invalid types)
- `SAVE_FAILED` - File system write error

**Validation Rules**:
- `name`: 1-50 characters, unique across all profiles
- `algorithm`: Must be "HS256" or "RS256"
- `encryptedKey`: Non-empty Base64 string
- `payload`: Valid JSON object, serialized size <64KB
- `expirationPreset`: One of allowed values or omitted
- `customExpiration`: Required if preset is "custom", must be future timestamp

---

### profiles:delete

**Purpose**: Delete a profile permanently

**Direction**: Renderer → Main → Renderer

**Request**:
```javascript
await window.electronAPI.deleteProfile("profile-uuid");
```

**Response**:
```javascript
{
  "success": true,
  "data": {
    "deletedId": "profile-uuid"
  },
  "error": null
}
```

**Error Response**:
```javascript
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND" | "DELETE_FAILED",
    "message": "Profile not found or could not be deleted",
    "details": "Profile ID: profile-uuid"
  }
}
```

**Error Codes**:
- `NOT_FOUND` - Profile with given ID does not exist
- `DELETE_FAILED` - File system error during deletion

**Side Effects**:
- If deleted profile was last selected, `settings.lastSelectedProfileId` is cleared

---

### profiles:get

**Purpose**: Get a single profile by ID

**Direction**: Renderer → Main → Renderer

**Request**:
```javascript
await window.electronAPI.getProfile("profile-uuid");
```

**Response**:
```javascript
{
  "success": true,
  "data": {
    "id": "profile-uuid",
    "name": "Profile Name",
    // ... all profile fields
  },
  "error": null
}
```

**Error Response**:
```javascript
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Profile not found",
    "details": "Profile ID: profile-uuid"
  }
}
```

---

## Cryptographic Operations

### crypto:encrypt

**Purpose**: Encrypt a plaintext signing key using Windows DPAPI

**Direction**: Renderer → Main → Renderer

**Request**:
```javascript
await window.electronAPI.encryptKey("plaintext-signing-key");
```

**Parameters**:
- `plaintextKey` (string): The unencrypted signing key (Base64 for HS256, PEM for RS256)

**Response**:
```javascript
{
  "success": true,
  "data": {
    "encryptedKey": "base64-dpapi-encrypted-string"
  },
  "error": null
}
```

**Error Response**:
```javascript
{
  "success": false,
  "data": null,
  "error": {
    "code": "ENCRYPTION_FAILED",
    "message": "Unable to encrypt key using Windows DPAPI",
    "details": "DPAPI error details"
  }
}
```

**Error Codes**:
- `ENCRYPTION_FAILED` - DPAPI encryption failed (Windows API error)
- `INVALID_INPUT` - Plaintext key is empty or invalid format

**Security Notes**:
- Plaintext key is never logged
- DPAPI uses CurrentUser scope (key tied to user account)
- Encrypted key can only be decrypted on the same machine by the same user

---

### crypto:decrypt

**Purpose**: Decrypt a DPAPI-encrypted signing key

**Direction**: Renderer → Main → Renderer

**Request**:
```javascript
await window.electronAPI.decryptKey("base64-dpapi-encrypted-string");
```

**Parameters**:
- `encryptedKey` (string): The DPAPI-encrypted key (Base64 format)

**Response**:
```javascript
{
  "success": true,
  "data": {
    "plaintextKey": "decrypted-signing-key"
  },
  "error": null
}
```

**Error Response**:
```javascript
{
  "success": false,
  "data": null,
  "error": {
    "code": "DECRYPTION_FAILED",
    "message": "Unable to decrypt key. This may occur if the profile was created by a different user or on a different machine.",
    "details": "DPAPI error details"
  }
}
```

**Error Codes**:
- `DECRYPTION_FAILED` - DPAPI decryption failed (wrong user, wrong machine, corrupted data)
- `INVALID_INPUT` - Encrypted key is empty or invalid Base64 format

**Security Notes**:
- Plaintext key returned to renderer should be used immediately
- Renderer should clear plaintext key from memory after JWT signing
- Main process clears plaintext key from memory before returning to renderer

---

## Settings Operations

### settings:get

**Purpose**: Load application settings

**Direction**: Renderer → Main → Renderer

**Request**:
```javascript
await window.electronAPI.getSettings();
```

**Response**:
```javascript
{
  "success": true,
  "data": {
    "lastSelectedProfileId": "uuid" | null,
    "version": "1.0.0",
    "theme": "light" | "dark",
    "windowBounds": {
      "x": number,
      "y": number,
      "width": number,
      "height": number
    } | null
  },
  "error": null
}
```

**Error Response**:
```javascript
{
  "success": false,
  "data": null,
  "error": {
    "code": "LOAD_FAILED",
    "message": "Unable to load settings",
    "details": "Storage error details"
  }
}
```

**Default Values** (if settings file doesn't exist):
```javascript
{
  "lastSelectedProfileId": null,
  "version": "1.0.0",
  "theme": "light",
  "windowBounds": null
}
```

---

### settings:save

**Purpose**: Update application settings

**Direction**: Renderer → Main → Renderer

**Request**:
```javascript
await window.electronAPI.saveSettings({
  lastSelectedProfileId: "uuid" | null,
  theme: "light" | "dark",
  windowBounds: { x, y, width, height } | null
});
```

**Response**:
```javascript
{
  "success": true,
  "data": {
    "lastSelectedProfileId": "uuid",
    "version": "1.0.0",
    "theme": "light",
    "windowBounds": { x, y, width, height }
  },
  "error": null
}
```

**Error Response**:
```javascript
{
  "success": false,
  "data": null,
  "error": {
    "code": "SAVE_FAILED",
    "message": "Unable to save settings",
    "details": "File system error"
  }
}
```

**Validation Rules**:
- `lastSelectedProfileId`: Must be valid UUID or null
- `theme`: Must be "light" or "dark"
- `windowBounds`: All fields must be numbers if provided

---

## JWT Operations (Renderer-Side)

These operations are performed in the renderer process using the `jsonwebtoken` library (not via IPC), as they don't require privileged access.

### JWT Token Generation (Renderer)

**Implementation**:
```javascript
// In renderer process (src/renderer/services/jwtService.js)
import jwt from 'jsonwebtoken';

function generateToken(algorithm, plaintextKey, payload, expirationSeconds) {
  // Add iat if not present
  if (!payload.iat) {
    payload.iat = Math.floor(Date.now() / 1000);
  }

  // Add exp
  payload.exp = payload.iat + expirationSeconds;

  // Sign token
  const token = jwt.sign(payload, plaintextKey, {
    algorithm: algorithm
  });

  return token;
}
```

**Why Renderer-Side**:
- JWT signing doesn't require privileged access (just CPU computation)
- Keeping it in renderer reduces IPC roundtrips
- Decrypted key is already in renderer memory for minimal time

### JWT Token Parsing (Renderer)

**Implementation**:
```javascript
function parseToken(tokenString) {
  // Decode without verification (display purposes only)
  const decoded = jwt.decode(tokenString, { complete: true });

  if (!decoded) {
    throw new Error('Invalid JWT token format');
  }

  return {
    raw: tokenString,
    header: decoded.header,
    payload: decoded.payload,
    signature: tokenString.split('.')[2]
  };
}
```

---

## Error Handling Pattern

**All IPC responses follow this structure**:
```javascript
{
  "success": boolean,
  "data": object | array | null,
  "error": {
    "code": string,
    "message": string, // User-friendly message
    "details": string  // Technical details for debugging
  } | null
}
```

**Error Codes Summary**:

| Code | Applies To | Meaning |
|------|------------|---------|
| `LOAD_FAILED` | profiles:load, settings:get | Storage read error |
| `SAVE_FAILED` | profiles:save, settings:save | Storage write error |
| `DELETE_FAILED` | profiles:delete | Storage delete error |
| `NOT_FOUND` | profiles:get, profiles:delete | Resource doesn't exist |
| `DUPLICATE_NAME` | profiles:save | Profile name already exists |
| `PROFILE_LIMIT_REACHED` | profiles:save | Maximum 50 profiles exceeded |
| `VALIDATION_ERROR` | profiles:save | Invalid data format/values |
| `ENCRYPTION_FAILED` | crypto:encrypt | DPAPI encryption error |
| `DECRYPTION_FAILED` | crypto:decrypt | DPAPI decryption error |
| `INVALID_INPUT` | crypto:encrypt, crypto:decrypt | Empty or malformed input |
| `PARSE_ERROR` | profiles:load | JSON parsing error |

---

## Preload Script API Surface

**Exposed to Renderer** (window.electronAPI):

```javascript
// Preload script (src/main/preload.js)
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Profile operations
  loadProfiles: () => ipcRenderer.invoke('profiles:load'),
  getProfile: (id) => ipcRenderer.invoke('profiles:get', id),
  saveProfile: (profile) => ipcRenderer.invoke('profiles:save', profile),
  deleteProfile: (id) => ipcRenderer.invoke('profiles:delete', id),

  // Crypto operations
  encryptKey: (plaintextKey) => ipcRenderer.invoke('crypto:encrypt', plaintextKey),
  decryptKey: (encryptedKey) => ipcRenderer.invoke('crypto:decrypt', encryptedKey),

  // Settings operations
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
});
```

**Security Configuration** (main.js BrowserWindow):
```javascript
const mainWindow = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,        // Enable context isolation
    nodeIntegration: false,         // Disable Node.js in renderer
    preload: path.join(__dirname, 'preload.js')
  }
});
```

---

## Usage Examples

### Complete Profile Creation Flow

```javascript
// In renderer component (React)
async function handleCreateProfile(formData) {
  try {
    // 1. Encrypt the key
    const encryptResult = await window.electronAPI.encryptKey(formData.plaintextKey);
    if (!encryptResult.success) {
      throw new Error(encryptResult.error.message);
    }

    // 2. Prepare profile object
    const profileData = {
      name: formData.name,
      algorithm: formData.algorithm,
      encryptedKey: encryptResult.data.encryptedKey,
      payload: formData.payload,
      expirationPreset: formData.expirationPreset,
      customExpiration: formData.customExpiration
    };

    // 3. Save profile
    const saveResult = await window.electronAPI.saveProfile(profileData);
    if (!saveResult.success) {
      throw new Error(saveResult.error.message);
    }

    // 4. Update UI with new profile
    const newProfile = saveResult.data;
    console.log('Profile created:', newProfile.id);

  } catch (error) {
    console.error('Profile creation failed:', error.message);
    showErrorToUser(error.message);
  }
}
```

### Token Generation Flow

```javascript
// In renderer service (jwtService.js)
import jwt from 'jsonwebtoken';

async function generateTokenFromProfile(profile) {
  try {
    // 1. Decrypt key
    const decryptResult = await window.electronAPI.decryptKey(profile.encryptedKey);
    if (!decryptResult.success) {
      throw new Error(decryptResult.error.message);
    }

    const plaintextKey = decryptResult.data.plaintextKey;

    // 2. Prepare payload
    const payload = {
      ...profile.payload,
      iat: Math.floor(Date.now() / 1000)
    };

    // Calculate exp
    const expirationSeconds = calculateExpiration(profile.expirationPreset, profile.customExpiration);
    payload.exp = payload.iat + expirationSeconds;

    // 3. Sign token
    const token = jwt.sign(payload, plaintextKey, {
      algorithm: profile.algorithm
    });

    // 4. Clear plaintext key from memory
    plaintextKey = null;

    // 5. Return token details
    const decoded = jwt.decode(token, { complete: true });
    return {
      raw: token,
      header: decoded.header,
      payload: decoded.payload,
      signature: token.split('.')[2],
      generatedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Token generation failed:', error);
    throw error;
  }
}
```

---

## Performance Considerations

**IPC Overhead**:
- Each IPC call has ~1-5ms overhead (acceptable for desktop app)
- Minimize data size in IPC messages (use references/IDs where possible)
- Batch operations when possible (e.g., load all profiles in one call vs. individual calls)

**Async Operations**:
- All IPC calls are async (return Promises)
- UI should show loading states during IPC operations
- Errors should be caught and displayed to user

**Memory Management**:
- Clear sensitive data (plaintext keys) from memory immediately after use
- Large payloads (>1MB) should be validated for size before passing through IPC

---

## Testing IPC Contracts

**Unit Tests** (Mock IPC):
```javascript
// Mock window.electronAPI
global.window.electronAPI = {
  loadProfiles: jest.fn().mockResolvedValue({
    success: true,
    data: mockProfiles,
    error: null
  })
};

// Test component that uses IPC
test('loads profiles on mount', async () => {
  render(<ProfileList />);
  await waitFor(() => {
    expect(window.electronAPI.loadProfiles).toHaveBeenCalled();
    expect(screen.getByText('Dev Environment Admin')).toBeInTheDocument();
  });
});
```

**Integration Tests** (Real IPC):
```javascript
// Test IPC handler
const { ipcMain } = require('electron');
const { loadProfiles } = require('./ipc-handlers');

test('profiles:load returns all profiles', async () => {
  // Setup: create test profiles in storage
  await createTestProfiles();

  // Execute: call IPC handler directly
  const result = await loadProfiles();

  // Verify: check result structure
  expect(result.success).toBe(true);
  expect(result.data).toHaveLength(3);
  expect(result.data[0]).toHaveProperty('id');
  expect(result.data[0]).toHaveProperty('encryptedKey');
});
```

---

## Versioning

**IPC Contract Version**: 1.0.0

**Breaking Changes** (require major version bump):
- Changing request/response structure
- Removing IPC channels
- Changing error code meanings

**Non-Breaking Changes** (minor version bump):
- Adding new IPC channels
- Adding optional fields to responses
- Adding new error codes

**Deprecation Process**:
1. Mark channel as deprecated in documentation
2. Log warning when deprecated channel is used
3. Maintain backwards compatibility for at least 2 minor versions
4. Remove in next major version

# Data Model: JWT Token Generator

**Feature**: 001-jwt-token-generator
**Date**: 2025-10-09
**Purpose**: Define data structures for profiles, tokens, and application state

## Entity Definitions

### 1. Profile

Represents a saved configuration template for JWT token generation.

**Fields**:

| Field Name | Type | Required | Validation | Description |
|------------|------|----------|------------|-------------|
| `id` | string (UUID v4) | Yes | Valid UUID format | Unique identifier for the profile |
| `name` | string | Yes | 1-50 characters, unique across all profiles | User-defined profile name |
| `algorithm` | enum | Yes | "HS256" or "RS256" | JWT signing algorithm |
| `encryptedKey` | string (Base64) | Yes | Valid Base64, non-empty | DPAPI-encrypted signing key |
| `payload` | object | Yes | Valid JSON object, <64KB serialized | JWT payload template with claims |
| `expirationPreset` | string | No | "1h", "1d", "1w", or "custom" | Default expiration time preset |
| `customExpiration` | number (Unix timestamp) | No | Future timestamp if expirationPreset="custom" | Custom expiration timestamp |
| `createdAt` | string (ISO 8601) | Yes | Valid ISO 8601 datetime | Profile creation timestamp |
| `updatedAt` | string (ISO 8601) | Yes | Valid ISO 8601 datetime | Last modification timestamp |

**Relationships**:
- One profile contains one encrypted key
- One profile contains one payload template
- Profiles are independent (no parent-child relationships)

**Constraints**:
- Maximum 50 profiles total (FR-007)
- Profile names must be unique (enforced at UI and storage layer)
- Payload must be serializable JSON (no functions, undefined, circular references)

**State Transitions**:
```
[New] --create--> [Saved]
[Saved] --edit--> [Modified (unsaved)]
[Modified] --save--> [Saved]
[Modified] --discard--> [Saved (reverted)]
[Saved] --delete--> [Deleted]
```

**Example**:
```json
{
  "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "name": "Dev Environment Admin",
  "algorithm": "HS256",
  "encryptedKey": "AQAAANCMnd8BFdERjHoAwE/Cl+sBAAAA...", // DPAPI encrypted
  "payload": {
    "userId": "admin001",
    "username": "Admin User",
    "email": "admin@example.com",
    "roleCode": "ADMIN"
  },
  "expirationPreset": "1h",
  "customExpiration": null,
  "createdAt": "2025-10-09T10:00:00Z",
  "updatedAt": "2025-10-09T14:30:00Z"
}
```

---

### 2. JWT Token

Represents a generated or parsed JWT token.

**Fields**:

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `raw` | string | Yes | Complete JWT token (header.payload.signature) |
| `header` | object | Yes | Decoded header containing algorithm and type |
| `payload` | object | Yes | Decoded payload containing claims |
| `signature` | string | Yes | Base64url-encoded signature portion |
| `generatedAt` | string (ISO 8601) | No | Timestamp when token was generated (for locally generated tokens) |

**Header Structure**:
```json
{
  "alg": "HS256" | "RS256",
  "typ": "JWT"
}
```

**Payload Structure** (standard claims + custom):
```json
{
  "iss": "string (optional)",
  "sub": "string (optional)",
  "aud": "string (optional)",
  "exp": number (Unix timestamp, required),
  "iat": number (Unix timestamp, auto-added),
  "nbf": number (Unix timestamp, optional)",
  ...customClaims
}
```

**Format Validation**:
- Token must match regex: `^[\w-]+\.[\w-]+\.[\w-]+$`
- Each segment must be valid Base64url
- Header and payload must be valid JSON when decoded

**Example**:
```json
{
  "raw": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbjAwMSIsImV4cCI6MTYyODUwMDAwMH0.signature",
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "admin001",
    "username": "Admin User",
    "exp": 1628500000,
    "iat": 1628496400
  },
  "signature": "signature-base64url",
  "generatedAt": "2025-10-09T15:00:00Z"
}
```

---

### 3. Key

Represents cryptographic signing key (stored encrypted).

**Fields**:

| Field Name | Type | Required | Validation | Description |
|------------|------|----------|------------|-------------|
| `plaintextKey` | string | Yes (runtime only) | Algorithm-specific format | Unencrypted key (exists only in memory during token generation) |
| `encryptedKey` | string (Base64) | Yes (storage) | Valid Base64, DPAPI format | DPAPI-encrypted key for persistent storage |
| `algorithm` | enum | Yes | "HS256" or "RS256" | Algorithm this key is used for |

**Algorithm-Specific Formats**:

**HS256 Key**:
- Plaintext format: Base64-encoded string (standard Base64, not base64url)
- Example: `"dGVzdC1rZXktc2VjcmV0LWZvci1obWFjLXNoYTI1Ng=="`
- Validation: Must decode to at least 32 bytes (256 bits recommended)

**RS256 Key**:
- Plaintext format: PEM-encoded RSA private key
- Example:
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
-----END RSA PRIVATE KEY-----
```
- Validation: Must contain BEGIN/END markers, valid Base64 body, minimum 2048-bit key

**Security Properties**:
- Plaintext key must be cleared from memory immediately after use (set to null)
- Encrypted key uses Windows DPAPI with CurrentUser scope
- Key can only be decrypted by the same user on the same machine
- Keys never logged, never transmitted over network (FR-051, FR-056)

**Lifecycle**:
```
[User Input] --encrypt--> [Encrypted (stored in Profile)]
[Encrypted] --decrypt--> [Plaintext (in memory)]
[Plaintext] --use in JWT sign--> [Token Generated]
[Plaintext] --clear--> [Memory freed]
```

---

### 4. Payload

Represents the set of claims in a JWT token body.

**Structure**: JSON object with arbitrary key-value pairs

**Common Fields** (shown in form mode):

| Field Name | Type | Default | Description |
|------------|------|---------|-------------|
| `userId` | string | "" | User identifier |
| `username` | string | "" | User display name |
| `email` | string | "" | User email address |
| `roleCode` | string | "" | User role/permission code |
| `merchantId` | string | "" | Merchant identifier (for e-commerce scenarios) |
| `sub` | string | "" | Subject (standard JWT claim) |
| `iss` | string | "" | Issuer (standard JWT claim) |
| `aud` | string | "" | Audience (standard JWT claim) |

**Auto-Generated Fields**:

| Field Name | Type | Description |
|------------|------|-------------|
| `exp` | number | Expiration time (Unix timestamp) - calculated from expiration preset |
| `iat` | number | Issued at time (Unix timestamp) - auto-added if not present |

**Custom Fields**:
- Users can add arbitrary fields via "Add Custom Field" button in form mode
- Field names must be valid JSON keys (alphanumeric, underscore, hyphen)
- Field values can be string, number, boolean, object, or array

**Constraints**:
- Total serialized size must not exceed 64KB (FR-009, SC-009)
- Must be valid JSON (no undefined, functions, circular references)
- No reserved claim names should be overwritten unintentionally

**Validation Rules**:
- `exp` must be a future timestamp (warning if in the past for testing scenarios)
- `iat` if provided must be past or current timestamp
- `nbf` (not before) if provided must not be after `exp`

**Example**:
```json
{
  "userId": "admin001",
  "username": "Admin User",
  "email": "admin@example.com",
  "roleCode": "ADMIN",
  "customField": "customValue",
  "permissions": ["read", "write", "delete"],
  "exp": 1730300000,
  "iat": 1730296400
}
```

---

### 5. Application Settings

Represents user preferences and application state.

**Fields**:

| Field Name | Type | Required | Default | Description |
|------------|------|----------|---------|-------------|
| `lastSelectedProfileId` | string (UUID) | No | null | ID of the last selected profile |
| `version` | string | Yes | "1.0.0" | Settings schema version for migration |
| `theme` | enum | No | "light" | UI theme: "light" or "dark" (future) |
| `windowBounds` | object | No | null | Window position and size for persistence |

**Window Bounds Structure**:
```json
{
  "x": number,
  "y": number,
  "width": number,
  "height": number
}
```

**Example**:
```json
{
  "lastSelectedProfileId": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "version": "1.0.0",
  "theme": "light",
  "windowBounds": {
    "x": 100,
    "y": 100,
    "width": 1200,
    "height": 800
  }
}
```

---

## Data Storage Schema

**Storage Format**: JSON file managed by electron-store
**Location**: `%APPDATA%\jwt-token-generator\config.json` (Windows)

**Complete Schema**:
```json
{
  "profiles": [
    {
      "id": "string (UUID)",
      "name": "string",
      "algorithm": "HS256" | "RS256",
      "encryptedKey": "string (Base64 DPAPI)",
      "payload": { /* object */ },
      "expirationPreset": "1h" | "1d" | "1w" | "custom",
      "customExpiration": number | null,
      "createdAt": "ISO 8601 string",
      "updatedAt": "ISO 8601 string"
    }
  ],
  "settings": {
    "lastSelectedProfileId": "string (UUID)" | null,
    "version": "string",
    "theme": "light" | "dark",
    "windowBounds": {
      "x": number,
      "y": number,
      "width": number,
      "height": number
    } | null
  }
}
```

**JSON Schema Validation** (for electron-store):
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "profiles": {
      "type": "array",
      "maxItems": 50,
      "items": {
        "type": "object",
        "required": ["id", "name", "algorithm", "encryptedKey", "payload", "createdAt", "updatedAt"],
        "properties": {
          "id": { "type": "string", "format": "uuid" },
          "name": { "type": "string", "minLength": 1, "maxLength": 50 },
          "algorithm": { "type": "string", "enum": ["HS256", "RS256"] },
          "encryptedKey": { "type": "string", "minLength": 1 },
          "payload": { "type": "object" },
          "expirationPreset": { "type": "string", "enum": ["1h", "1d", "1w", "custom"] },
          "customExpiration": { "type": ["number", "null"] },
          "createdAt": { "type": "string", "format": "date-time" },
          "updatedAt": { "type": "string", "format": "date-time" }
        }
      }
    },
    "settings": {
      "type": "object",
      "required": ["version"],
      "properties": {
        "lastSelectedProfileId": { "type": ["string", "null"], "format": "uuid" },
        "version": { "type": "string" },
        "theme": { "type": "string", "enum": ["light", "dark"] },
        "windowBounds": {
          "type": ["object", "null"],
          "properties": {
            "x": { "type": "number" },
            "y": { "type": "number" },
            "width": { "type": "number" },
            "height": { "type": "number" }
          }
        }
      }
    }
  },
  "required": ["profiles", "settings"]
}
```

---

## Default Data

### Default Profiles (Created on First Launch)

**Profile 1: Dev Environment Admin**
```json
{
  "id": "generated-uuid-1",
  "name": "Dev Environment Admin",
  "algorithm": "HS256",
  "encryptedKey": "", // User must enter key
  "payload": {
    "userId": "admin001",
    "username": "Admin User",
    "email": "admin@example.com",
    "roleCode": "ADMIN"
  },
  "expirationPreset": "1h",
  "customExpiration": null,
  "createdAt": "2025-10-09T10:00:00Z",
  "updatedAt": "2025-10-09T10:00:00Z"
}
```

**Profile 2: Hybris Merchant Admin**
```json
{
  "id": "generated-uuid-2",
  "name": "Hybris Merchant Admin",
  "algorithm": "HS256",
  "encryptedKey": "", // User must enter key
  "payload": {
    "userId": "merchant001",
    "username": "Merchant Admin",
    "email": "merchant@example.com",
    "roleCode": "MERCHANT_ADMIN",
    "merchantId": "M001"
  },
  "expirationPreset": "1d",
  "customExpiration": null,
  "createdAt": "2025-10-09T10:00:00Z",
  "updatedAt": "2025-10-09T10:00:00Z"
}
```

**Profile 3: OpenAPI Profile**
```json
{
  "id": "generated-uuid-3",
  "name": "OpenAPI Profile",
  "algorithm": "RS256",
  "encryptedKey": "", // User must enter key
  "payload": {
    "sub": "api-client-001",
    "apiKey": "placeholder-api-key"
  },
  "expirationPreset": "1w",
  "customExpiration": null,
  "createdAt": "2025-10-09T10:00:00Z",
  "updatedAt": "2025-10-09T10:00:00Z"
}
```

---

## Data Operations

### Profile CRUD Operations

**Create Profile**:
```javascript
function createProfile(name, algorithm, plaintextKey, payload, expirationPreset) {
  // 1. Validate inputs
  if (profileCount >= 50) throw new Error('Maximum profile limit reached');
  if (isProfileNameDuplicate(name)) throw new Error('Profile name already exists');

  // 2. Encrypt key
  const encryptedKey = encryptKeyWithDPAPI(plaintextKey);

  // 3. Create profile object
  const profile = {
    id: generateUUID(),
    name,
    algorithm,
    encryptedKey,
    payload,
    expirationPreset,
    customExpiration: expirationPreset === 'custom' ? calculateExpiration() : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // 4. Save to store
  saveProfileToStore(profile);

  return profile;
}
```

**Read Profile**:
```javascript
function loadProfile(profileId) {
  const profile = getProfileFromStore(profileId);
  if (!profile) throw new Error('Profile not found');
  return profile;
}

function loadAllProfiles() {
  return getAllProfilesFromStore();
}
```

**Update Profile**:
```javascript
function updateProfile(profileId, updates) {
  // 1. Load existing profile
  const profile = loadProfile(profileId);

  // 2. Validate updates
  if (updates.name && updates.name !== profile.name) {
    if (isProfileNameDuplicate(updates.name)) throw new Error('Profile name already exists');
  }

  // 3. Encrypt new key if provided
  if (updates.plaintextKey) {
    updates.encryptedKey = encryptKeyWithDPAPI(updates.plaintextKey);
    delete updates.plaintextKey; // Don't store plaintext
  }

  // 4. Merge updates
  const updatedProfile = {
    ...profile,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  // 5. Save to store
  saveProfileToStore(updatedProfile);

  return updatedProfile;
}
```

**Delete Profile**:
```javascript
function deleteProfile(profileId) {
  // 1. Verify profile exists
  const profile = loadProfile(profileId);

  // 2. Remove from store
  removeProfileFromStore(profileId);

  // 3. Update settings if this was last selected
  if (settings.lastSelectedProfileId === profileId) {
    updateSettings({ lastSelectedProfileId: null });
  }

  return true;
}
```

### Token Generation Operation

```javascript
function generateToken(profile) {
  // 1. Decrypt key
  const plaintextKey = decryptKeyWithDPAPI(profile.encryptedKey);

  // 2. Prepare payload with exp and iat
  const payload = {
    ...profile.payload,
    iat: Math.floor(Date.now() / 1000)
  };

  // Calculate exp from preset
  if (profile.expirationPreset === 'custom') {
    payload.exp = profile.customExpiration;
  } else {
    const seconds = parseExpiration(profile.expirationPreset); // "1h" -> 3600
    payload.exp = payload.iat + seconds;
  }

  // 3. Generate token
  const token = jwt.sign(payload, plaintextKey, {
    algorithm: profile.algorithm
  });

  // 4. Clear plaintext key from memory
  plaintextKey = null;

  // 5. Return token with metadata
  return {
    raw: token,
    header: jwt.decode(token, { complete: true }).header,
    payload: jwt.decode(token, { complete: true }).payload,
    signature: token.split('.')[2],
    generatedAt: new Date().toISOString()
  };
}
```

---

## Migration Strategy

**Schema Versioning**: Settings include `version` field for migration tracking

**Version 1.0.0 → 1.1.0** (example future migration):
```javascript
function migrateSettings(oldSettings) {
  if (oldSettings.version === '1.0.0') {
    // Add new field with default
    oldSettings.newField = defaultValue;
    oldSettings.version = '1.1.0';
  }
  return oldSettings;
}

function migrateProfiles(profiles) {
  return profiles.map(profile => {
    // Transform profile structure if needed
    if (!profile.newField) {
      profile.newField = defaultValue;
    }
    return profile;
  });
}
```

**Backwards Compatibility**: Newer versions should read older data formats gracefully

---

## Data Validation Summary

**At UI Layer**:
- Profile name: 1-50 chars, unique
- Key: non-empty, matches algorithm format
- Payload: valid JSON, <64KB
- Expiration: valid preset or future timestamp

**At Storage Layer**:
- JSON schema validation (electron-store)
- UUID format validation
- Timestamp format validation
- Profile count limit (50)

**At Business Logic Layer**:
- Base64 format for HS256 keys
- PEM format for RS256 keys
- Payload claim type validation
- Token format validation (3 Base64url segments)

**Error Handling**:
- Validation errors shown in UI immediately
- Storage errors logged and user notified
- DPAPI decryption errors handled gracefully (suggest key re-entry)
- Corrupted data triggers fallback to defaults with user warning

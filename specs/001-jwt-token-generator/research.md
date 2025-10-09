# Technical Research: JWT Token Generator for Windows

**Feature**: 001-jwt-token-generator
**Date**: 2025-10-09
**Purpose**: Resolve technology choices and establish best practices for implementation

## Research Topics

### 1. Desktop Application Framework Choice

**Decision**: Electron 28+ with React 18+

**Rationale**:
- **Cross-platform foundation**: While current requirement is Windows-only, Electron provides future expansion path to macOS/Linux with minimal code changes
- **Familiar technology stack**: Web technologies (JavaScript, HTML, CSS, React) enable faster development than native Windows frameworks (WPF, WinForms)
- **Rich ecosystem**: Extensive npm package availability for JWT handling, UI components, and utilities
- **Mature tooling**: Well-established build tools (webpack, electron-builder) and debugging support in VS Code
- **Security model**: Clear separation between main process (privileged, Node.js access) and renderer process (sandboxed, web context) aligns with security principles
- **Auto-update capability**: electron-builder supports Windows auto-update via Squirrel.Windows

**Alternatives Considered**:
- **Native Windows (C# + WPF)**: Rejected due to longer development time, team unfamiliarity, and poor cross-platform potential
- **Tauri**: Rejected due to less mature ecosystem, Rust learning curve, and fewer community examples for similar use cases
- **NW.js**: Rejected due to smaller community, less active maintenance compared to Electron

**Trade-offs Accepted**:
- Larger application size (~150-200MB packaged vs. ~10-20MB for native) - acceptable for development tool
- Higher memory footprint (~80-120MB baseline) - acceptable for single-purpose desktop utility

**Best Practices**:
- Use `contextBridge` in preload script for secure IPC exposure (never expose full Node.js APIs to renderer)
- Enable `contextIsolation` and `nodeIntegration: false` in BrowserWindow options
- Use `ipcRenderer.invoke/handle` pattern for async main-renderer communication
- Minimize data passed through IPC; use references/IDs for large objects
- Package with electron-builder using NSIS installer for Windows

---

### 2. JWT Library Selection

**Decision**: jsonwebtoken 9.x

**Rationale**:
- **Industry standard**: Most widely used JWT library in Node.js ecosystem (25M+ weekly npm downloads)
- **Algorithm support**: Supports both required algorithms (HS256, RS256) plus many others for future expansion
- **Active maintenance**: Regularly updated for security patches and spec compliance
- **Simple API**: Intuitive sign/verify methods reduce implementation complexity
- **Good error handling**: Detailed error messages for debugging token generation issues
- **RFC 7519 compliant**: Strict adherence to JWT standard ensures compatibility with external validators

**Alternatives Considered**:
- **jose**: Rejected - more modern but smaller community, fewer Stack Overflow answers for troubleshooting
- **jwt-simple**: Rejected - too minimal, lacks RS256 support out of box
- **@auth0/node-jsonwebtoken**: Same as jsonwebtoken (rebranded)

**Usage Patterns**:
```javascript
// HS256 token generation
const token = jwt.sign(payload, Buffer.from(base64Key, 'base64'), {
  algorithm: 'HS256',
  expiresIn: '1h' // or explicit exp claim
});

// RS256 token generation
const token = jwt.sign(payload, rsaPrivateKey, {
  algorithm: 'RS256',
  expiresIn: expirationTimeSeconds
});

// Token parsing (no verification needed for display purposes)
const decoded = jwt.decode(token, { complete: true });
// Returns { header, payload, signature }
```

**Best Practices**:
- Always specify algorithm explicitly in sign() options (prevent algorithm confusion attacks)
- Use Buffer.from() for Base64 key decoding (handles encoding correctly)
- Set `expiresIn` option OR include `exp` claim in payload (not both - avoid confusion)
- For parsing existing tokens, use `decode()` not `verify()` (verification requires public key/secret)
- Clear key material from memory after token generation (set variables to null)

---

### 3. Data Persistence Strategy

**Decision**: electron-store 8.x

**Rationale**:
- **Electron-optimized**: Designed specifically for Electron apps, handles app path resolution automatically
- **Simple API**: Get/set interface similar to localStorage but persistent to disk
- **JSON storage**: Stores data as JSON files in user's AppData directory (standard Windows location)
- **Schema validation**: Built-in JSON schema validation prevents corrupted data
- **Atomic writes**: Uses atomic file operations to prevent data loss on crash
- **Encryption support**: Can encrypt entire store file (though we only encrypt keys via DPAPI)
- **Migration support**: Schema versioning enables future data model changes

**Alternatives Considered**:
- **lowdb**: Rejected - more complex API, requires manual Electron path handling
- **nedb**: Rejected - overkill for simple key-value storage, larger bundle size
- **Custom JSON files**: Rejected - would need to manually handle atomicity, corruption recovery, path resolution

**Storage Location**:
- Windows: `C:\Users\<username>\AppData\Roaming\jwt-token-generator\config.json`

**Data Structure**:
```javascript
{
  "profiles": [
    {
      "id": "uuid-v4",
      "name": "Dev Environment Admin",
      "algorithm": "HS256",
      "encryptedKey": "base64-dpapi-encrypted-key",
      "payload": { "userId": "admin001", ... },
      "expirationPreset": "1h",
      "createdAt": "2025-10-09T12:00:00Z",
      "updatedAt": "2025-10-09T14:30:00Z"
    }
  ],
  "settings": {
    "lastSelectedProfileId": "uuid-v4",
    "version": "1.0.0"
  }
}
```

**Best Practices**:
- Define JSON schema for validation (prevent invalid profile structures)
- Use UUIDs for profile IDs (not array indices - enables reordering)
- Store timestamps for created/updated (useful for debugging and future features)
- Implement data migration function for schema version upgrades
- Never store unencrypted keys (always DPAPI-encrypted)
- Use store.get/set with default values to handle first-run scenarios

---

### 4. Windows DPAPI Integration

**Decision**: node-dpapi 1.x

**Rationale**:
- **Windows-native encryption**: Uses Windows Data Protection API for secure key storage
- **User-scoped**: Encrypted data can only be decrypted by the same user on the same machine
- **No key management**: No need to manage encryption keys separately (handled by Windows)
- **Simple API**: Two methods: protectData() and unprotectData()
- **Native module**: Uses N-API bindings for performance and stability

**Alternatives Considered**:
- **Custom crypto module encryption**: Rejected - would need to securely store encryption key (chicken-egg problem)
- **Windows Credential Manager (via node-keytar)**: Rejected - more complex, designed for passwords not arbitrary data
- **No encryption**: Rejected - violates security requirements (FR-024, FR-049)

**Usage Pattern**:
```javascript
const dpapi = require('node-dpapi');

// Encrypt key before storing
function encryptKey(plaintextKey) {
  const encrypted = dpapi.protectData(
    Buffer.from(plaintextKey, 'utf8'),
    null, // optional entropy
    'CurrentUser' // scope
  );
  return encrypted.toString('base64');
}

// Decrypt key when generating token
function decryptKey(encryptedKeyBase64) {
  const encrypted = Buffer.from(encryptedKeyBase64, 'base64');
  const decrypted = dpapi.unprotectData(encrypted, null, 'CurrentUser');
  const plaintextKey = decrypted.toString('utf8');
  // Use key immediately
  // ... generate token ...
  // Clear from memory
  plaintextKey = null;
  return decrypted;
}
```

**Security Best Practices**:
- Encrypt in main process only (never expose DPAPI to renderer)
- Decrypt only immediately before JWT signing
- Clear decrypted key from memory after use (set to null, potentially call gc())
- Use 'CurrentUser' scope (not 'LocalMachine' - tighter security)
- Handle decryption errors gracefully (corrupted data, different user, different machine)
- Never log encryption/decryption operations or key material

**Error Handling**:
- If unprotectData fails, profile key is unusable (inform user, suggest re-entering key)
- Provide clear error: "Unable to decrypt stored key. This may occur if profile was created by different user or on different machine."

---

### 5. UI Component Library Choice

**Decision**: Material-UI (MUI) v5

**Rationale**:
- **Comprehensive component set**: Buttons, inputs, dialogs, lists, tabs - all needed components available
- **Professional appearance**: Clean, modern design out-of-box (important for developer tool credibility)
- **Customization**: Theme system allows branding and dark mode support
- **Accessibility**: ARIA attributes and keyboard navigation built-in
- **Documentation**: Extensive docs with live examples
- **React integration**: Designed for React, uses hooks pattern
- **Large community**: Easy to find solutions for common issues

**Alternatives Considered**:
- **Ant Design**: Good alternative, slightly heavier bundle but similar features
- **Tailwind CSS**: Rejected - requires more custom component development, less consistency
- **Chakra UI**: Rejected - smaller community, fewer components for complex UIs

**Key Components to Use**:
- `List`, `ListItem`, `ListItemButton` - Profile sidebar
- `TextField`, `Select` - Form inputs
- `Button`, `IconButton` - Actions
- `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions` - Modals for profile edit/delete
- `Tabs`, `TabPanel` - Form/JSON mode switching
- `Snackbar` - Toast notifications for success/error feedback
- `AppBar`, `Toolbar` - Top application bar (if used)

**Best Practices**:
- Use theme customization to match application identity
- Leverage `sx` prop for component-specific styling (avoid separate CSS files)
- Use MUI icons package (@mui/icons-material) for consistent iconography
- Implement dark mode via theme palette (future enhancement)

---

### 6. JSON Editor Component

**Decision**: Monaco Editor (via @monaco-editor/react)

**Rationale**:
- **VS Code experience**: Same editor as VS Code provides familiar, powerful editing
- **Syntax highlighting**: Excellent JSON syntax highlighting and error detection
- **Built-in validation**: Real-time JSON syntax validation with error messages
- **Autocomplete**: Smart suggestions for JSON structure
- **Formatting**: Built-in JSON pretty-print (Shift+Alt+F)
- **Lightweight wrapper**: @monaco-editor/react provides simple React integration
- **Large community**: Well-documented with many usage examples

**Alternatives Considered**:
- **CodeMirror**: Lighter weight but less feature-rich, older architecture
- **react-json-view**: Too restrictive (tree view only, harder to edit complex structures)
- **ACE Editor**: Less active development, fewer React examples

**Configuration**:
```javascript
<Editor
  height="400px"
  language="json"
  theme="vs-dark" // or "light"
  value={jsonString}
  onChange={handleJsonChange}
  options={{
    minimap: { enabled: false }, // Disable minimap for small editor
    lineNumbers: 'on',
    automaticLayout: true,
    formatOnPaste: true,
    formatOnType: true,
    scrollBeyondLastLine: false
  }}
/>
```

**Best Practices**:
- Lazy-load Monaco to reduce initial bundle size
- Catch parse errors and display in UI (don't crash on invalid JSON)
- Debounce onChange handler (avoid excessive validation on every keystroke)
- Provide "Format JSON" button for user convenience
- Set size limit validation before rendering (prevent editor crash on huge payloads)

---

### 7. Form-JSON Synchronization Strategy

**Decision**: React state with bidirectional transform functions

**Rationale**:
- **Single source of truth**: Maintain payload as JavaScript object in state
- **Transform on mode switch**: Convert to/from JSON string only when switching modes
- **Immediate validation**: Validate JSON syntax before switching back to form mode
- **Preserve unknown fields**: Form mode shows known fields; JSON mode shows everything

**Implementation Pattern**:
```javascript
// State structure
const [payloadObject, setPayloadObject] = useState({});
const [editMode, setEditMode] = useState('form'); // 'form' | 'json'
const [jsonString, setJsonString] = useState('');

// Form mode -> JSON mode
function switchToJsonMode() {
  setJsonString(JSON.stringify(payloadObject, null, 2));
  setEditMode('json');
}

// JSON mode -> Form mode
function switchToFormMode() {
  try {
    const parsed = JSON.parse(jsonString);
    setPayloadObject(parsed);
    setEditMode('form');
  } catch (error) {
    // Show error, don't switch modes
    showError('Invalid JSON: ' + error.message);
  }
}

// Form field changes
function handleFormFieldChange(fieldName, value) {
  setPayloadObject(prev => ({ ...prev, [fieldName]: value }));
}

// JSON editor changes
function handleJsonEditorChange(newJsonString) {
  setJsonString(newJsonString);
  // Optionally: validate and show errors in real-time
  // Don't update payloadObject until user switches back to form
}
```

**Edge Cases**:
- **Nested objects**: Form mode shows flat fields; JSON mode shows full structure
- **Array values**: Form mode may not support; keep in JSON, show warning in form mode
- **Custom fields**: Form mode has "Add Custom Field" button to add to payloadObject
- **Type preservation**: JSON mode allows string, number, boolean; form mode may coerce (handle carefully)

**Best Practices**:
- Use deep equality check before allowing mode switch (prevent accidental data loss)
- Show diff indicator when JSON mode content differs from form mode
- Provide "Reset to Last Saved" option if user makes invalid edits
- Validate field names (no spaces, no special chars except underscore)

---

### 8. IPC Communication Patterns

**Decision**: Contextual bridge with invoke/handle pattern

**Rationale**:
- **Security**: Never expose full Node.js APIs to renderer
- **Type safety**: Define clear IPC contracts
- **Async-friendly**: Invoke/handle supports Promises naturally
- **Error propagation**: Errors in main process propagate to renderer

**Architecture**:

**Preload script** (src/main/preload.js):
```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Profile operations
  loadProfiles: () => ipcRenderer.invoke('profiles:load'),
  saveProfile: (profile) => ipcRenderer.invoke('profiles:save', profile),
  deleteProfile: (profileId) => ipcRenderer.invoke('profiles:delete', profileId),

  // Key encryption
  encryptKey: (plaintextKey) => ipcRenderer.invoke('crypto:encrypt', plaintextKey),
  decryptKey: (encryptedKey) => ipcRenderer.invoke('crypto:decrypt', encryptedKey),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
});
```

**IPC Handlers** (src/main/ipc-handlers.js):
```javascript
const { ipcMain } = require('electron');
const storage = require('./storage');
const crypto = require('./crypto');

function registerHandlers() {
  ipcMain.handle('profiles:load', async () => {
    return storage.getAllProfiles();
  });

  ipcMain.handle('profiles:save', async (event, profile) => {
    return storage.saveProfile(profile);
  });

  ipcMain.handle('crypto:encrypt', async (event, plaintextKey) => {
    return crypto.encryptKey(plaintextKey);
  });

  // ... other handlers
}
```

**Renderer usage** (src/renderer/services/ipcService.js):
```javascript
class IPCService {
  async loadProfiles() {
    try {
      return await window.electronAPI.loadProfiles();
    } catch (error) {
      console.error('Failed to load profiles:', error);
      throw new Error('Unable to load profiles. Please restart the application.');
    }
  }

  async encryptAndSaveProfile(profile, plaintextKey) {
    const encryptedKey = await window.electronAPI.encryptKey(plaintextKey);
    const profileWithEncryptedKey = { ...profile, encryptedKey };
    return window.electronAPI.saveProfile(profileWithEncryptedKey);
  }
}
```

**Best Practices**:
- Namespace IPC channels by feature (profiles:*, crypto:*, settings:*)
- Validate inputs in both renderer and main process
- Return structured error objects (not raw Error instances - they don't serialize well)
- Log IPC errors in main process for debugging
- Use TypeScript or JSDoc to document IPC contracts

---

### 9. Testing Strategy

**Decision**: Multi-layer testing with Jest + React Testing Library + Spectron

**Test Pyramid**:

**Unit Tests** (70% coverage):
- **Services**: JWT generation, validation logic, formatting utils
- **Utils**: Base64 validation, PEM format validation, date formatting
- **Crypto**: DPAPI encryption/decryption (mock in tests)
- **Tools**: Jest, jest-mock for IPC mocking

**Integration Tests** (20% coverage):
- **IPC communication**: Main-renderer communication flows
- **Profile persistence**: Save/load/delete operations
- **State management**: Context providers and hooks
- **Tools**: Jest with IPC test harness

**E2E Tests** (10% coverage):
- **Critical user flows**: Generate token from profile, create new profile, parse existing token
- **Cross-feature scenarios**: Edit profile, switch algorithms, validate key, generate token
- **Tools**: Spectron (Electron-specific E2E framework)

**Test Examples**:

**Unit test** (tests/unit/services/jwtService.test.js):
```javascript
describe('JWTService', () => {
  test('generates valid HS256 token', () => {
    const payload = { userId: 'test123' };
    const key = 'base64-encoded-key';
    const token = jwtService.generateToken('HS256', key, payload, '1h');

    expect(token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/); // JWT format
    const decoded = jwt.decode(token, { complete: true });
    expect(decoded.header.alg).toBe('HS256');
    expect(decoded.payload.userId).toBe('test123');
  });

  test('throws error for invalid key format', () => {
    expect(() => {
      jwtService.generateToken('HS256', 'not-base64!@#', {}, '1h');
    }).toThrow('Invalid Base64 key format');
  });
});
```

**Integration test** (tests/integration/ipc/profiles.test.js):
```javascript
describe('Profile IPC', () => {
  test('saves and loads profile correctly', async () => {
    const profile = {
      id: 'test-id',
      name: 'Test Profile',
      algorithm: 'HS256',
      payload: { userId: 'test' }
    };

    await ipcRenderer.invoke('profiles:save', profile);
    const loaded = await ipcRenderer.invoke('profiles:load');

    expect(loaded).toContainEqual(expect.objectContaining(profile));
  });
});
```

**E2E test** (tests/e2e/scenarios/token-generation.test.js):
```javascript
describe('Token Generation Flow', () => {
  test('user can generate token from default profile', async () => {
    const app = await startApp();

    // Select first profile
    await app.client.click('[data-testid="profile-list-item-0"]');

    // Enter key
    await app.client.setValue('[data-testid="key-input"]', 'test-key-base64');

    // Click generate
    await app.client.click('[data-testid="generate-button"]');

    // Verify token displayed
    const token = await app.client.getText('[data-testid="token-output"]');
    expect(token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);

    await app.stop();
  });
});
```

**Best Practices**:
- Test behavior, not implementation details
- Use data-testid attributes for E2E selectors (not class names that may change)
- Mock IPC in unit tests (use jest.mock('electron'))
- Test error paths as thoroughly as happy paths
- Run E2E tests in CI on Windows VM (ensure DPAPI works correctly)

---

### 10. Build and Packaging Strategy

**Decision**: electron-builder with NSIS installer

**Rationale**:
- **Industry standard**: Most popular Electron packaging tool
- **Windows installer**: NSIS creates professional Windows installers with shortcuts, uninstaller
- **Code signing support**: Can sign executables (important for Windows SmartScreen)
- **Auto-update**: Built-in support for Squirrel.Windows auto-updates
- **Asset optimization**: Automatic ASAR packaging for faster loading

**Configuration** (electron-builder.json):
```json
{
  "appId": "com.example.jwt-token-generator",
  "productName": "JWT Token Generator",
  "directories": {
    "output": "dist"
  },
  "files": [
    "src/**/*",
    "public/**/*",
    "package.json"
  ],
  "win": {
    "target": ["nsis"],
    "icon": "public/icons/icon.ico",
    "publisherName": "Your Organization",
    "verifyUpdateCodeSignature": false
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true
  }
}
```

**Build Scripts** (package.json):
```json
{
  "scripts": {
    "start": "electron .",
    "dev": "webpack serve --mode development",
    "build:renderer": "webpack --mode production",
    "build:main": "webpack --config webpack.main.config.js --mode production",
    "build": "npm run build:renderer && npm run build:main",
    "pack": "electron-builder --dir",
    "dist": "electron-builder",
    "test": "jest",
    "test:e2e": "jest --config jest.e2e.config.js"
  }
}
```

**Best Practices**:
- Separate webpack configs for main and renderer processes
- Use environment variables for production vs development (enable DevTools only in dev)
- Minimize ASAR package size (exclude dev dependencies, source maps in production)
- Code signing: Obtain certificate for production builds (reduces Windows SmartScreen warnings)
- Test packaged app thoroughly (different behavior than development mode)
- Include license file and README in installer
- Version consistently across package.json, electron-builder, and application

---

## Summary of Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Desktop Framework** | Electron | 28+ | Desktop application container |
| **UI Framework** | React | 18+ | Component-based UI rendering |
| **UI Components** | Material-UI (MUI) | 5.x | Pre-built UI component library |
| **JWT Library** | jsonwebtoken | 9.x | JWT generation and parsing |
| **JSON Editor** | Monaco Editor | latest | Advanced JSON editing with validation |
| **Data Storage** | electron-store | 8.x | Persistent configuration storage |
| **Key Encryption** | node-dpapi | 1.x | Windows DPAPI for key encryption |
| **State Management** | React Context + Hooks | - | Application state management |
| **Build Tool** | Webpack | 5.x | Module bundling |
| **Package Tool** | electron-builder | latest | Windows installer creation |
| **Testing** | Jest | 29.x | Unit and integration testing |
| **Testing** | React Testing Library | 14.x | React component testing |
| **Testing** | Spectron | 19.x | Electron E2E testing |

**All technology choices align with Constitution Principles**:
- Single Responsibility: Clear separation (main process vs renderer, components vs services)
- Security: DPAPI encryption, no key logging, input validation
- User Experience: Fast startup, immediate feedback, professional UI
- Code Quality: Mature libraries with good documentation and community support
- Testing: Comprehensive test strategy across all layers

---

## Implementation Phases

Based on this research, implementation will proceed in phases:

**Phase 1: Foundation** (Week 1)
- Set up Electron + React project structure
- Configure webpack, electron-builder, Jest
- Implement basic window and navigation
- Set up Material-UI theme

**Phase 2: Core JWT Features** (Week 2)
- Implement JWT generation service (HS256, RS256)
- Build token display and copy components
- Add token parsing and visualization
- Write unit tests for JWT service

**Phase 3: Profile Management** (Week 3)
- Implement electron-store integration
- Build profile CRUD operations
- Create default profiles on first launch
- Implement profile selection UI

**Phase 4: Key Management** (Week 4)
- Integrate node-dpapi for encryption
- Implement key input and validation
- Build key encryption/decryption IPC
- Test encryption across Windows versions

**Phase 5: Payload Editor** (Week 5)
- Build form mode editor with common fields
- Integrate Monaco Editor for JSON mode
- Implement mode switching with data sync
- Add custom field addition UI

**Phase 6: Polish & Testing** (Week 6)
- Add error handling throughout
- Implement keyboard shortcuts
- Write integration and E2E tests
- Create user documentation
- Package for distribution

Total estimated time: 6 weeks for MVP (all P1 and P2 features)

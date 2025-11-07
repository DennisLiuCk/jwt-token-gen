# JWT Token Generator for Windows

> A professional desktop application for quickly generating, managing, and testing JWT tokens with support for HS256 and RS256 signing algorithms.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey)

## Features

✅ **All Features Implemented and Ready for Production**

- **Quick Token Generation**: Generate JWT tokens instantly from pre-configured profiles
- **Multi-Algorithm Support**: HS256 (HMAC with SHA-256) and RS256 (RSA with SHA-256)
- **Profile Management**: Save and manage up to 50 token configurations for different environments
- **Dual Payload Editing**: Switch between intuitive form-based and powerful JSON-based payload editing
- **Type-Safe Payloads**: Specify data types (String, Number, Boolean, Null) for each claim field with visual type selectors
- **Secure Key Storage**: Automatic encryption of signing keys using Windows DPAPI
- **Token Parsing**: Parse and analyze existing JWT tokens with human-readable timestamps
- **Flexible Expiration**: Configure expiration times with presets (1h, 1d, 1w) or custom timestamps
- **One-Click Copy**: Copy generated tokens to clipboard instantly
- **Default Profiles**: Three pre-configured profiles for common scenarios
- **Keyboard Shortcuts**: Ctrl+G (generate), Ctrl+C (copy), Escape (close dialogs)
- **Professional UI**: Modern, Claude-inspired design with Material-UI components

## Installation

### For End Users

**Prerequisites**: Windows 10 or Windows 11 (x64)

1. Download the latest installer from the [Releases](../../releases) page
2. Run `JWT-Token-Generator-Setup-0.1.0.exe`
3. Follow the installation wizard
4. Launch from Start Menu or Desktop shortcut

### For Developers

**Prerequisites**: Node.js 18+, Windows 10/11

```bash
# Clone the repository
git clone <repository-url>
cd jwt-token-gen

# Install dependencies
npm install

# Run in development mode
npm start

# Build for production
npm run build

# Create installer
npm run dist
```

## Development

### Project Structure
```
jwt-token-gen/
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.js        # App entry point
│   │   ├── preload.js     # IPC bridge
│   │   ├── storage.js     # Profile persistence
│   │   ├── crypto.js      # Key encryption
│   │   └── ipc-handlers.js # IPC handlers
│   │
│   ├── renderer/          # React UI
│   │   ├── components/    # UI components
│   │   ├── services/      # Business logic
│   │   ├── hooks/         # Custom React hooks
│   │   ├── context/       # State management
│   │   └── utils/         # Utilities
│   │
│   └── shared/            # Shared code
│       ├── constants.js   # Constants
│       ├── types.js       # Type definitions
│       └── defaultProfiles.js
│
├── tests/                 # Test suites
└── public/               # Static assets
```

### Available Scripts

```bash
# Development
npm start              # Start Electron app
npm run dev           # Start webpack dev server

# Building
npm run build:main    # Build main process
npm run build:renderer # Build renderer process
npm run build         # Build both

# Packaging
npm run pack          # Package for testing (unpacked)
npm run dist          # Create installer

# Code Quality
npm test              # Run tests
npm run lint          # Lint code
npm run format        # Format code with Prettier
```

## Quick Start Guide

### 1. Select a Profile

The application comes with three default profiles. Click on one to get started:

- **Dev Environment Admin** (HS256): For development environment testing
- **Hybris Merchant Admin** (HS256): For e-commerce merchant scenarios
- **OpenAPI Profile** (RS256): For API client authentication

### 2. Enter Your Signing Key

Based on the selected algorithm:
- **HS256**: Enter a Base64-encoded secret key
- **RS256**: Enter a PEM-encoded RSA private key (with BEGIN/END markers)

**Note**: Keys are automatically encrypted using Windows DPAPI and stored securely.

### 3. Configure the Payload (with Type Support)

Edit the payload using either:
- **Form Mode**: Fill in common fields with type selectors for each field
  - Click the colored type dropdown next to each field to choose: **String**, **Number**, **Boolean**, or **Null**
  - Type selectors appear as color-coded chips (String=green, Number=blue, Boolean=purple, Null=gray)
  - Values are automatically converted to the selected type when generating tokens
- **JSON Mode**: Edit as raw JSON with Monaco Editor syntax highlighting

Add custom fields as needed by clicking "Add Custom Field" in form mode. Each custom field gets its own type selector.

### 4. Set Expiration

Choose from preset expiration times or set a custom timestamp:
- **1 hour** (3600 seconds)
- **1 day** (86400 seconds)
- **1 week** (604800 seconds)
- **Custom**: Specify an exact expiration date and time

### 5. Generate & Copy Token

- Click **Generate Token** or press `Ctrl+G`
- View the decoded header and payload
- Click **Copy** to copy the token to your clipboard
- Use in Postman, curl, or any API testing tool

## Advanced Usage

### Creating a New Profile

1. Click the **+ New Profile** button
2. Enter a unique profile name (1-50 characters)
3. Select the signing algorithm
4. Enter your signing key
5. Configure the default payload
6. Set the default expiration
7. Click **Save**

### Editing Profiles

1. Select the profile to edit
2. Click the **Edit** button (pencil icon)
3. Make your changes
4. Click **Save**

### Deleting Profiles

1. Select the profile to delete
2. Click the **Delete** button (trash icon)
3. Confirm deletion

**Warning**: Profile deletion is permanent.

### Using Type Selectors

Each payload field has a type selector that controls how the value is encoded in the JWT:

1. **String** (default) - Text values like "admin001" or "user@example.com"
   - Stored and encoded as JSON strings with quotes
   - Use for: usernames, emails, text identifiers, role names

2. **Number** - Numeric values like 123 or 45.67
   - Automatically converted from text input to numbers
   - Stored without quotes in the JWT
   - Use for: user IDs, numeric codes, counts, amounts

3. **Boolean** - True/false values
   - Accepts "true"/"false" or "1"/"0" in text input
   - Converted to actual boolean values (true/false)
   - Use for: feature flags, permissions, enabled/disabled states

4. **Null** - Explicitly null values
   - Encoded as `null` in JSON
   - Use for: optional fields that are intentionally empty

**Examples:**

```javascript
// Field: userId, Value: "123", Type: String
// JWT payload: {"userId": "123"}  ← quoted string

// Field: userId, Value: "123", Type: Number
// JWT payload: {"userId": 123}  ← unquoted number

// Field: isAdmin, Value: "true", Type: Boolean
// JWT payload: {"isAdmin": true}  ← boolean value

// Field: optionalData, Type: Null
// JWT payload: {"optionalData": null}  ← null value
```

**Tip:** The type selector only affects the final JWT encoding. You can always edit the text value freely in the input field, and it will be converted when you generate the token.

### Parsing Existing Tokens

1. Scroll to the **Token Parser** section
2. Paste a JWT token into the input
3. View the decoded header and payload
4. See timestamps in human-readable format
5. Copy individual claim values

### Keyboard Shortcuts

- `Ctrl+G`: Generate Token
- `Ctrl+C`: Copy Token (when displayed)
- `Escape`: Close dialogs

### Key Formats

**HS256 (HMAC-SHA256)**
```
Base64-encoded secret key
Example: dGVzdC1rZXktc2VjcmV0LWZvci1obWFjLXNoYTI1Ng==
```

**RS256 (RSA-SHA256)**
```
PEM-encoded RSA private key
Example:
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
-----END RSA PRIVATE KEY-----
```

## Security

### Key Encryption (Windows DPAPI)

All signing keys are encrypted at rest using **Windows Data Protection API (DPAPI)** with `CurrentUser` scope:

- Keys are encrypted automatically when you save a profile
- Only the same Windows user account on the same machine can decrypt the keys
- Keys are never logged or transmitted
- Plaintext keys are cleared from memory immediately after token generation

### Important Security Notes

⚠️ **Do not share profiles between different machines** - encrypted keys cannot be decrypted elsewhere

⚠️ **Do not share the config.json file** - it contains encrypted keys

⚠️ **Use strong keys**:
  - HS256: At least 256 bits (32 bytes)
  - RS256: At least 2048 bits

⚠️ **Treat generated tokens as sensitive** - they can authenticate as the specified user

### Application Security

- **No Network Access**: Fully offline operation
- **Secure IPC**: Context isolation enabled, node integration disabled
- **Input Validation**: Multi-layer validation for keys, payloads, and configuration
- **Error Handling**: No sensitive data in error messages

## Troubleshooting

### Cannot decrypt stored key

**Error**: "Unable to decrypt key. This profile may have been created on a different machine."

**Solution**: The profile was created on a different Windows user account or machine. Re-enter the signing key manually and save the profile again.

### Profile limit reached

**Error**: "Maximum profile limit (50) reached."

**Solution**: Delete unused profiles to free up slots.

### Invalid key format

**Error**: "Invalid Base64 key format" or "Invalid PEM format."

**Solution**:
- HS256: Ensure valid Base64 encoding (no spaces, correct padding)
- RS256: Ensure PEM markers (`-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`) are present

### Token validation fails

**Problem**: Generated token is rejected by external services.

**Solution**:
- Verify correct algorithm (HS256 vs RS256)
- Verify key matches what the service expects
- Check payload contains all required claims
- Ensure token hasn't expired

## Configuration Files

### Storage Location

```
C:\Users\<username>\AppData\Roaming\jwt-token-gen\config.json
```

Contains:
- All saved profiles (with encrypted keys)
- Application settings
- Last selected profile

### Backup and Restore

To backup your profiles:
1. Close the application
2. Copy `config.json` to a safe location
3. Restore by copying back to original location

**Note**: Backups only work on the same Windows user account due to DPAPI encryption.

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Desktop Framework | Electron | 38+ |
| UI Framework | React | 19+ |
| UI Components | Material-UI | 7+ |
| JWT Library | jsonwebtoken | 9.x |
| JSON Editor | Monaco Editor | latest |
| Storage | electron-store | 8.x |
| Encryption | Windows DPAPI | native |
| Build Tool | Webpack | 5.x |
| Package Tool | electron-builder | latest |
| Testing | Jest | 30.x |

## Limitations

- Maximum 50 profiles (performance optimization)
- Maximum 64KB payload size (JWT best practice)
- Windows-only (due to DPAPI encryption)

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests and documentation
5. Submit a pull request

### Code Style

- Follow existing patterns
- Add JSDoc comments
- Run `npm run lint` and `npm run format`
- Write tests for new features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- UI components from [Material-UI](https://mui.com/)
- JWT handling by [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- Code editor powered by [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- Developed following Specify methodology and constitutional principles

## Support

- **Issues**: Use GitHub Issues to report bugs or request features
- **Documentation**: See `/specs/001-jwt-token-generator/` for detailed specifications

---

**Made with ❤️ for developers and testers who work with JWT tokens**

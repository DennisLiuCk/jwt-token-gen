# JWT Token Generator for Windows

A desktop application for generating, managing, and testing JWT tokens with support for HS256 and RS256 signing algorithms.

## Features

### ✅ Implemented
- **Desktop Application**: Electron-based app for Windows 10/11
- **Secure Key Storage**: Encrypted key storage using machine-specific encryption
- **Default Profiles**: Pre-configured profiles for common use cases
- **Profile Management**: Create, edit, and delete custom profiles
- **JWT Generation**: Support for HS256 (HMAC) and RS256 (RSA) algorithms
- **Material-UI Interface**: Modern, responsive UI

### 🚧 In Development
- **Token Display & Copy**: One-click token copying to clipboard
- **Expiration Control**: Preset and custom expiration times
- **Dual Payload Editing**: Form-based and JSON-based payload editing
- **Token Parsing**: Decode and analyze existing JWT tokens

## Installation

### Prerequisites
- Node.js 18+
- Windows 10 or Windows 11

### Setup
```bash
# Install dependencies
npm install

# Build the application
npm run build

# Run in development mode
npm start
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

## Usage

### Quick Start

1. **Launch the application**
2. **Select a default profile** (Dev Environment Admin, Hybris Merchant Admin, or OpenAPI Profile)
3. **Enter your signing key**:
   - For HS256: Base64-encoded secret key
   - For RS256: PEM-encoded RSA private key
4. **Configure expiration** (1h, 1d, 1w, or custom)
5. **Generate token** and copy to clipboard

### Default Profiles

**Dev Environment Admin** (HS256)
- Payload: userId, username, email, roleCode
- Expiration: 1 hour

**Hybris Merchant Admin** (HS256)
- Payload: userId, username, email, roleCode, merchantId
- Expiration: 1 day

**OpenAPI Profile** (RS256)
- Payload: sub, apiKey
- Expiration: 1 week

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

- **Key Encryption**: All signing keys are encrypted before storage using AES-256-CBC with a machine-specific key
- **No Network Access**: Application runs completely offline
- **Secure IPC**: Context isolation enabled, node integration disabled
- **Memory Clearing**: Plaintext keys are cleared from memory immediately after use

## Technology Stack

- **Framework**: Electron 38+
- **UI**: React 19+ with Material-UI 7+
- **JWT**: jsonwebtoken 9.x
- **Storage**: electron-store 11.x
- **Build**: Webpack 5, Babel 7
- **Testing**: Jest 30+

## Limitations

- Maximum 50 profiles
- Maximum 64KB payload size
- Windows-only (DPAPI encryption fallback implemented)

## Development Status

See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for detailed progress.

**Current Status**: MVP in development (91% complete)
- ✅ Foundation complete
- ✅ Core services implemented
- 🚧 UI components in progress

## Contributing

This is a development tool. For issues or feature requests, please create an issue in the repository.

## License

MIT

## Acknowledgments

Built following Specify methodology and constitutional principles for secure, maintainable code.

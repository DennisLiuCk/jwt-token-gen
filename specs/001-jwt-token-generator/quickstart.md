# Quickstart Guide: JWT Token Generator Development

**Feature**: 001-jwt-token-generator
**Date**: 2025-10-09
**Target Audience**: Developers implementing the JWT Token Generator for Windows

## Prerequisites

**Development Environment**:
- **Operating System**: Windows 10 or Windows 11 (for DPAPI testing)
- **Node.js**: Version 18.x or higher ([Download](https://nodejs.org/))
- **npm**: Version 9.x or higher (included with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code recommended (with React and ESLint extensions)

**Recommended VS Code Extensions**:
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- ES7+ React/Redux/React-Native snippets (dsznajder.es7-react-js-snippets)

**Windows-Specific Requirements**:
- Visual Studio Build Tools 2019 or later (for node-dpapi native module compilation)
  - Install via: `npm install --global windows-build-tools`

---

## Project Setup

### 1. Initialize Project

```bash
# Create project directory
mkdir jwt-token-generator
cd jwt-token-generator

# Initialize npm project
npm init -y

# Initialize Git repository
git init
```

### 2. Install Core Dependencies

```bash
# Electron and React
npm install electron react react-dom

# JWT library
npm install jsonwebtoken

# Electron utilities
npm install electron-store
npm install node-dpapi

# UI Framework
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled

# Monaco Editor for JSON editing
npm install @monaco-editor/react monaco-editor

# Utilities
npm install uuid
```

### 3. Install Development Dependencies

```bash
# Build tools
npm install --save-dev webpack webpack-cli webpack-dev-server
npm install --save-dev @babel/core @babel/preset-env @babel/preset-react babel-loader
npm install --save-dev html-webpack-plugin

# Electron packaging
npm install --save-dev electron-builder

# Testing
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev spectron

# Code quality
npm install --save-dev eslint eslint-plugin-react eslint-plugin-react-hooks
npm install --save-dev prettier
```

### 4. Project Structure Setup

```bash
# Create directory structure
mkdir -p src/main
mkdir -p src/renderer/components
mkdir -p src/renderer/services
mkdir -p src/renderer/hooks
mkdir -p src/renderer/context
mkdir -p src/renderer/utils
mkdir -p src/shared
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p tests/e2e
mkdir -p public/icons
```

---

## Configuration Files

### package.json (Main Scripts)

```json
{
  "name": "jwt-token-generator",
  "version": "0.1.0",
  "description": "JWT Token Generator for Windows",
  "main": "src/main/main.js",
  "scripts": {
    "start": "electron .",
    "dev": "webpack serve --mode development --config webpack.renderer.config.js",
    "build:renderer": "webpack --mode production --config webpack.renderer.config.js",
    "build:main": "webpack --mode production --config webpack.main.config.js",
    "build": "npm run build:renderer && npm run build:main",
    "pack": "electron-builder --dir",
    "dist": "npm run build && electron-builder",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "jest --config jest.e2e.config.js",
    "lint": "eslint src/**/*.{js,jsx}",
    "format": "prettier --write src/**/*.{js,jsx,json,css}"
  },
  "keywords": ["jwt", "token", "generator", "electron"],
  "author": "Your Name",
  "license": "MIT"
}
```

### webpack.renderer.config.js

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  target: 'electron-renderer',
  entry: './src/renderer/index.jsx',
  output: {
    path: path.resolve(__dirname, 'dist/renderer'),
    filename: 'renderer.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/renderer/index.html'
    })
  ],
  devServer: {
    port: 3000,
    hot: true
  }
};
```

### webpack.main.config.js

```javascript
const path = require('path');

module.exports = {
  target: 'electron-main',
  entry: './src/main/main.js',
  output: {
    path: path.resolve(__dirname, 'dist/main'),
    filename: 'main.js'
  },
  node: {
    __dirname: false,
    __filename: false
  }
};
```

### electron-builder.json

```json
{
  "appId": "com.example.jwt-token-generator",
  "productName": "JWT Token Generator",
  "directories": {
    "output": "release"
  },
  "files": [
    "dist/**/*",
    "package.json"
  ],
  "win": {
    "target": ["nsis"],
    "icon": "public/icons/icon.ico"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true
  }
}
```

### jest.config.js

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/tests/__mocks__/styleMock.js'
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  testMatch: ['**/tests/unit/**/*.test.js', '**/tests/integration/**/*.test.js']
};
```

### .eslintrc.js

```javascript
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['react', 'react-hooks'],
  rules: {
    'react/prop-types': 'off',
    'no-unused-vars': 'warn'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
```

---

## Minimal Working Example

### 1. Main Process (src/main/main.js)

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the app (development vs production)
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

### 2. Preload Script (src/main/preload.js)

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Profile operations
  loadProfiles: () => ipcRenderer.invoke('profiles:load'),
  saveProfile: (profile) => ipcRenderer.invoke('profiles:save', profile),
  deleteProfile: (id) => ipcRenderer.invoke('profiles:delete', id),

  // Crypto operations
  encryptKey: (key) => ipcRenderer.invoke('crypto:encrypt', key),
  decryptKey: (encryptedKey) => ipcRenderer.invoke('crypto:decrypt', encryptedKey),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings)
});
```

### 3. Renderer Entry (src/renderer/index.jsx)

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 4. Renderer HTML (src/renderer/index.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JWT Token Generator</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

### 5. Main App Component (src/renderer/App.jsx)

```javascript
import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const theme = createTheme();

function App() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    try {
      const result = await window.electronAPI.loadProfiles();
      if (result.success) {
        setProfiles(result.data);
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          JWT Token Generator
        </Typography>
        <Typography variant="body1">
          Profiles loaded: {profiles.length}
        </Typography>
        <Button variant="contained" onClick={loadProfiles}>
          Reload Profiles
        </Button>
      </Container>
    </ThemeProvider>
  );
}

export default App;
```

---

## Running the Application

### Development Mode

```bash
# Terminal 1: Start Webpack dev server (renderer process)
npm run dev

# Terminal 2: Start Electron (main process)
npm start
```

**Hot Reload**: Changes to renderer code will hot-reload. Changes to main process require restart.

### Production Build

```bash
# Build both main and renderer processes
npm run build

# Create distributable package
npm run dist
```

**Output**: Windows installer in `release/` directory

---

## Development Workflow

### 1. Implement Core Features (Order)

**Phase 1: Foundation**
1. Set up Electron window management
2. Configure IPC communication (preload + handlers)
3. Implement electron-store wrapper
4. Create Material-UI theme

**Phase 2: JWT Core**
1. Create JWT service (generation, parsing)
2. Implement key validation (Base64, PEM format)
3. Build token display component
4. Add clipboard copy functionality

**Phase 3: Profile Management**
1. Implement profile CRUD in main process
2. Create default profiles on first launch
3. Build profile list UI component
4. Add profile selection state management

**Phase 4: Key Encryption**
1. Integrate node-dpapi wrapper
2. Implement encrypt/decrypt IPC handlers
3. Add key input validation UI
4. Test encryption across Windows user accounts

**Phase 5: Payload Editor**
1. Build form mode with common fields
2. Integrate Monaco Editor for JSON mode
3. Implement mode switching logic
4. Add custom field addition UI

**Phase 6: Polish**
1. Add error handling throughout
2. Implement loading states
3. Add keyboard shortcuts
4. Write comprehensive tests

### 2. Testing Strategy

**Unit Tests** (Run with `npm test`):
```javascript
// tests/unit/services/jwtService.test.js
import { generateToken } from '../../../src/renderer/services/jwtService';

describe('JWT Service', () => {
  test('generates valid HS256 token', () => {
    const token = generateToken('HS256', 'test-key', { userId: 'test' }, 3600);
    expect(token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
  });
});
```

**Integration Tests**:
```javascript
// tests/integration/ipc/profiles.test.js
const { ipcMain } = require('electron');
const { loadProfiles } = require('../../../src/main/ipc-handlers');

describe('Profile IPC', () => {
  test('loads profiles successfully', async () => {
    const result = await loadProfiles();
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
  });
});
```

**E2E Tests** (Run with `npm run test:e2e`):
```javascript
// tests/e2e/token-generation.test.js
const { Application } = require('spectron');

describe('Token Generation Flow', () => {
  let app;

  beforeEach(async () => {
    app = new Application({
      path: 'path/to/electron',
      args: ['path/to/app']
    });
    await app.start();
  });

  afterEach(async () => {
    if (app && app.isRunning()) {
      await app.stop();
    }
  });

  test('generates token from profile', async () => {
    await app.client.click('[data-testid="profile-0"]');
    await app.client.setValue('[data-testid="key-input"]', 'test-key');
    await app.client.click('[data-testid="generate-btn"]');
    const token = await app.client.getText('[data-testid="token-output"]');
    expect(token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
  });
});
```

### 3. Debugging

**Renderer Process**:
- Open DevTools in development mode
- Use React DevTools browser extension
- Console logs appear in DevTools console

**Main Process**:
- Terminal output shows main process logs
- Use `console.log()` in main process code
- Errors appear in terminal

**IPC Communication**:
```javascript
// Add logging in preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  loadProfiles: async () => {
    console.log('[IPC] loadProfiles called');
    const result = await ipcRenderer.invoke('profiles:load');
    console.log('[IPC] loadProfiles result:', result);
    return result;
  }
});
```

---

## Common Issues & Solutions

### Issue: node-dpapi Won't Compile

**Solution**: Install Visual Studio Build Tools
```bash
npm install --global windows-build-tools
# Then reinstall node-dpapi
npm install node-dpapi
```

### Issue: Electron Window Opens Blank

**Solution**: Check if webpack dev server is running on port 3000
```bash
# Ensure dev server is running
npm run dev

# Then start Electron
npm start
```

### Issue: IPC Calls Fail with "electronAPI is undefined"

**Solution**: Verify preload script is loaded
```javascript
// In main.js BrowserWindow configuration
webPreferences: {
  contextIsolation: true,
  nodeIntegration: false,
  preload: path.join(__dirname, 'preload.js') // Ensure path is correct
}
```

### Issue: Monaco Editor Not Loading

**Solution**: Configure webpack to handle Monaco assets
```bash
npm install --save-dev monaco-editor-webpack-plugin
```

Add to webpack.renderer.config.js:
```javascript
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  // ... other config
  plugins: [
    new MonacoWebpackPlugin({
      languages: ['json']
    })
  ]
};
```

---

## Next Steps

1. **Review Architecture**: Read `/specs/001-jwt-token-generator/plan.md`
2. **Understand Data Model**: Review `/specs/001-jwt-token-generator/data-model.md`
3. **Study IPC Contracts**: Familiarize with `/specs/001-jwt-token-generator/contracts/ipc-api.md`
4. **Follow Constitution**: Ensure code adheres to `.specify/memory/constitution.md` principles
5. **Implement Features**: Follow development workflow outlined above
6. **Write Tests**: Aim for 70% unit test coverage, 20% integration, 10% E2E
7. **Package Application**: Use electron-builder to create Windows installer

---

## Resources

**Electron Documentation**: https://www.electronjs.org/docs/latest/
**React Documentation**: https://react.dev/
**Material-UI Components**: https://mui.com/material-ui/getting-started/
**jsonwebtoken Library**: https://github.com/auth0/node-jsonwebtoken
**Monaco Editor React**: https://github.com/suren-atoyan/monaco-react

**Project-Specific Docs**:
- Feature Specification: `/specs/001-jwt-token-generator/spec.md`
- Implementation Plan: `/specs/001-jwt-token-generator/plan.md`
- Data Model: `/specs/001-jwt-token-generator/data-model.md`
- IPC Contracts: `/specs/001-jwt-token-generator/contracts/ipc-api.md`
- Technology Research: `/specs/001-jwt-token-generator/research.md`

---

## Questions or Issues?

If you encounter issues not covered in this guide:

1. Check the constitution (`.specify/memory/constitution.md`) for design principles
2. Review the feature spec (`spec.md`) for requirements clarification
3. Consult the IPC contracts (`contracts/ipc-api.md`) for API usage
4. Search Electron/React documentation
5. Create an issue in the project repository with detailed description

---

**Happy Coding!** Remember to follow the constitutional principles (single responsibility, security, user experience) as you build.

# Implementation Plan: JWT Token Generator for Windows

**Branch**: `001-jwt-token-generator` | **Date**: 2025-10-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-jwt-token-generator/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

A Windows desktop application that enables developers and testers to quickly generate, manage, and test JWT tokens with support for HS256 and RS256 signing algorithms. The application provides profile-based management for different test scenarios, dual-mode payload editing (form and JSON), secure key storage using Windows DPAPI, and one-click token copying for seamless integration with API testing workflows. Technical approach uses Electron + React for cross-platform desktop UI, jsonwebtoken library for JWT operations, electron-store for persistent configuration, and node-dpapi for Windows-native key encryption.

## Technical Context

**Language/Version**: JavaScript (Node.js 18+) with React 18+ for UI
**Primary Dependencies**:
  - Electron 28+ (desktop application framework)
  - React 18+ with React Hooks (UI framework)
  - jsonwebtoken 9.x (JWT generation and parsing)
  - electron-store 8.x (persistent configuration storage)
  - node-dpapi 1.x (Windows DPAPI key encryption)
  - Material-UI (MUI) v5 (UI component library)
  - Monaco Editor (JSON editor with syntax highlighting)
**Storage**: Local file system using electron-store (JSON format), stored in user's AppData directory
**Testing**: Jest for unit tests, React Testing Library for component tests, Electron's spectron for integration tests
**Target Platform**: Windows 10 and Windows 11 (x64)
**Project Type**: Desktop application (Electron-based)
**Performance Goals**:
  - Application startup: <2 seconds
  - Token generation: <100ms (end-to-end including DPAPI decryption, JWT signing, and rendering)
  - UI responsiveness: <100ms for user feedback
**Form/JSON Synchronization Strategy**:
  - Form mode: No debounce needed (discrete field changes update payload state immediately)
  - JSON mode: Debounce validation by 300ms to improve performance and avoid excessive validation on every keystroke
  - Mode switching: Validate immediately (no debounce) to provide instant feedback
**Constraints**:
  - Fully offline operation (no network dependencies)
  - Single executable deployment (packaged with electron-builder)
  - Maximum 50 profiles supported
  - Maximum 64KB payload size
  - DPAPI encryption for keys only (payloads in plain text)
**Scale/Scope**:
  - Single-user desktop application
  - ~15-20 React components
  - 3 main feature modules (JWT generation, profile management, key management)
  - ~10 IPC handlers for main-renderer communication

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Code Organization Principles

**Single Responsibility Principle**:
- ✅ PASS: Architecture separates JWT generation (services), UI (components), storage (IPC + electron-store), and encryption (main process DPAPI wrapper)
- ✅ PASS: React components focused on single UI concerns (ProfileList, PayloadEditor, TokenDisplay)
- ✅ PASS: Main process handles system operations; renderer process handles UI only

**Component-Based Design**:
- ✅ PASS: React component architecture with reusable, composable components
- ✅ PASS: Profile list items as independent components receiving props and emitting events
- ✅ PASS: Payload editor supports dual modes (form/JSON) as separate component concerns

**Dependency Injection**:
- ✅ PASS: JWT service accepts algorithm, key, payload as parameters (no hardcoded dependencies)
- ✅ PASS: IPC handlers inject storage and encryption services
- ✅ PASS: React Context API for state management enables dependency injection pattern

### II. Data Security Principles

**Principle of Least Privilege**:
- ✅ PASS: Private keys encrypted with DPAPI at rest (FR-024, FR-049)
- ✅ PASS: Keys decrypted only during token generation, cleared from memory immediately after use
- ✅ PASS: Keys never logged, never transmitted (FR-051, FR-056)

**Multi-Layer Input Validation**:
- ✅ PASS: UI layer validates format (empty checks, JSON syntax - FR-017, FR-052)
- ✅ PASS: Business logic validates semantic correctness (key format, Base64/PEM validation - FR-022)
- ✅ PASS: Payload size limits enforced (64KB constraint)

**Secure Error Messages**:
- ✅ PASS: Error messages user-friendly without sensitive data exposure (FR-053, FR-056)
- ✅ PASS: No error logs to disk (Clarification Q5 answer)
- ✅ PASS: UI-only error display prevents information leakage

### III. User Experience Principles

**Immediate Feedback**:
- ✅ PASS: Token generation completes within 100ms (FR-004, SC-003)
- ✅ PASS: Real-time JSON validation with inline error display (FR-017)
- ✅ PASS: Immediate visual feedback for all operations (Constitution UX Standards)

**Predictable & Reversible Operations**:
- ✅ PASS: Profile deletion requires confirmation (User Story 2, acceptance scenario 5)
- ✅ PASS: Unsaved changes block profile switching with save/discard dialog (FR-012, Clarification Q2)
- ✅ PASS: Clear indication of modified state before operations

**Workflow-Adapted Interface**:
- ✅ PASS: Copy button adjacent to generated token (FR-033, FR-046)
- ✅ PASS: Keyboard shortcuts required (Constitution UX Standards: Ctrl+G, Ctrl+C, Ctrl+S, Escape)
- ✅ PASS: Frequently-used profiles accessible in left sidebar (FR-040)

### IV. Code Quality Principles

**Clear & Meaningful Naming**:
- ✅ PASS: Planned function names descriptive (generateJwtToken, encryptKeyWithDPAPI, selectedProfile)
- ✅ PASS: Entity names clear (Profile, JWT Token, Key, Payload, Algorithm Configuration)

**Comments Explain Why Not What**:
- ✅ PASS: Constitution requirement documented for DPAPI usage rationale
- ⚠️ PENDING: To be verified during implementation

**Comprehensive & Meaningful Error Handling**:
- ✅ PASS: All error scenarios identified in edge cases (10 cases documented)
- ✅ PASS: Error classification planned (user input errors, system errors - FR-052 to FR-055)
- ✅ PASS: No silent error swallowing (FR-053, FR-056)

**Test Coverage for Critical Paths**:
- ✅ PASS: Unit tests planned for JWT generation, key encryption/decryption, profile storage
- ✅ PASS: Test strategy includes normal and exceptional scenarios
- ⚠️ PENDING: Actual test implementation in Phase 2

### V. Version Control & Release Principles

**Semantic Versioning**:
- ✅ PASS: Will follow semantic versioning (0.1.0 for initial release)

**Changelog Recording**:
- ⚠️ PENDING: CHANGELOG.md to be created during implementation

**Thorough Pre-Release Testing**:
- ✅ PASS: Manual testing planned for Windows 10 and Windows 11 environments
- ✅ PASS: File system and DPAPI encryption testing across Windows versions planned

### VI. Documentation & Communication Principles

**Quick-Start README**:
- ⚠️ PENDING: README.md to be created in Phase 1 (quickstart.md)

**Code Documentation Updates with Code**:
- ⚠️ PENDING: To be enforced during implementation

**Transparent & Organized Issue Tracking**:
- ⚠️ PENDING: GitHub Issues to be configured post-implementation

### Gate Decision: ✅ PASS

All critical gates (security, architecture, UX response times) are satisfied. Pending items are documentation and testing artifacts that will be created during implementation phases. No constitutional violations requiring justification.

**Re-evaluation Required After**: Phase 1 Design (data-model.md and contracts/ generated)

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
jwt-token-generator/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── main.js              # Application entry point, window management
│   │   ├── ipc-handlers.js      # IPC communication handlers
│   │   ├── storage.js           # electron-store wrapper for profile persistence
│   │   ├── crypto.js            # DPAPI key encryption/decryption wrapper
│   │   └── preload.js           # Preload script for secure IPC exposure
│   │
│   ├── renderer/                # Electron renderer process (React app)
│   │   ├── components/          # React UI components
│   │   │   ├── ProfileList/     # Profile sidebar and selection
│   │   │   ├── ProfileEditor/   # Profile create/edit/delete dialogs
│   │   │   ├── AlgorithmSelector/  # HS256/RS256 algorithm choice
│   │   │   ├── KeyInput/        # Key input with format validation
│   │   │   ├── PayloadEditor/   # Dual-mode payload editor
│   │   │   │   ├── FormMode.jsx    # Form-based payload editing
│   │   │   │   └── JsonMode.jsx    # JSON editor with syntax highlighting
│   │   │   ├── ExpirationPicker/   # Expiration time configuration
│   │   │   ├── TokenDisplay/    # Generated token display and copy
│   │   │   ├── TokenParser/     # Token parsing and visualization
│   │   │   └── common/          # Shared UI components (buttons, dialogs, etc.)
│   │   │
│   │   ├── services/            # Business logic services
│   │   │   ├── jwtService.js    # JWT token generation and parsing
│   │   │   ├── validationService.js  # Input validation (keys, JSON, payloads)
│   │   │   └── ipcService.js    # IPC communication abstraction
│   │   │
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useProfiles.js   # Profile management state and operations
│   │   │   ├── usePayload.js    # Payload editing state and form/JSON sync
│   │   │   └── useClipboard.js  # Clipboard operations with error handling
│   │   │
│   │   ├── context/             # React Context providers
│   │   │   ├── AppContext.jsx   # Global application state
│   │   │   └── ProfileContext.jsx  # Profile-specific state
│   │   │
│   │   ├── utils/               # Utility functions
│   │   │   ├── format.js        # Date/time formatting, token visualization
│   │   │   ├── validation.js    # Validation helpers (Base64, PEM format)
│   │   │   └── constants.js     # Application constants (limits, defaults)
│   │   │
│   │   ├── App.jsx              # Main application component
│   │   ├── index.jsx            # Renderer process entry point
│   │   └── index.html           # HTML template
│   │
│   └── shared/                  # Code shared between main and renderer
│       ├── constants.js         # Shared constants (IPC channels, limits)
│       ├── types.js             # TypeScript/JSDoc type definitions
│       └── defaultProfiles.js   # Default profile templates data
│
├── tests/                       # Test suites
│   ├── unit/                    # Unit tests
│   │   ├── services/            # Service layer tests
│   │   ├── utils/               # Utility function tests
│   │   └── crypto/              # DPAPI encryption tests
│   ├── integration/             # Integration tests
│   │   ├── ipc/                 # IPC communication tests
│   │   └── storage/             # Profile persistence tests
│   └── e2e/                     # End-to-end tests (Spectron)
│       └── scenarios/           # User scenario tests
│
├── public/                      # Static assets
│   ├── icons/                   # Application icons (Windows .ico)
│   └── assets/                  # Images, fonts, etc.
│
├── package.json                 # Node.js dependencies and scripts
├── electron-builder.json        # Electron packaging configuration
├── webpack.config.js            # Webpack build configuration
├── jest.config.js               # Jest test configuration
└── .eslintrc.js                 # ESLint code quality rules
```

**Structure Decision**: Electron desktop application with clear separation between main process (system operations, IPC, storage, encryption) and renderer process (React UI). The renderer process follows standard React patterns with components, services, hooks, and context for state management. Shared code between processes is isolated in /shared directory. Test structure mirrors source structure with unit, integration, and e2e levels.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

No constitutional violations identified. All design decisions align with established principles:
- Single responsibility maintained through clear process separation (main/renderer)
- Security principles followed (DPAPI encryption, no key logging, input validation)
- User experience standards met (performance targets, keyboard shortcuts, immediate feedback)
- Code quality principles applied (clear naming, comprehensive testing, error handling)

---

## Phase 0: Research Complete

See [research.md](./research.md) for detailed technology decisions and best practices.

**Key Decisions**:
- Desktop Framework: Electron 28+ with React 18+
- JWT Library: jsonwebtoken 9.x
- Storage: electron-store 8.x
- Encryption: node-dpapi 1.x (Windows DPAPI)
- UI Framework: Material-UI v5
- JSON Editor: Monaco Editor
- Testing: Jest + React Testing Library + Spectron

**All research findings documented and no NEEDS CLARIFICATION items remaining.**

---

## Phase 1: Design Complete

**Artifacts Generated**:
1. [data-model.md](./data-model.md) - Complete entity definitions with validation rules
2. [contracts/ipc-api.md](./contracts/ipc-api.md) - IPC communication contracts between main and renderer processes
3. [quickstart.md](./quickstart.md) - Developer onboarding guide with setup instructions

**Key Entities**:
- Profile (with 50-profile limit, encrypted keys, payload templates)
- JWT Token (header, payload, signature components)
- Key (DPAPI-encrypted, algorithm-specific formats)
- Payload (flexible JSON with standard and custom claims)
- Application Settings (window state, last selected profile)

**IPC Contracts Defined**:
- `profiles:*` - Profile CRUD operations (load, save, delete, get)
- `crypto:*` - Key encryption/decryption via DPAPI
- `settings:*` - Application settings management
- All contracts include error codes, validation rules, and security notes

**Agent Context Updated**:
- CLAUDE.md created with technology stack and project information
- Claude Code agent now has project context for future assistance

---

## Constitutional Re-Evaluation (Post-Design)

**Status**: ✅ PASS

All design artifacts reviewed against constitutional principles:

**I. Code Organization Principles** ✅
- Data model shows clear entity separation
- IPC contracts demonstrate proper main/renderer separation
- No mixing of concerns in any layer

**II. Data Security Principles** ✅
- Keys encrypted with DPAPI at rest (data-model.md - Key entity)
- Plaintext keys cleared from memory after use (ipc-api.md - crypto:decrypt notes)
- Error messages designed to avoid sensitive data leakage (ipc-api.md - error handling)

**III. User Experience Principles** ✅
- Immediate feedback patterns defined (IPC async with loading states)
- Confirmations required for destructive operations (documented in contracts)
- Keyboard shortcuts requirement maintained (to be implemented in UI)

**IV. Code Quality Principles** ✅
- Clear naming in entity definitions and IPC channels
- Comprehensive error handling patterns defined
- Testing strategy outlined in quickstart.md

**No new violations introduced during design phase.**

---

## Next Steps

**Ready for Implementation**: All planning artifacts complete

Execute `/speckit.implement` to:
1. Generate dependency-ordered task list (tasks.md)
2. Begin implementation workflow
3. Track progress against constitutional standards

**Or manually proceed with**:
- Review plan.md, research.md, data-model.md, contracts/, and quickstart.md
- Set up development environment following quickstart.md
- Begin Phase 1 implementation (Foundation setup)
- Write tests alongside implementation
- Follow 6-week implementation timeline outlined in research.md

---

**Planning Phase Complete** ✅

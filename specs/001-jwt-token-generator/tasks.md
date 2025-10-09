# Tasks: JWT Token Generator for Windows

**Feature Branch**: `001-jwt-token-generator`
**Generated**: 2025-10-09
**Input**: Design documents from `/specs/001-jwt-token-generator/`

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Tests are NOT included as they were not explicitly requested in the feature specification.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US6, or SETUP/FOUNDATION)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project directory structure: `src/main/`, `src/renderer/`, `src/shared/`, `tests/`, `public/`
- [X] T002 Initialize Node.js project with package.json and install core dependencies (Electron 28+, React 18+, jsonwebtoken 9.x, electron-store 8.x, node-dpapi 1.x)
- [X] T003 [P] Install UI dependencies (Material-UI v5, Monaco Editor, @emotion/react, @emotion/styled)
- [X] T004 [P] Install build dependencies (webpack, babel, electron-builder, eslint, prettier)
- [X] T005 [P] Create webpack.renderer.config.js for React bundling
- [X] T006 [P] Create webpack.main.config.js for main process bundling
- [X] T007 [P] Create electron-builder.json for Windows installer configuration
- [X] T008 [P] Create jest.config.js for test configuration
- [X] T009 [P] Create .eslintrc.js with React and Node.js rules
- [X] T010 [P] Add npm scripts to package.json (start, dev, build, pack, dist, test, lint)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T011 Create src/main/main.js with BrowserWindow setup, contextIsolation enabled, nodeIntegration disabled
- [X] T012 Create src/main/preload.js with contextBridge exposing electronAPI (profiles, crypto, settings operations)
- [X] T013 Create src/main/storage.js wrapping electron-store for profile persistence with JSON schema validation
- [X] T014 Create src/main/crypto.js wrapping node-dpapi for key encryption/decryption (protectData/unprotectData)
- [X] T015 Create src/main/ipc-handlers.js with IPC handler registration function (profiles:*, crypto:*, settings:*)
- [X] T016 Register all IPC handlers in src/main/main.js on app ready
- [X] T017 Create src/renderer/index.html with root div element
- [X] T018 Create src/renderer/index.jsx as React entry point with ReactDOM.createRoot
- [X] T019 Create src/renderer/App.jsx with Material-UI ThemeProvider and CssBaseline
- [X] T020 Create src/renderer/context/AppContext.jsx for global application state management
- [X] T021 Create src/renderer/context/ProfileContext.jsx for profile-specific state
- [X] T022 Create src/shared/constants.js with IPC channel names, limits (50 profiles, 64KB payload), and defaults
- [X] T023 Create src/shared/types.js with JSDoc type definitions for Profile, JWT Token, Key, Payload
- [X] T024 Create src/shared/defaultProfiles.js with three default profile templates (Dev Environment Admin, Hybris Merchant Admin, OpenAPI Profile)
- [X] T025 Implement default profile initialization in src/main/storage.js on first launch

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Quick Token Generation with Default Profiles (Priority: P1) 🎯 MVP

**Goal**: Enable developers to quickly generate JWT tokens from pre-configured profiles without setup

**Independent Test**: Launch application, select "Dev Environment Admin" profile, enter a Base64 key, click Generate Token, verify valid JWT is produced and can be copied to clipboard

### Implementation for User Story 1

- [X] T026 [P] [US1] Create src/renderer/services/jwtService.js with generateToken() for HS256/RS256 signing
- [X] T027 [P] [US1] Create src/renderer/services/validationService.js with key format validation (Base64, PEM)
- [X] T028 [P] [US1] Create src/renderer/services/ipcService.js wrapping window.electronAPI calls with error handling
- [X] T029 [P] [US1] Create src/renderer/utils/validation.js with Base64 and PEM format validators
- [X] T030 [P] [US1] Create src/renderer/utils/format.js with date/time formatting and token visualization helpers
- [X] T031 [P] [US1] Create src/renderer/utils/constants.js with expiration presets ("1h"=3600, "1d"=86400, "1w"=604800)
- [X] T032 [US1] Create src/renderer/components/ProfileList/ProfileList.jsx showing profiles in left sidebar with List/ListItem
- [X] T033 [US1] Create src/renderer/components/AlgorithmSelector/AlgorithmSelector.jsx with Select dropdown for HS256/RS256
- [X] T034 [US1] Create src/renderer/components/KeyInput/KeyInput.jsx with TextField and format hint based on selected algorithm
- [X] T035 [US1] Create src/renderer/components/ExpirationPicker/ExpirationPicker.jsx with preset dropdown (1h, 1d, 1w)
- [X] T036 [US1] Create src/renderer/components/TokenDisplay/TokenDisplay.jsx showing generated token in selectable TextField
- [X] T037 [US1] Add "Copy to Clipboard" Button to TokenDisplay.jsx with clipboard.writeText() and success feedback
- [X] T038 [US1] Create src/renderer/hooks/useProfiles.js managing profile loading and selection state
- [X] T039 [US1] Create src/renderer/hooks/useClipboard.js for clipboard operations with error handling
- [X] T040 [US1] Wire ProfileList.jsx to load profiles on mount via useProfiles hook and display default profiles
- [X] T041 [US1] Wire AlgorithmSelector, KeyInput, ExpirationPicker to selected profile state
- [X] T042 [US1] Implement "Generate Token" button in App.jsx calling jwtService.generateToken with profile data
- [X] T043 [US1] Add token generation error handling for invalid keys, missing fields, and algorithm mismatches
- [X] T044 [US1] Add visual separation of header/payload/signature in TokenDisplay.jsx using Typography components
- [X] T045 [US1] Add decoded header and payload display below encoded token in TokenDisplay.jsx

**Checkpoint**: At this point, User Story 1 should be fully functional - users can select default profiles and generate tokens

---

## Phase 4: User Story 2 - Profile Management and Customization (Priority: P2)

**Goal**: Enable users to create, edit, and manage custom profiles with specific payload templates

**Independent Test**: Create new profile "Customer User", add custom payload fields, save, close application, reopen, verify profile persists

### Implementation for User Story 2

- [ ] T046 [P] [US2] Create src/renderer/components/ProfileEditor/ProfileEditorDialog.jsx with Material-UI Dialog for create/edit
- [ ] T047 [P] [US2] Create src/renderer/components/ProfileEditor/ProfileForm.jsx with TextField inputs for name and algorithm
- [ ] T048 [US2] Add "New Profile" Button to App.jsx opening ProfileEditorDialog in create mode
- [ ] T049 [US2] Add "Edit Profile" Button to ProfileList.jsx opening ProfileEditorDialog in edit mode
- [ ] T050 [US2] Add "Delete Profile" Button to ProfileList.jsx with confirmation Dialog
- [ ] T051 [US2] Implement profile creation flow: collect data → encrypt key via crypto:encrypt → save via profiles:save IPC
- [ ] T052 [US2] Implement profile update flow: load profile → modify fields → encrypt new key if changed → save via profiles:save IPC
- [ ] T053 [US2] Implement profile deletion flow: confirm → delete via profiles:delete IPC → update selected profile if deleted
- [ ] T054 [US2] Add profile name uniqueness validation in ProfileForm.jsx before saving
- [ ] T055 [US2] Add profile count validation (max 50) in ProfileForm.jsx showing error when limit reached
- [ ] T056 [US2] Implement unsaved changes detection in ProfileContext.jsx tracking modification state
- [ ] T057 [US2] Add unsaved changes warning Dialog when switching profiles with modified data
- [ ] T058 [US2] Add "Save" and "Discard" buttons to unsaved changes Dialog blocking profile switch until resolved
- [ ] T059 [US2] Update storage.js to persist lastSelectedProfileId in settings on profile selection
- [ ] T060 [US2] Update App.jsx to auto-select lastSelectedProfileId on application startup

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users can manage custom profiles and generate tokens

---

## Phase 5: User Story 3 - Algorithm Switching and Key Management (Priority: P2)

**Goal**: Support both HS256 and RS256 algorithms with secure key storage and automatic key loading

**Independent Test**: Switch from HS256 to RS256, enter PEM key, generate token, verify token validates with RS256. Close app, reopen, verify key is loaded from encrypted storage

### Implementation for User Story 3

- [ ] T061 [US3] Update KeyInput.jsx to show algorithm-specific format hints (Base64 for HS256, PEM for RS256)
- [ ] T062 [US3] Add key format validation in validationService.js checking Base64 format for HS256 keys
- [ ] T063 [US3] Add PEM format validation in validationService.js checking BEGIN/END markers for RS256 keys
- [ ] T064 [US3] Update AlgorithmSelector.jsx onChange to clear key input and show appropriate format hint
- [ ] T065 [US3] Implement key encryption in ProfileForm.jsx calling crypto:encrypt before saving profile
- [ ] T066 [US3] Implement key decryption in token generation flow calling crypto:decrypt before signing
- [ ] T067 [US3] Add key validation error display in KeyInput.jsx for invalid Base64 or PEM formats
- [ ] T068 [US3] Update jwtService.generateToken to handle both HS256 (Buffer.from Base64) and RS256 (PEM string) key formats
- [ ] T069 [US3] Add plaintext key memory clearing in jwtService.generateToken after token signing (set to null)
- [ ] T070 [US3] Update ProfileList.jsx to auto-load encrypted key for selected profile via profiles:get IPC
- [ ] T071 [US3] Add DPAPI decryption error handling showing "Unable to decrypt key" with re-entry suggestion
- [ ] T072 [US3] Update storage.js to handle multi-environment keys by storing encryptedKey per profile

**Checkpoint**: All algorithm and key management features complete - users can work with HS256 and RS256 seamlessly

---

## Phase 6: User Story 4 - Dual Editing Mode for Payload (Priority: P3)

**Goal**: Provide both form-based and JSON-based payload editing for flexibility

**Independent Test**: Enter data in form mode (userId, email), switch to JSON mode, verify JSON reflects form data, edit JSON directly, switch back to form, verify form reflects JSON changes

### Implementation for User Story 4

- [ ] T073 [P] [US4] Create src/renderer/components/PayloadEditor/PayloadEditor.jsx with Tabs for Form/JSON mode toggle
- [ ] T074 [P] [US4] Create src/renderer/components/PayloadEditor/FormMode.jsx with TextFields for common claims (userId, username, email, roleCode, etc.)
- [ ] T075 [P] [US4] Create src/renderer/components/PayloadEditor/JsonMode.jsx integrating Monaco Editor for JSON editing
- [ ] T076 [US4] Create src/renderer/hooks/usePayload.js managing payload state and real-time form/JSON synchronization with bidirectional updates
- [ ] T077 [US4] Implement switchToJsonMode() in usePayload.js converting payloadObject to JSON string with JSON.stringify (called on mode switch)
- [ ] T078 [US4] Implement switchToFormMode() in usePayload.js parsing JSON string with try/catch and error display (called on mode switch)
- [ ] T078a [US4] Add real-time form-to-payload sync in FormMode.jsx updating payloadObject on every field change (satisfies FR-016)
- [ ] T079 [US4] Add real-time JSON syntax validation in JsonMode.jsx showing inline error messages for invalid JSON
- [ ] T080 [US4] Add "Add Custom Field" Button in FormMode.jsx allowing arbitrary field name/value pairs
- [ ] T081 [US4] Implement custom field addition in usePayload.js updating payloadObject with new field
- [ ] T082 [US4] Add JSON editor configuration in JsonMode.jsx (Monaco with json language, syntax highlighting, formatOnPaste)
- [ ] T083 [US4] Add mode switch validation preventing switch from JSON to Form if JSON is invalid
- [ ] T084 [US4] Update ProfileContext to store payload mode preference (form/json) per profile
- [ ] T085 [US4] Add payload size validation (64KB limit) before allowing profile save or token generation
- [ ] T086 [US4] Wire PayloadEditor to App.jsx replacing static payload input with tabbed editor

**Checkpoint**: Dual editing modes functional - users can edit payloads in form or JSON mode with full synchronization

---

## Phase 7: User Story 5 - Token Parsing and Analysis (Priority: P3)

**Goal**: Allow users to paste existing JWT tokens and see decoded header/payload for debugging

**Independent Test**: Copy JWT from external source, paste into parse input, verify header and payload are decoded and displayed with timestamps in human-readable format

### Implementation for User Story 5

- [ ] T087 [P] [US5] Create src/renderer/components/TokenParser/TokenParser.jsx with TextField for token input
- [ ] T088 [P] [US5] Create src/renderer/components/TokenParser/ParsedOutput.jsx displaying decoded header and payload
- [ ] T089 [US5] Add parseToken() function in jwtService.js using jwt.decode with complete:true option
- [ ] T090 [US5] Add token format validation in parseToken() checking for three Base64url segments separated by dots
- [ ] T091 [US5] Implement token parsing on paste/input in TokenParser.jsx calling jwtService.parseToken
- [ ] T092 [US5] Display algorithm and token type from header in ParsedOutput.jsx
- [ ] T093 [US5] Display all claims from payload in ParsedOutput.jsx with formatted JSON
- [ ] T094 [US5] Format timestamp claims (exp, iat, nbf) in ParsedOutput.jsx showing Unix timestamp and human-readable date
- [ ] T095 [US5] Add malformed token error handling in TokenParser.jsx showing clear error message
- [ ] T096 [US5] Add copy functionality for individual claim values in ParsedOutput.jsx
- [ ] T097 [US5] Add TokenParser component to App.jsx in separate section or tab

**Checkpoint**: Token parsing complete - users can analyze existing JWT tokens alongside generation

---

## Phase 8: User Story 6 - Flexible Expiration Time Configuration (Priority: P2)

**Goal**: Allow users to set token expiration using presets or custom timestamps

**Independent Test**: Select "1 hour" preset, generate token, parse token, verify exp claim is current time + 1 hour. Select "Custom", enter specific date, generate token, verify exp matches custom timestamp

### Implementation for User Story 6

- [ ] T098 [US6] Update ExpirationPicker.jsx to include "Custom" option in preset dropdown
- [ ] T099 [US6] Add DateTimePicker input to ExpirationPicker.jsx appearing when "Custom" is selected
- [ ] T100 [US6] Implement expiration calculation in jwtService.js for presets: "1h"=3600s, "1d"=86400s, "1w"=604800s
- [ ] T101 [US6] Implement custom expiration timestamp handling in jwtService.js using customExpiration from profile
- [ ] T102 [US6] Add expiration validation warning if custom time is in the past (allow but warn for testing scenarios)
- [ ] T103 [US6] Update ProfileForm.jsx to save expirationPreset and customExpiration with profile
- [ ] T104 [US6] Wire ExpirationPicker to ProfileContext so expiration settings persist with profile
- [ ] T105 [US6] Display calculated expiration time in human-readable format in ExpirationPicker.jsx
- [ ] T106 [US6] Add exp claim auto-calculation in jwtService.generateToken based on preset or custom value

**Checkpoint**: All expiration features complete - users have full control over token expiration times

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T107 [P] Add comprehensive error handling throughout all components with user-friendly error messages
- [ ] T108 [P] Add loading states (CircularProgress) for all IPC operations (profile load, save, delete)
- [ ] T109 [P] Implement keyboard shortcuts: Ctrl+G (Generate Token, global), Ctrl+C (Copy Token, only when token display has focus), Ctrl+S (Save Profile, global), Escape (Close Dialogs, when dialog open)
- [ ] T110 [P] Add Snackbar notifications for success/error feedback (profile saved, token copied, etc.)
- [ ] T111 [P] Create application icon in public/icons/icon.ico for Windows installer
- [ ] T112 [P] Add edge case handling: empty profiles list, corrupted config file, clipboard failure, expired tokens
- [ ] T113 [P] Optimize bundle size: lazy-load Monaco Editor, minimize ASAR package
- [ ] T114 [P] Add data-testid attributes to all interactive elements for future E2E testing
- [ ] T115 Code cleanup and refactoring: remove console.logs, ensure consistent naming, add JSDoc comments
- [ ] T116 Create README.md with application overview, installation, and usage instructions
- [ ] T117 Validate application against quickstart.md ensuring all setup steps work
- [ ] T118 Build production package with electron-builder creating Windows NSIS installer
- [ ] T119 Manual testing on Windows 10 and Windows 11 environments
- [ ] T120 Verify DPAPI encryption/decryption works across Windows user accounts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order: US1 (P1) → US3,6 (P2) → US2 (P2) → US4,5 (P3)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent but enhances US1
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Independent, works with US1 profiles
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Independent payload editing enhancement
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Completely independent parsing feature
- **User Story 6 (P2)**: Can start after Foundational (Phase 2) - Independent expiration enhancement

### Within Each User Story

- Tasks marked [P] can run in parallel (different files)
- Services before components that use them
- Utility functions before components that call them
- UI components before wiring to App.jsx
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1 Setup**: T003, T004, T005-T009 can all run in parallel

**Phase 2 Foundational**: T012-T014 can run in parallel, T017-T021 can run in parallel, T022-T024 can run in parallel

**User Story 1**:
- T026-T031 (services/utils) can run in parallel
- T032-T037 (components) can run in parallel after services complete

**User Story 2**:
- T046-T047 can run in parallel

**User Story 3**:
- None (most tasks sequential due to dependencies)

**User Story 4**:
- T073-T075 can run in parallel

**User Story 5**:
- T087-T088 can run in parallel

**User Story 6**:
- None (most tasks build on each other)

**Polish Phase**: T107-T114 can all run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all service/util tasks for User Story 1 together:
Task: T026 "Create src/renderer/services/jwtService.js"
Task: T027 "Create src/renderer/services/validationService.js"
Task: T028 "Create src/renderer/services/ipcService.js"
Task: T029 "Create src/renderer/utils/validation.js"
Task: T030 "Create src/renderer/utils/format.js"
Task: T031 "Create src/renderer/utils/constants.js"

# Then launch all component tasks together:
Task: T032 "Create ProfileList.jsx"
Task: T033 "Create AlgorithmSelector.jsx"
Task: T034 "Create KeyInput.jsx"
Task: T035 "Create ExpirationPicker.jsx"
Task: T036 "Create TokenDisplay.jsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T010)
2. Complete Phase 2: Foundational (T011-T025) - CRITICAL blocking phase
3. Complete Phase 3: User Story 1 (T026-T045)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Launch app, select default profile, enter key, generate token, copy to clipboard
   - Verify token validates externally
5. Deploy/demo if ready

### Incremental Delivery (Recommended)

1. **Foundation** (Phases 1-2): Setup + Foundational → Basic app structure ready
2. **MVP** (Phase 3): User Story 1 → Quick token generation works → Deploy/Demo
3. **Enhanced** (Phase 5): Add User Story 3 → Algorithm switching and key management → Deploy/Demo
4. **Flexible** (Phase 8): Add User Story 6 → Expiration control → Deploy/Demo
5. **Customizable** (Phase 4): Add User Story 2 → Profile management → Deploy/Demo
6. **Advanced** (Phases 6-7): Add User Stories 4 & 5 → Dual editing and parsing → Deploy/Demo
7. **Production** (Phase 9): Polish and package → Final release

### Parallel Team Strategy

With multiple developers after Foundational phase completes:

- **Developer A**: User Story 1 (P1) - Core token generation
- **Developer B**: User Story 3 (P2) - Algorithm and key management
- **Developer C**: User Story 6 (P2) - Expiration configuration
- Stories complete independently, then integrate in App.jsx

---

## Task Summary

- **Total Tasks**: 121
- **Setup Tasks**: 10 (T001-T010)
- **Foundational Tasks**: 15 (T011-T025)
- **User Story 1 (P1)**: 20 tasks (T026-T045)
- **User Story 2 (P2)**: 15 tasks (T046-T060)
- **User Story 3 (P2)**: 12 tasks (T061-T072)
- **User Story 4 (P3)**: 15 tasks (T073-T086, including T078a)
- **User Story 5 (P3)**: 11 tasks (T087-T097)
- **User Story 6 (P2)**: 9 tasks (T098-T106)
- **Polish & Cross-Cutting**: 14 tasks (T107-T120)

### Parallel Opportunities Identified

- **Phase 1**: 7 parallel tasks
- **Phase 2**: 9 parallel tasks (in 3 groups)
- **User Stories**: 15 parallel tasks across stories
- **Polish**: 8 parallel tasks

### Independent Test Criteria

Each user story has clear independent test criteria documented in phase headers:
- **US1**: Select profile → Generate token → Copy to clipboard
- **US2**: Create profile → Save → Reopen app → Verify persistence
- **US3**: Switch algorithms → Enter keys → Generate tokens → Verify encryption
- **US4**: Edit in form → Switch to JSON → Edit JSON → Switch back → Verify sync
- **US5**: Paste token → Verify parsing → View decoded claims
- **US6**: Set expiration preset/custom → Generate → Verify exp claim

### Suggested MVP Scope

**Minimum Viable Product**: User Story 1 only (T001-T045)
- 45 tasks total
- Delivers core value: quick JWT token generation from default profiles
- Estimated time: 2 weeks for single developer

**Enhanced MVP**: User Stories 1 + 3 + 6 (T001-T072, T098-T106)
- 77 tasks total
- Adds algorithm flexibility and expiration control
- Estimated time: 3-4 weeks for single developer

---

## Notes

- Tasks are executable immediately - each includes specific file paths
- [P] markers indicate parallelizable tasks (different files, no dependencies)
- [Story] labels map tasks to user stories for traceability
- Each user story is independently completable and testable
- Foundational phase (T011-T025) is CRITICAL and blocks all user story work
- Tests were NOT included as not explicitly requested in feature specification
- Follow constitution principles: single responsibility, security (DPAPI), user experience (immediate feedback)
- Commit after each task or logical group of parallel tasks
- Stop at any checkpoint to validate story independently

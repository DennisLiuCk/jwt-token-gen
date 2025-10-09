# Feature Specification: JWT Token Generator for Windows

**Feature Branch**: `001-jwt-token-generator`
**Created**: 2025-10-09
**Status**: Draft
**Input**: User description: "Windows desktop application for development and testing teams to simplify JWT token generation, management, and usage in API testing"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick Token Generation with Default Profiles (Priority: P1)

As a backend developer, I need to quickly generate JWT tokens for different user roles so that I can test permission control features without going through the full authentication flow each time, saving significant development time.

**Why this priority**: This is the core value proposition of the application. Without the ability to generate tokens quickly, the application has no purpose. This story delivers immediate value as a standalone MVP.

**Independent Test**: Can be fully tested by launching the application, selecting a pre-configured profile (e.g., "Admin User"), clicking generate, and verifying a valid JWT token is produced and can be copied to clipboard. This delivers immediate value for developers needing quick token generation.

**Acceptance Scenarios**:

1. **Given** the application is launched for the first time, **When** I open the profile list, **Then** I see three pre-configured profiles: "Dev Environment Admin", "Hybris Merchant Admin", and "OpenAPI Profile"
2. **Given** I select the "Dev Environment Admin" profile, **When** I click the "Generate Token" button, **Then** a valid JWT token is generated and displayed within 100ms
3. **Given** a JWT token has been generated, **When** I click the "Copy to Clipboard" button, **Then** the complete token is copied and I can paste it directly into my API testing tool
4. **Given** I have selected a profile, **When** I change the expiration time to "1 hour" and generate a token, **Then** the token's exp claim reflects the correct expiration time
5. **Given** I am viewing a generated token, **When** I look at the token visualization area, **Then** I can see the header, payload, and signature sections clearly separated and formatted

---

### User Story 2 - Profile Management and Customization (Priority: P2)

As a QA tester, I need to save and manage multiple test account profiles so that I can quickly switch between different user identities during test execution without memorizing or looking up each test account's details.

**Why this priority**: Profile management significantly improves productivity for teams testing multiple user scenarios. While token generation works without this, the ability to save custom profiles makes the tool much more valuable for ongoing test work.

**Independent Test**: Can be tested by creating a new profile with custom payload fields, saving it, closing the application, reopening it, and verifying the profile persists with all custom data intact. Delivers value for teams with specific test scenarios.

**Acceptance Scenarios**:

1. **Given** I am on the main window, **When** I click "New Profile" and enter a profile name "Customer User", **Then** a new empty profile is created and added to the profile list
2. **Given** I am editing a profile, **When** I add custom payload fields (userId: "test123", roleCode: "CUSTOMER"), save the profile, and close the application, **Then** upon reopening, the profile exists with all saved data
3. **Given** I have a custom profile selected, **When** I click "Edit Profile" and modify the payload fields, **Then** the changes are reflected immediately in the JSON preview
4. **Given** I select a pre-configured profile, **When** I modify its fields and save, **Then** my changes persist across application sessions
5. **Given** I have multiple profiles, **When** I select a profile to delete and confirm deletion, **Then** the profile is removed from the list and from persistent storage
6. **Given** I have unsaved changes in the current profile, **When** I attempt to switch to another profile, **Then** a warning dialog appears requiring me to either save or discard changes before the switch proceeds

---

### User Story 3 - Algorithm Switching and Key Management (Priority: P2)

As an API integration developer, I need to generate JWT tokens with different signing algorithms (HS256 and RS256) and manage multiple environment keys so that I can test my services against various authentication configurations.

**Why this priority**: Multi-algorithm support is essential for teams working with different environments or security requirements. This is independent of profile management but builds on the basic token generation capability.

**Independent Test**: Can be tested by switching from HS256 to RS256, entering appropriate keys for each algorithm, generating tokens with each, and verifying the tokens can be validated by external JWT validation tools. Delivers value for teams needing different signing methods.

**Acceptance Scenarios**:

1. **Given** I select HS256 algorithm, **When** I enter a Base64-encoded symmetric key and generate a token, **Then** the token is signed correctly with HS256 and validates against the provided key
2. **Given** I select RS256 algorithm, **When** I paste a PEM-formatted RSA private key and generate a token, **Then** the token is signed correctly with RS256
3. **Given** I have entered keys for different environments, **When** I close and reopen the application, **Then** the keys are retrieved securely from encrypted storage
4. **Given** I switch from HS256 to RS256, **When** the algorithm changes, **Then** the key input area updates to show the appropriate format and help text for the selected algorithm
5. **Given** I have stored keys for multiple profiles, **When** I switch between profiles, **Then** the correct key for each profile is loaded automatically

---

### User Story 4 - Dual Editing Mode for Payload (Priority: P3)

As an advanced user, I need both form-based and JSON-based payload editing modes so that I can quickly edit common fields through a simple interface or craft complex custom payloads directly in JSON format.

**Why this priority**: This enhances usability for both novice and advanced users, but the application can function with only one editing mode. It's a quality-of-life improvement rather than core functionality.

**Independent Test**: Can be tested by entering data in form mode, switching to JSON mode to verify the JSON representation, editing the JSON directly, switching back to form mode, and verifying form fields reflect the JSON changes. Delivers value for users needing flexible editing options.

**Acceptance Scenarios**:

1. **Given** I am in form editing mode, **When** I enter values in standard fields (userId, username, email, roleCode), **Then** the JSON preview updates in real-time to reflect my entries
2. **Given** I am in JSON editing mode, **When** I enter valid JSON directly, **Then** the form fields synchronize to show the corresponding values
3. **Given** I am in JSON editing mode, **When** I enter invalid JSON, **Then** I see a clear validation error message indicating the syntax issue
4. **Given** I am in form mode, **When** I click "Add Custom Field", **Then** I can enter a field name and value which appears in both the form and JSON representation
5. **Given** I have complex nested JSON in my payload, **When** I switch between modes, **Then** the data integrity is maintained and nested structures are preserved

---

### User Story 5 - Token Parsing and Analysis (Priority: P3)

As a frontend developer, I need to paste and parse existing JWT tokens to understand their structure and contents so that I can debug authentication issues and understand what data my application receives.

**Why this priority**: This is a useful debugging feature but not essential for the primary use case of token generation. It provides additional value for troubleshooting but the application functions completely without it.

**Independent Test**: Can be tested by copying a valid JWT token from any source, pasting it into the parse area, and verifying the header and payload are correctly decoded and displayed. Delivers value for debugging and learning about JWT structure.

**Acceptance Scenarios**:

1. **Given** I have a JWT token from an external source, **When** I paste it into the token parse input field, **Then** the application decodes and displays the header and payload in readable format
2. **Given** I paste an invalid or malformed token, **When** the parser attempts to decode it, **Then** I see a clear error message explaining the token is invalid
3. **Given** I have parsed a token, **When** I view the parsed output, **Then** I can see the algorithm used, all claims in the payload, and timestamps in human-readable format
4. **Given** a parsed token has an expiration claim, **When** I view the details, **Then** I can see both the Unix timestamp and a formatted date/time showing when the token expires
5. **Given** I am analyzing a token, **When** I copy values from the parsed output, **Then** I can easily select and copy individual claim values for further investigation

---

### User Story 6 - Flexible Expiration Time Configuration (Priority: P2)

As a tester, I need to set token expiration times using preset options (1 hour, 1 day, 1 week) or custom timestamps so that I can test both short-lived and long-lived token scenarios in my test cases.

**Why this priority**: Expiration control is important for realistic testing scenarios. While tokens can be generated with default expiration, the ability to control this precisely is valuable for comprehensive testing but not absolutely critical for basic usage.

**Independent Test**: Can be tested by selecting different expiration presets, generating tokens, parsing them back, and verifying the exp claims match expectations. Custom expiration can be tested by entering a specific date/time and verifying the resulting token. Delivers value for time-sensitive testing scenarios.

**Acceptance Scenarios**:

1. **Given** I am generating a token, **When** I select "1 hour" from the expiration preset dropdown, **Then** the generated token has an exp claim set to current time + 1 hour
2. **Given** I select "1 day" preset, **When** I generate a token, **Then** the exp claim is set to current time + 24 hours
3. **Given** I select "1 week" preset, **When** I generate a token, **Then** the exp claim is set to current time + 7 days
4. **Given** I select "Custom" expiration, **When** I enter a specific date and time (e.g., "2025-10-15 14:30"), **Then** the token's exp claim matches this exact timestamp
5. **Given** I have set a custom expiration time, **When** I save the profile, **Then** the expiration setting is saved and restored when I reload the profile

---

### Edge Cases

- **Empty or missing keys**: What happens when a user attempts to generate a token without entering a signing key? System should display a clear validation error preventing token generation until a valid key is provided.

- **Invalid key format**: What happens when a user enters a key in the wrong format (e.g., plain text instead of Base64 for HS256, or invalid PEM format for RS256)? System should detect the format error and show a helpful message explaining the expected format.

- **Malformed JSON in payload**: What happens when editing JSON directly and the JSON is syntactically invalid? System should show inline validation errors and prevent token generation until JSON is valid.

- **Very large payloads**: How does the system handle payloads with hundreds of custom claims or very long string values? System should handle large payloads gracefully up to reasonable limits (e.g., 64KB) and warn if approaching size limits that might cause issues with some JWT libraries.

- **Maximum profile limit reached**: What happens when a user attempts to create a 51st profile? System should display a clear error message: "Maximum profile limit (50) reached. Please delete an existing profile before creating a new one."

- **Expired token generation**: What happens if a user sets a custom expiration time in the past? System should warn the user but allow generation for testing purposes (as this might be intentional for testing expired token handling).

- **Special characters in payload values**: How are special characters (unicode, emoji, control characters, quotes) handled in payload fields? System should properly escape and encode all characters according to JSON/JWT standards.

- **Concurrent profile editing**: What happens if the same profile storage file is modified by external means while the application is running? System should detect external changes and offer to reload or warn about conflicts.

- **First launch without default profiles**: What happens if the default profile initialization fails? System should allow the application to start with an empty profile list and provide a clear way to create the first profile manually.

- **Clipboard operations failure**: What happens when clipboard copy fails (e.g., due to permissions or clipboard locked by another application)? System should catch the error and show a user-friendly message with the token displayed for manual selection.

- **Missing or corrupted configuration file**: How does the system handle corrupted or missing profile storage? See FR-050 for authoritative handling requirements (graceful fallback, user notification, recreation offer).

## Requirements *(mandatory)*

### Functional Requirements

#### Core Token Generation

- **FR-001**: System MUST support JWT token generation using HS256 (HMAC-SHA256) signing algorithm with symmetric keys
- **FR-002**: System MUST support JWT token generation using RS256 (RSA-SHA256) signing algorithm with RSA private keys
- **FR-003**: System MUST allow users to switch between HS256 and RS256 algorithms through a clear selection interface
- **FR-004**: System MUST generate JWT tokens within 100ms of user clicking the generate button (measured from button click to token display; includes DPAPI key decryption, JWT signing, and UI update)
- **FR-005**: System MUST generate tokens with correctly formatted header, payload, and signature components conforming to JWT RFC 7519 standards

#### Profile Management

- **FR-006**: System MUST create three default profiles on first launch with minimal placeholder payload values that users can customize:
  - "Dev Environment Admin": userId: "admin001", username: "Admin User", email: "admin@example.com", roleCode: "ADMIN"
  - "Hybris Merchant Admin": userId: "merchant001", username: "Merchant Admin", email: "merchant@example.com", roleCode: "MERCHANT_ADMIN", merchantId: "M001"
  - "OpenAPI Profile": sub: "api-client-001", apiKey: "placeholder-api-key"
- **FR-007**: System MUST allow users to create new named profiles with custom payload templates up to a maximum of 50 total profiles; when the limit is reached, the system MUST display a clear message requiring users to delete existing profiles before creating new ones
- **FR-008**: System MUST allow users to edit existing profiles and save modifications
- **FR-009**: System MUST allow users to delete profiles (including default profiles)
- **FR-010**: System MUST persist all profile data locally so profiles survive application restarts
- **FR-011**: System MUST load the last-selected profile when the application starts
- **FR-012**: System MUST detect unsaved changes when a user attempts to switch profiles and display a warning dialog that blocks the switch until the user explicitly saves or discards the changes

#### Payload Editing

- **FR-013**: System MUST provide a form-based editing mode with input fields for common JWT claims (userId, username, email, roleCode, etc.)
- **FR-014**: System MUST provide a JSON-based editing mode allowing direct JSON editing of the complete payload
- **FR-015**: System MUST allow users to toggle between form mode and JSON mode seamlessly
- **FR-016**: System MUST synchronize data between form mode and JSON mode in real-time; form field changes update the payload state immediately without debouncing, while JSON editor changes MAY be debounced (e.g., 300ms) to avoid excessive validation on every keystroke
- **FR-017**: System MUST validate JSON syntax in JSON editing mode and display clear error messages for invalid JSON
- **FR-018**: System MUST allow users to add custom fields with arbitrary names and values in form mode
- **FR-019**: System MUST preserve all payload data when switching between editing modes, including nested objects and arrays

#### Key Management

- **FR-020**: System MUST allow users to input Base64-encoded symmetric keys for HS256 algorithm
- **FR-021**: System MUST allow users to paste or import PEM-formatted RSA private keys for RS256 algorithm
- **FR-022**: System MUST validate key format before allowing token generation and show helpful error messages for invalid formats
- **FR-023**: System MUST store keys associated with each profile
- **FR-024**: System MUST encrypt stored keys using Windows Data Protection API (DPAPI) before persisting to disk
- **FR-025**: System MUST automatically load the appropriate key when a profile is selected
- **FR-026**: System MUST update the key input UI to show appropriate format hints based on the selected algorithm

#### Expiration Time Management

- **FR-027**: System MUST provide preset expiration options: 1 hour, 1 day, and 1 week
- **FR-028**: System MUST allow users to specify custom expiration date and time
- **FR-029**: System MUST correctly calculate and set the "exp" claim in the JWT payload based on selected expiration
- **FR-030**: System MUST save expiration preferences with each profile
- **FR-031**: System MUST display expiration time in human-readable format for both setting and verification

#### Token Operations

- **FR-032**: System MUST display the generated JWT token in a selectable text field
- **FR-033**: System MUST provide a one-click "Copy to Clipboard" button that copies the entire token
- **FR-034**: System MUST provide visual separation and display of the three JWT components (header, payload, signature)
- **FR-035**: System MUST decode and display header and payload contents in readable format alongside the encoded token
- **FR-036**: System MUST allow users to paste an existing JWT token for parsing and analysis
- **FR-037**: System MUST decode pasted tokens and display their header and payload components
- **FR-038**: System MUST validate pasted tokens and show clear error messages for malformed tokens
- **FR-039**: System MUST display timestamps in human-readable format when parsing tokens (e.g., "exp" and "iat" claims)

#### User Interface

- **FR-040**: System MUST display profile list in a left sidebar with clear names for each profile
- **FR-041**: System MUST provide clearly labeled buttons for New Profile, Edit Profile, and Delete Profile operations
- **FR-042**: System MUST display algorithm selection prominently in the main editing area
- **FR-043**: System MUST show key input area with appropriate labels and format hints based on selected algorithm
- **FR-044**: System MUST display payload editing area with toggle between Form and JSON modes
- **FR-045**: System MUST display token generation controls (expiration settings and Generate button) prominently
- **FR-046**: System MUST show generated token and copy button in an easily accessible location
- **FR-047**: System MUST provide a separate token parsing interface accessible from the main window

#### Data Persistence and Security

- **FR-048**: System MUST store all configuration data in the user's local application data directory
- **FR-049**: System MUST encrypt signing keys using Windows DPAPI before persisting to disk; payload templates are stored in plain text for easier debugging and profile sharing
- **FR-050**: System MUST handle configuration file corruption gracefully by falling back to defaults; when corruption is detected during profile load, the system MUST: (1) display a user-friendly warning message, (2) offer to recreate the configuration file with default profiles, (3) preserve user's ability to create new profiles manually if recreation fails (see Edge Case: "Missing or corrupted configuration file")
- **FR-051**: System MUST not transmit any data over the network (fully offline operation)

#### Error Handling and Validation

- **FR-052**: System MUST validate all inputs before token generation and prevent generation if validation fails
- **FR-053**: System MUST display clear, user-friendly error messages for all validation failures in the UI; no error logging to disk is required
- **FR-054**: System MUST handle clipboard operation failures gracefully with appropriate user feedback
- **FR-055**: System MUST prevent application crashes due to malformed data or invalid user input; this includes but is not limited to: invalid JSON in payloads, malformed keys, corrupted profiles (see FR-050 for config file handling), and out-of-range values
- **FR-056**: System MUST NOT write error logs or diagnostic files to disk; all error information is communicated through UI messages only

### Key Entities

- **Profile**: Represents a saved configuration template containing algorithm type, associated key, payload template, and expiration preferences. Each profile has a unique name and can be selected, edited, or deleted by the user.

- **JWT Token**: The generated authentication token consisting of three base64url-encoded parts (header, payload, signature) separated by dots. Contains algorithm information in the header, user claims in the payload, and cryptographic signature.

- **Key**: The cryptographic key used for signing tokens, either a symmetric key (HS256) or RSA private key (RS256). Associated with a profile and stored in encrypted form.

- **Payload**: The set of claims (key-value pairs) that form the body of the JWT token. Can contain standard claims (iss, sub, aud, exp, iat) and custom claims defined by the user.

- **Algorithm Configuration**: Specifies which signing algorithm (HS256 or RS256) is active for the current profile, determining the type of key required and the signing process used.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can generate a valid JWT token within 5 seconds of launching the application (including profile selection and clicking generate)
- **SC-002**: Application startup time is under 2 seconds on Windows 10 and Windows 11 systems
- **SC-003**: Token generation completes within 100 milliseconds from button click to token display (end-to-end including DPAPI decryption, JWT signing, and rendering)
- **SC-004**: 95% of users can successfully create and save a custom profile on their first attempt without consulting documentation
- **SC-005**: Users can switch between profiles and generate new tokens in under 3 seconds
- **SC-006**: The application runs without requiring installation of additional frameworks or dependencies beyond the executable
- **SC-007**: All stored keys remain secure and are successfully decrypted across application sessions without data loss
- **SC-008**: Users can successfully copy and paste generated tokens into API testing tools (Postman, curl, etc.) without formatting issues
- **SC-009**: Application handles payloads up to 64KB in size without performance degradation
- **SC-010**: Users testing expired token scenarios can generate tokens with expiration times set in the past
- **SC-011**: Form mode and JSON mode remain synchronized with 100% data accuracy when switching between modes
- **SC-012**: Developers can test permission control features using generated tokens, reducing authentication flow testing time by at least 70%

## Assumptions

1. **Windows Platform**: Application targets only Windows 10 and Windows 11; no cross-platform support required initially
2. **Development Tool Context**: Primary users are developers and testers who understand JWT concepts at a basic level
3. **Test Environment Usage**: Tokens generated are for testing/development purposes, not production authentication
4. **Local Security Model**: Windows DPAPI provides sufficient security for test environment keys stored on developer machines; payload templates do not require encryption as they contain test data only
5. **Single-user Application**: No multi-user or concurrent editing scenarios; application is used by one developer at a time on their local machine
6. **Standard JWT Format**: All tokens follow RFC 7519 JWT standard format and encoding
7. **No Token Validation**: Application focuses on generation and parsing; validation against external services is out of scope
8. **Manual Key Management**: Users are responsible for obtaining and managing their own signing keys; no key generation feature required initially
9. **English UI**: Initial version uses English language for all UI elements
10. **Standard Screen Resolutions**: UI designed for common desktop resolutions (1920x1080 and above)
11. **No Cloud Sync**: Profile storage is local only; no cloud backup or synchronization across devices
12. **No Error Logging**: Application does not write error logs or diagnostic files to disk; errors are communicated only through UI messages for simplicity and privacy
13. **Base64 Standard Encoding**: HS256 keys are expected in standard Base64 encoding (not base64url)
14. **PEM Format for RSA**: RS256 private keys must be in PEM format (BEGIN/END RSA PRIVATE KEY markers)
15. **Default Algorithm**: HS256 is the default algorithm for new profiles unless user changes it
16. **Expiration Required**: All tokens include an "exp" claim; tokens without expiration are not supported

## Clarifications

### Session 2025-10-09

- Q: What payload fields should each default profile contain? → A: Provide minimal placeholder values (e.g., userId: "admin001", username: "Admin User", roleCode: "ADMIN") that users will customize
- Q: When a user tries to switch profiles with unsaved changes, what should happen after the warning is displayed? → A: Block the switch; user must explicitly save or discard changes before switching to another profile
- Q: Should payload templates stored in profiles be encrypted using Windows DPAPI? → A: No, only encrypt keys; payloads are stored in plain text (easier debugging/sharing of profiles)
- Q: What is the maximum number of profiles the system should support? → A: Hard limit of 50 profiles (reasonable for most test scenarios, prevents UI clutter)
- Q: Should the application maintain error logs or diagnostic information? → A: No logging; all errors shown only in UI messages (simpler, no disk usage, privacy-friendly)

## Open Questions

None - specification is complete and ready for planning phase.

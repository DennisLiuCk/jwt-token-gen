# JWT Token Generator Constitution

<!--
Sync Impact Report - Constitution Update
================================================================================
Version Change: [initial] → 1.0.0
Rationale: Initial constitution establishment with comprehensive governance principles

Modified/Added Principles:
- Added: I. 程式碼組織原則 (Code Organization Principles)
- Added: II. 資料安全原則 (Data Security Principles)
- Added: III. 使用者體驗原則 (User Experience Principles)
- Added: IV. 程式碼品質原則 (Code Quality Principles)
- Added: V. 版本控制和發布原則 (Version Control & Release Principles)
- Added: VI. 文件和溝通原則 (Documentation & Communication Principles)

Removed Sections: None (initial establishment)

Templates Requiring Updates:
✅ plan-template.md - Constitution Check section references this file
✅ spec-template.md - Requirements align with security and UX principles
✅ tasks-template.md - Task organization reflects quality and testing principles

Follow-up TODOs: None
================================================================================
-->

## Core Principles

### I. 程式碼組織原則 (Code Organization Principles)

**單一職責原則 (Single Responsibility Principle)**: Every module and function MUST do one thing and do it well. JWT generation logic MUST NOT be mixed with data storage code. UI components MUST NOT directly manipulate the file system. This clear separation makes code easier to understand, test, and maintain.

**元件化思維 (Component-Based Design)**: Frontend design MUST embody componentization. Every React component MUST be reusable and composable. For example, profile list items MUST be independent components that receive profile data as props and emit events for selection, editing, and deletion. This design enables component reuse and simplifies testing.

**依賴注入 (Dependency Injection)**: Dependency injection MUST be preferred over hardcoded dependencies. When a module needs functionality from another module, it MUST use parameter passing or dependency injection rather than direct import and usage. This makes code more flexible and easier to unit test with mock objects.

**Rationale**: Clean architecture with clear boundaries reduces cognitive load, prevents unexpected coupling, and enables parallel development. Component isolation is essential for a maintainable React application, especially when handling sensitive security operations.

---

### II. 資料安全原則 (Data Security Principles)

**最小權限原則 (Principle of Least Privilege)**: Private keys MUST be read from encrypted storage only when needed and memory copies MUST be cleared as soon as possible after use. Keys MUST NOT appear in log files nor be serialized to any location where they might leak.

**多層輸入驗證 (Multi-Layer Input Validation)**: Input validation MUST occur at multiple layers. The UI layer MUST validate basic format (e.g., keys cannot be empty, JSON must be valid). The business logic layer MUST validate semantic correctness (e.g., RSA private key format, payload claim validity). This multi-layer validation ensures data integrity and application stability.

**安全的錯誤訊息 (Secure Error Messages)**: Error messages MUST be helpful but MUST NOT leak sensitive information. When a key format is incorrect, the system MUST tell users "金鑰格式不正確,請確認是否為有效的 PEM 格式私鑰" rather than displaying full error stacks or key contents. Error messages MUST help users solve problems without becoming potential information disclosure channels.

**Rationale**: This application handles cryptographic private keys that, if compromised, could enable token forgery and unauthorized access. The security principles ensure keys are protected at rest (DPAPI encryption), in use (minimal memory exposure), and during errors (no leakage in logs/messages).

---

### III. 使用者體驗原則 (User Experience Principles)

**即時回饋 (Immediate Feedback)**: Immediate feedback MUST be provided for all operations. When users click the generate token button, they MUST immediately see the token or an error message. When users enter JSON with format errors, the system MUST display error hints in real-time. This immediate feedback ensures users know whether their operations succeeded, reducing confusion and frustration.

**可預測和可撤銷的操作 (Predictable & Reversible Operations)**: Operations MUST be predictable and reversible. When users delete a profile, the system MUST display a confirmation dialog to prevent accidental operations. Where possible, undo functionality MUST be provided. When users modify profiles, the system MUST clearly show what has been modified to avoid accidentally overwriting important data.

**適應工作流程的介面 (Workflow-Adapted Interface)**: The interface MUST adapt to user workflows. Frequently used operations MUST be placed in easily accessible locations (e.g., the copy token button MUST be next to the token and prominent). Keyboard shortcuts MUST support common operations (e.g., Ctrl+G to quickly generate token, Ctrl+C to copy token). These accumulated details significantly improve usage efficiency.

**Rationale**: Users of this tool are likely developers or security personnel who need efficient, reliable JWT generation. Immediate feedback prevents confusion about whether tokens were generated correctly. Confirmations prevent accidental deletion of complex profiles with embedded private keys.

---

### IV. 程式碼品質原則 (Code Quality Principles)

**清晰且有意義的命名 (Clear & Meaningful Naming)**: Variable names MUST describe what they store; function names MUST describe what they do. For example, `generateJwtToken` is clearer than `generate`, `selectedProfile` is more explicit than `current`. Good naming reduces cognitive load when reading code.

**註解解釋為什麼而非做什麼 (Comments Explain Why Not What)**: Code itself MUST be clear enough to show what it does; comments MUST explain why it's done that way or document non-obvious design decisions. For example, "使用 DPAPI 加密是因為需要確保金鑰只能在當前使用者當前電腦上解密" is valuable commentary.

**全面且有意義的錯誤處理 (Comprehensive & Meaningful Error Handling)**: Every operation that can fail MUST have appropriate error handling. Errors MUST be classified (e.g., user input errors, system errors, network errors) with different handling approaches for each type. Errors MUST NOT be silently swallowed but logged or reported to users.

**測試覆蓋關鍵路徑 (Test Coverage for Critical Paths)**: Core functionality (JWT generation logic, key encryption/decryption, profile storage/loading) MUST have unit tests. Test cases MUST include both normal and exceptional scenarios, ensuring code works correctly in various situations. Tests also serve as valuable documentation showing how code should be used.

**Rationale**: High code quality is non-negotiable for security-sensitive applications. Clear naming and comments enable security audits. Comprehensive error handling prevents silent failures that could lead to invalid tokens. Tests provide confidence that cryptographic operations work correctly.

---

### V. 版本控制和發布原則 (Version Control & Release Principles)

**語意化版本規範 (Semantic Versioning)**: Version numbers MUST follow semantic versioning. Major version increments on incompatible API changes, minor version increments on backward-compatible feature additions, patch version increments on bug fixes. This allows users to judge update risk and benefit from version numbers.

**變更日誌記錄 (Changelog Recording)**: Changelogs MUST record important changes in each version. Users MUST be able to clearly understand what features were added, what issues were fixed, and whether there are breaking changes. Changelogs MUST use user-understandable language rather than developer jargon.

**充分的發布前測試 (Thorough Pre-Release Testing)**: In addition to automated tests, all major functionality MUST be manually tested in real Windows environments before release. Particularly for file system and encryption components, functionality MUST be verified across different Windows system versions.

**Rationale**: Users depend on this tool for generating security tokens. Semantic versioning helps users decide when updates are safe. Thorough testing on Windows is critical since the application uses Windows-specific DPAPI for key encryption.

---

### VI. 文件和溝通原則 (Documentation & Communication Principles)

**快速上手的 README (Quick-Start README)**: README MUST enable new users to get started quickly. Documentation MUST include brief project introduction, installation steps, basic usage, and FAQ. Screenshots and demo videos are helpful, especially for graphical applications.

**程式碼內文件隨程式碼更新 (Code Documentation Updates with Code)**: When modifying function behavior, comments and documentation MUST be updated synchronously. Outdated documentation is worse than no documentation because it misleads readers.

**透明且有組織的問題追蹤 (Transparent & Organized Issue Tracking)**: GitHub Issues or similar tools MUST be used to track bugs and feature requests. Issues MUST have clear titles and descriptions, with reproduction steps or screenshots where necessary. This makes issue tracking and resolution more efficient.

**Rationale**: Documentation reduces the learning curve and support burden. Keeping documentation in sync with code prevents confusion and wasted time. Transparent issue tracking builds user trust and facilitates community contributions.

---

## Security Requirements

This section provides explicit security guidance derived from the Data Security Principles:

**Key Storage**: Private keys MUST be encrypted using Windows DPAPI (Data Protection API) before storage. Keys MUST be stored in user-specific locations with appropriate file system permissions. Keys MUST NEVER be stored in plain text.

**Key Usage**: Keys MUST be decrypted only immediately before JWT signing operations. Key material in memory MUST be cleared (zeroed) immediately after use. Keys MUST NEVER be logged, included in error messages, or transmitted over network.

**Input Validation**: All user inputs (JSON payload, algorithm selection, key material) MUST be validated at UI layer for format correctness and at business logic layer for cryptographic validity. Invalid inputs MUST produce clear, safe error messages that do not leak sensitive information.

**Error Handling**: Cryptographic errors MUST be caught and translated to user-friendly messages. Stack traces MUST NOT be displayed to users. Detailed errors MAY be logged securely for debugging but MUST NOT include key material.

---

## User Experience Standards

This section provides explicit UX guidance derived from the User Experience Principles:

**Response Times**: Token generation MUST complete within 200ms for typical payloads (<10 KB). UI feedback (loading indicators, success/error messages) MUST appear within 100ms of user actions.

**Confirmation Dialogs**: Destructive operations (delete profile, overwrite profile) MUST display confirmation dialogs. Dialogs MUST clearly state what will be deleted/overwritten.

**Keyboard Shortcuts**: The application MUST support:
- Ctrl+G: Generate token from current profile
- Ctrl+C: Copy generated token to clipboard (when token display has focus)
- Ctrl+S: Save current profile
- Escape: Close dialogs/cancel operations

**Accessibility**: UI elements MUST have appropriate labels and ARIA attributes for screen reader support. Keyboard navigation MUST be fully functional without requiring mouse interaction.

---

## Governance

This constitution supersedes all other practices and guides all development decisions for the JWT Token Generator project.

**Amendment Process**: Amendments to this constitution require:
1. Documented rationale for the change
2. Review of impact on existing code and templates
3. Migration plan for any breaking changes
4. Approval via pull request with explicit constitutional amendment note

**Compliance Verification**: All pull requests MUST verify compliance with constitutional principles. Code reviewers MUST check:
- Single responsibility and component isolation (Principle I)
- Proper key handling and input validation (Principle II)
- User feedback and workflow integration (Principle III)
- Naming, error handling, and test coverage (Principle IV)

**Complexity Justification**: Any deviation from constitutional principles (e.g., mixing concerns for performance, skipping tests for prototypes) MUST be explicitly justified in code comments and pull request descriptions. Deviations MUST be tracked as technical debt with plans for remediation.

**Constitution Versioning**: This constitution follows semantic versioning:
- MAJOR: Backward incompatible principle removals/redefinitions
- MINOR: New principles or materially expanded guidance
- PATCH: Clarifications, wording improvements, typo fixes

**Version**: 1.0.0 | **Ratified**: 2025-10-09 | **Last Amended**: 2025-10-09

# JWT Token Generator - MVP Testing Guide

**Version**: 0.1.0 (MVP)
**Date**: 2025-10-09

## 🎯 Quick Start Testing

### Prerequisites
- The app should already be running from `npm start`
- You should see the Electron window with the JWT Token Generator UI

---

## 📋 Test Scenario 1: Generate Token with HS256 (HMAC)

### Step 1: Select a Profile
1. Look at the **left sidebar** labeled "Profiles"
2. You should see **3 profiles** listed:
   - Dev Environment Admin
   - Hybris Merchant Admin
   - OpenAPI Profile
3. **Click on "Dev Environment Admin"**
4. ✅ **Expected**: Profile should be highlighted/selected

### Step 2: Verify Configuration
1. Check the **Algorithm** dropdown shows: `HS256 (HMAC + SHA256)`
2. Check the **Expiration** dropdown shows: `1 Hour`
3. ✅ **Expected**: Both fields auto-populate based on profile

### Step 3: Enter a Test Key (HS256)
Use this test Base64 key:
```
dGVzdC1rZXktc2VjcmV0LWZvci1obWFjLXNoYTI1Ng==
```

1. In the **Signing Key** field, paste the key above
2. ✅ **Expected**:
   - Field accepts the key
   - Helper text shows: "Base64-encoded secret key..."
   - No error message appears

### Step 4: View Payload Preview
1. Scroll down to see the **Payload Preview** box
2. ✅ **Expected**: You should see JSON like:
```json
{
  "userId": "admin001",
  "username": "Admin User",
  "email": "admin@example.com",
  "roleCode": "ADMIN"
}
```

### Step 5: Generate Token
1. Click the **"Generate Token"** button (blue, full width)
2. ✅ **Expected**:
   - Token appears in the display area below
   - You see "Generated Token" heading
   - "Copy to Clipboard" button appears

### Step 6: Examine Token Output
Look for these sections:

**Encoded JWT Token** (long text field):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbjAwMSIsInVzZXJuYW1lIjoiQWRtaW4gVXNlciIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlQ29kZSI6IkFETUlOIiwiaWF0IjoxNzI4NDU2NzAwLCJleHAiOjE3Mjg0NjAzMDB9.X1Y2Z3...
```

**Token Structure** (color-coded):
- 🔵 Header (blue chip)
- 🟣 Payload (purple chip)
- 🟢 Signature (green chip)

**Decoded Header**:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Decoded Payload**:
```json
{
  "userId": "admin001",
  "username": "Admin User",
  "email": "admin@example.com",
  "roleCode": "ADMIN",
  "iat": 1728456700,
  "exp": 1728460300
}
```

**Expiration Time**:
- Shows human-readable format like: "Expires: Oct 09, 2025 14:45:00"

### Step 7: Copy to Clipboard
1. Click **"Copy to Clipboard"** button
2. ✅ **Expected**:
   - Snackbar notification appears (bottom of screen)
   - Message says: "Token copied to clipboard!"
   - Notification disappears after 2 seconds

### Step 8: Verify Token
1. Open a text editor (Notepad)
2. **Paste** (Ctrl+V)
3. ✅ **Expected**: Full JWT token is pasted

### Step 9: Validate Token (External)
1. Go to https://jwt.io
2. Paste your token in the "Encoded" section
3. In the "Verify Signature" section, paste the key: `test-key-secret-for-hmac-sha256`
4. ✅ **Expected**:
   - "Signature Verified" appears at bottom
   - Header and Payload decoded correctly

---

## 📋 Test Scenario 2: Test Different Profile

### Step 1: Select Different Profile
1. Click on **"Hybris Merchant Admin"** in the sidebar
2. ✅ **Expected**:
   - Profile highlights
   - Algorithm stays HS256
   - Expiration changes to `1 Day`

### Step 2: Check Payload Preview
✅ **Expected** different payload:
```json
{
  "userId": "merchant001",
  "username": "Merchant Admin",
  "email": "merchant@example.com",
  "roleCode": "MERCHANT_ADMIN",
  "merchantId": "M001"
}
```

### Step 3: Generate Token
1. Enter the same test key (or a different one)
2. Click **"Generate Token"**
3. ✅ **Expected**: New token with merchant payload appears

---

## 📋 Test Scenario 3: Test RS256 Algorithm

### Step 1: Select RS256 Profile
1. Click on **"OpenAPI Profile"** in the sidebar
2. ✅ **Expected**:
   - Algorithm changes to `RS256 (RSA + SHA256)`
   - Expiration shows `1 Week`
   - Key input becomes **multi-line** (6 rows)

### Step 2: Enter RSA Private Key
**For testing RS256**, use this sample RSA private key:
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA0Z3VS5JJcds3xfn/ygWyF9p1wrhpuMBQ+Q8nhDpzm3zVW6K1
bYt14EqJ2SnLLH0mHj9lY8wN0fGZLxvfIvLRZ1VIBHFXRGJFfPQ6r7cYKmVLt6+C
mBl9U+vl7CnvP1xGkPQGrIUZkLOcF/0A/FVVmDN9bKdGJPLnJ3R0pPvhU+JQqCWL
Q4TvnS8ORFmLMKxnJpEaJI2zMBt0PMu1V+dO6R9lXtmNJgK7RGP7NdA8rXJ6kk+5
gY7cGIJ7HxQQ8tE3vr3l4fYp7bGKqZy2TJvZLaP9Z+rBCK5sN+K7xjL9wMQU2R5J
5nL8fJ4kCmPR7K8rJF1fGqX8mN8r5fKvL1pQxwIDAQABAoIBABL0E9kVjxJFQEXe
W7vN9F8rPcCqE6SFqVJZVPLqH3L7YpPH0NLZ7Y8+bY7F8cJRqLr3Q8kZ0P5HdQxK
-----END RSA PRIVATE KEY-----
```

**Note**: This is just a sample. In production, you'd use a real RSA private key.

### Step 3: Check Key Validation
1. If you enter an invalid key format (missing BEGIN/END markers)
2. ✅ **Expected**: Red error message appears below key field

---

## 📋 Test Scenario 4: Error Handling

### Test 4.1: Empty Key
1. Select any profile
2. **Leave key field empty**
3. Click "Generate Token"
4. ✅ **Expected**: Red alert shows "Please enter a signing key"

### Test 4.2: Invalid Base64 Key
1. Select "Dev Environment Admin" (HS256)
2. Enter invalid text: `this-is-not-base64!@#`
3. Click out of the key field (blur event)
4. ✅ **Expected**:
   - Red error message appears
   - Says something like "Invalid Base64 format..."

### Test 4.3: No Profile Selected
1. Click in empty space in sidebar to deselect
2. ✅ **Expected**:
   - All input fields are disabled (grayed out)
   - Blue info alert shows: "Select a profile to get started"
   - "Generate Token" button is disabled

---

## 📋 Test Scenario 5: Algorithm Switching

### Test 5.1: Change Algorithm Manually
1. Select "Dev Environment Admin"
2. Change **Algorithm** dropdown to `RS256`
3. ✅ **Expected**:
   - Key input changes to multi-line
   - Helper text changes to "PEM-encoded RSA private key..."
   - Previous HS256 key becomes invalid

### Test 5.2: Switch Back
1. Change Algorithm back to `HS256`
2. ✅ **Expected**:
   - Key input changes to single line
   - Helper text changes to "Base64-encoded secret key..."

---

## 📋 Test Scenario 6: Expiration Presets

### Test 6.1: Change Expiration
1. Select a profile
2. Enter a valid key
3. Change **Expiration** to `1 Day`
4. Generate token
5. Look at decoded payload's `exp` value
6. ✅ **Expected**: `exp` is ~86400 seconds (1 day) from `iat`

### Test 6.2: Different Presets
Try each preset and verify:
- **1 Hour**: `exp` = `iat` + 3600
- **1 Day**: `exp` = `iat` + 86400
- **1 Week**: `exp` = `iat` + 604800

---

## 🧪 Advanced Testing

### DevTools Testing (Optional)

1. Open DevTools: Press **F12** or **Ctrl+Shift+I**
2. Go to **Console** tab
3. Test IPC communication:

```javascript
// Load profiles
await window.electronAPI.loadProfiles()
// Should return: { success: true, data: [...3 profiles] }

// Get settings
await window.electronAPI.getSettings()
// Should return: { success: true, data: { version: "1.0.0", ... } }
```

### Check Storage (Optional)

1. Open File Explorer
2. Navigate to: `%APPDATA%\jwt-token-gen`
3. Look for `config.json`
4. ✅ **Expected**: File contains profiles and settings

---

## ✅ Testing Checklist

Use this checklist to verify all features:

### UI Components
- [ ] Application launches without errors
- [ ] Profile list shows 3 default profiles
- [ ] Profile selection highlights the selected item
- [ ] Algorithm dropdown shows HS256/RS256 options
- [ ] Key input field accepts text
- [ ] Key input changes size based on algorithm (single/multi-line)
- [ ] Expiration dropdown shows presets (1h, 1d, 1w, custom)
- [ ] Payload preview displays JSON correctly
- [ ] "Generate Token" button is clickable when ready
- [ ] "Generate Token" button is disabled when no profile selected

### Token Generation
- [ ] HS256 token generates successfully
- [ ] RS256 token generates successfully (with valid RSA key)
- [ ] Token display shows encoded JWT
- [ ] Token structure shows color-coded sections (Header/Payload/Signature)
- [ ] Decoded header displays correctly
- [ ] Decoded payload displays correctly
- [ ] Expiration timestamp shows human-readable format
- [ ] Different profiles generate different tokens

### Copy Functionality
- [ ] "Copy to Clipboard" button appears after generation
- [ ] Clicking copy shows success notification
- [ ] Notification disappears after 2 seconds
- [ ] Pasting works in external applications
- [ ] Token validates on jwt.io

### Error Handling
- [ ] Empty key shows error message
- [ ] Invalid Base64 shows error for HS256
- [ ] Invalid PEM shows error for RS256
- [ ] No profile selected disables inputs
- [ ] Error alerts can be dismissed
- [ ] Errors are user-friendly (no technical jargon)

### Visual & UX
- [ ] Material-UI theme applied
- [ ] Layout is responsive
- [ ] Text is readable
- [ ] Colors are consistent
- [ ] Spacing looks good
- [ ] No visual glitches

---

## 🐛 Known Limitations

1. **No Key Encryption in MVP**: Keys are entered each time (not saved)
2. **No Profile Management**: Can't create/edit/delete profiles yet (Phase 4)
3. **No Custom Expiration**: "Custom" option doesn't work yet (Phase 8)
4. **No Token Parsing**: Can't paste and decode tokens yet (Phase 7)
5. **No Payload Editing**: Payload comes from profile only (Phase 6)

---

## 📝 Test Results Template

Copy this template to report your testing:

```
# JWT Token Generator MVP - Test Results

**Tester**: [Your Name]
**Date**: [Date]
**Version**: 0.1.0

## Test Summary
- [ ] Scenario 1: HS256 Token Generation - PASS/FAIL
- [ ] Scenario 2: Different Profile - PASS/FAIL
- [ ] Scenario 3: RS256 Token - PASS/FAIL
- [ ] Scenario 4: Error Handling - PASS/FAIL
- [ ] Scenario 5: Algorithm Switching - PASS/FAIL
- [ ] Scenario 6: Expiration Presets - PASS/FAIL

## Issues Found
1. [Issue description]
2. [Issue description]

## Screenshots
[Attach screenshots here]

## Overall Assessment
PASS / FAIL
```

---

## 🚀 Next Steps After Testing

If all tests pass:
1. ✅ MVP is validated and working!
2. Ready to add Phase 4: Profile Management
3. Can package for distribution: `npm run dist`

If tests fail:
1. Note the specific scenario that failed
2. Check browser console (F12) for errors
3. Check terminal for Electron errors
4. Report issues for debugging

---

**Happy Testing!** 🎉

For issues or questions, check:
- Browser Console (F12)
- Terminal output
- `TEST_RESULTS.md` for expected behavior

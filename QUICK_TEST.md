# 🚀 Quick Test - 2 Minutes

## Step 1: Check the App is Running
Look at your Electron window. You should see:
- **Title**: "JWT Token Generator"
- **Left sidebar**: "Profiles" with 3 items
- **Right side**: Form with dropdowns and buttons

---

## Step 2: Quick HS256 Test (1 minute)

### Do This:
1. **Click** "Dev Environment Admin" in sidebar
2. **Paste** this key in "Signing Key" field:
   ```
   dGVzdC1rZXktc2VjcmV0LWZvci1obWFjLXNoYTI1Ng==
   ```
3. **Click** "Generate Token" button

### You Should See:
✅ A long token appears (starts with `eyJ...`)
✅ Three colored sections: Header (blue), Payload (purple), Signature (green)
✅ Decoded header shows:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```
✅ Decoded payload shows:
```json
{
  "userId": "admin001",
  "username": "Admin User",
  ...
}
```

---

## Step 3: Test Copy (30 seconds)

### Do This:
1. **Click** "Copy to Clipboard" button
2. **Open** Notepad
3. **Paste** (Ctrl+V)

### You Should See:
✅ Notification: "Token copied to clipboard!"
✅ Token pastes into Notepad

---

## Step 4: Validate Token (30 seconds)

### Do This:
1. **Go to**: https://jwt.io
2. **Paste** your token in "Encoded" box
3. **Scroll down** to "Verify Signature" section
4. **Paste** this in the key field:
   ```
   test-key-secret-for-hmac-sha256
   ```

### You Should See:
✅ "Signature Verified" (blue checkmark at bottom)
✅ Header and Payload decoded match your app

---

## ✅ Success!

If all 4 steps worked:
- **MVP is working perfectly!** 🎉
- You can generate, view, and copy JWT tokens
- Tokens are valid and verifiable

---

## 🐛 If Something Doesn't Work

### No profiles showing?
- Check terminal for errors
- Make sure `npm start` ran successfully

### Token not generating?
- Make sure you entered the test key exactly
- Check for error messages in red

### Can't copy?
- Check browser console (F12)
- Try clicking the token text and copying manually (Ctrl+C)

### Token invalid on jwt.io?
- Make sure you used the exact test key: `test-key-secret-for-hmac-sha256`
- Check algorithm is HS256

---

## 📖 Full Testing Guide

For comprehensive testing, see **TESTING_GUIDE.md**

For detailed test scenarios including:
- RS256 algorithm testing
- Error handling verification
- Different profile testing
- All edge cases

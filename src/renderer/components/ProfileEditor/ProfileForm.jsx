import React, { useState, useEffect } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Box,
  Typography
} from '@mui/material';

/**
 * ProfileForm Component
 *
 * Form fields for profile name and algorithm selection.
 * Includes validation for name uniqueness and profile count limits.
 *
 * @param {Object} props
 * @param {Object} props.formData - Current form data
 * @param {Function} props.onChange - Callback when form data changes
 * @param {string} props.mode - 'create' or 'edit'
 */
function ProfileForm({ formData, onChange, mode }) {
  const [errors, setErrors] = useState({});
  const [existingNames, setExistingNames] = useState([]);
  const [profileCount, setProfileCount] = useState(0);

  useEffect(() => {
    // Load existing profile names and count for validation
    loadProfileInfo();
  }, []);

  /**
   * Load existing profile information for validation
   */
  const loadProfileInfo = async () => {
    try {
      const profiles = await window.electronAPI.loadProfiles();
      if (profiles.success) {
        setExistingNames(profiles.data.map(p => p.name));
        setProfileCount(profiles.data.length);
      }
    } catch (error) {
      // Profile info loading failure handled - validation will still work
    }
  };

  const validateName = (name) => {
    const newErrors = { ...errors };

    if (!name || name.trim().length === 0) {
      newErrors.name = 'Profile name is required';
    } else if (name.length > 50) {
      newErrors.name = 'Profile name must be 50 characters or less';
    } else if (
      existingNames.includes(name) &&
      (mode === 'create' || name !== formData.name)
    ) {
      newErrors.name = 'A profile with this name already exists';
    } else {
      delete newErrors.name;
    }

    setErrors(newErrors);
    return !newErrors.name;
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    validateName(name);
    onChange({
      ...formData,
      name
    });
  };

  const handleAlgorithmChange = (e) => {
    const algorithm = e.target.value;
    onChange({
      ...formData,
      algorithm,
      key: '' // Clear key when algorithm changes
    });
  };

  // Check if profile limit is reached for create mode
  const isProfileLimitReached = mode === 'create' && profileCount >= 50;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 1 }}>
      {isProfileLimitReached && (
        <Alert severity="error">
          Maximum profile limit (50) reached. Please delete an existing profile
          before creating a new one.
        </Alert>
      )}

      <TextField
        label="Profile Name"
        value={formData.name}
        onChange={handleNameChange}
        error={!!errors.name}
        helperText={errors.name || 'Enter a unique name for this profile (1-50 characters)'}
        fullWidth
        required
        disabled={isProfileLimitReached}
        inputProps={{
          maxLength: 50,
          'data-testid': 'profile-name-input'
        }}
      />

      <FormControl fullWidth required disabled={isProfileLimitReached}>
        <InputLabel id="algorithm-label">Algorithm</InputLabel>
        <Select
          labelId="algorithm-label"
          value={formData.algorithm}
          onChange={handleAlgorithmChange}
          label="Algorithm"
          data-testid="profile-algorithm-select"
        >
          <MenuItem value="HS256">HS256 (HMAC with SHA-256)</MenuItem>
          <MenuItem value="RS256">RS256 (RSA with SHA-256)</MenuItem>
        </Select>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          {formData.algorithm === 'HS256'
            ? 'Use a Base64-encoded secret key for HS256'
            : 'Use a PEM-encoded RSA private key for RS256'}
        </Typography>
      </FormControl>

      <TextField
        label="Signing Key"
        value={formData.key || ''}
        onChange={(e) => onChange({ ...formData, key: e.target.value })}
        multiline
        rows={4}
        fullWidth
        required
        disabled={isProfileLimitReached}
        helperText={
          formData.algorithm === 'HS256'
            ? 'Enter Base64-encoded secret key'
            : 'Enter PEM-encoded RSA private key (BEGIN/END markers required)'
        }
        inputProps={{
          'data-testid': 'profile-key-input'
        }}
      />

      {mode === 'edit' && formData.key && (
        <Alert severity="info">
          The key is encrypted at rest. Changing the key will re-encrypt it.
        </Alert>
      )}
    </Box>
  );
}

export default ProfileForm;

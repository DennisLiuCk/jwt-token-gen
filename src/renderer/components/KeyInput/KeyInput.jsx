import React, { useState } from 'react';
import {
  TextField,
  FormHelperText,
  Box,
  Alert
} from '@mui/material';
import { validateKey } from '../../services/validationService';
import { KEY_FORMAT_HINTS } from '../../utils/constants';

export default function KeyInput({ algorithm, value, onChange, disabled = false }) {
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Validate on blur or after typing stops
    if (newValue) {
      const validation = validateKey(newValue, algorithm);
      setError(validation.valid ? null : validation.error);
    } else {
      setError(null);
    }
  };

  const handleBlur = () => {
    if (value) {
      const validation = validateKey(value, algorithm);
      setError(validation.valid ? null : validation.error);
    }
  };

  const isMultiline = algorithm === 'RS256';

  return (
    <Box>
      <TextField
        fullWidth
        label="Signing Key"
        multiline={isMultiline}
        rows={isMultiline ? 6 : 1}
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        error={!!error}
        helperText={error || KEY_FORMAT_HINTS[algorithm]}
        placeholder={
          algorithm === 'HS256'
            ? 'Enter Base64-encoded key'
            : 'Enter PEM-encoded RSA private key'
        }
        data-testid="key-input"
        sx={{ fontFamily: 'monospace' }}
      />

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}

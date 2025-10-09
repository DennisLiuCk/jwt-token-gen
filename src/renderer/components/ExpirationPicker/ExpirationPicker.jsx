import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  TextField,
  Box,
  Alert
} from '@mui/material';
import { EXPIRATION_PRESETS } from '../../utils/constants';
import { formatTimestamp } from '../../utils/format';

export default function ExpirationPicker({
  value,
  onChange,
  customTimestamp,
  onCustomTimestampChange,
  disabled = false
}) {
  const [showCustomInput, setShowCustomInput] = useState(value === 'custom');

  const selectedPreset = EXPIRATION_PRESETS.find(p => p.value === value);

  const handlePresetChange = (newValue) => {
    onChange(newValue);
    setShowCustomInput(newValue === 'custom');
  };

  const handleCustomDateChange = (e) => {
    try {
      const dateString = e.target.value;
      const date = new Date(dateString);
      const timestamp = Math.floor(date.getTime() / 1000);

      if (onCustomTimestampChange) {
        onCustomTimestampChange(timestamp);
      }
    } catch (error) {
      console.error('Invalid date:', error);
    }
  };

  const getHelperText = () => {
    if (!selectedPreset) return '';
    if (selectedPreset.value === 'custom') {
      return 'Enter a specific expiration date and time';
    }
    return `Token expires ${selectedPreset.label.toLowerCase()} from generation`;
  };

  const getCalculatedExpiration = () => {
    if (value === 'custom' && customTimestamp) {
      return formatTimestamp(customTimestamp);
    }

    if (value && value !== 'custom') {
      const now = Math.floor(Date.now() / 1000);
      const seconds = getPresetSeconds(value);
      const expTimestamp = now + seconds;
      return formatTimestamp(expTimestamp);
    }

    return 'N/A';
  };

  const getPresetSeconds = (preset) => {
    const presets = {
      '1h': 3600,
      '1d': 86400,
      '1w': 604800
    };
    return presets[preset] || 3600;
  };

  const isExpiredWarning = customTimestamp && customTimestamp < Math.floor(Date.now() / 1000);

  return (
    <Box>
      <FormControl fullWidth disabled={disabled}>
        <InputLabel id="expiration-select-label">Expiration</InputLabel>
        <Select
          labelId="expiration-select-label"
          id="expiration-select"
          value={value || '1h'}
          label="Expiration"
          onChange={(e) => handlePresetChange(e.target.value)}
          data-testid="expiration-picker"
        >
          {EXPIRATION_PRESETS.map((preset) => (
            <MenuItem key={preset.value} value={preset.value}>
              {preset.label}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{getHelperText()}</FormHelperText>
      </FormControl>

      {showCustomInput && (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Custom Expiration Date & Time"
            type="datetime-local"
            onChange={handleCustomDateChange}
            disabled={disabled}
            InputLabelProps={{
              shrink: true,
            }}
            helperText="Enter the exact date and time for token expiration"
            data-testid="custom-expiration-input"
          />
          {isExpiredWarning && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Warning: This expiration time is in the past. The token will be expired immediately.
              This may be useful for testing scenarios.
            </Alert>
          )}
        </Box>
      )}

      <Box sx={{ mt: 1 }}>
        <FormHelperText>
          Calculated expiration: {getCalculatedExpiration()}
        </FormHelperText>
      </Box>
    </Box>
  );
}

import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { EXPIRATION_PRESETS } from '../../utils/constants';

export default function ExpirationPicker({ value, onChange, disabled = false }) {
  const selectedPreset = EXPIRATION_PRESETS.find(p => p.value === value);

  const getHelperText = () => {
    if (!selectedPreset) return '';
    if (selectedPreset.value === 'custom') {
      return 'Custom expiration time (configure in profile)';
    }
    return `Token expires ${selectedPreset.label.toLowerCase()} from generation`;
  };

  return (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel id="expiration-select-label">Expiration</InputLabel>
      <Select
        labelId="expiration-select-label"
        id="expiration-select"
        value={value || '1h'}
        label="Expiration"
        onChange={(e) => onChange(e.target.value)}
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
  );
}

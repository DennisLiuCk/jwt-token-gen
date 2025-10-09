import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { ALGORITHMS } from '../../utils/constants';

export default function AlgorithmSelector({ value, onChange, disabled = false }) {
  return (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel id="algorithm-select-label">Algorithm</InputLabel>
      <Select
        labelId="algorithm-select-label"
        id="algorithm-select"
        value={value || 'HS256'}
        label="Algorithm"
        onChange={(e) => onChange(e.target.value)}
        data-testid="algorithm-selector"
      >
        {ALGORITHMS.map((alg) => (
          <MenuItem key={alg.value} value={alg.value}>
            {alg.label}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>
        {value === 'HS256'
          ? 'HMAC with SHA-256 (symmetric key)'
          : 'RSA with SHA-256 (asymmetric key)'}
      </FormHelperText>
    </FormControl>
  );
}

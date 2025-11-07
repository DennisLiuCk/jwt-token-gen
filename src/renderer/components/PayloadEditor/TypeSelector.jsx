import React from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  Box,
  Chip
} from '@mui/material';

/**
 * TypeSelector Component
 *
 * A compact dropdown for selecting the data type of a payload field.
 * Supports: string, number, boolean, null
 */
export default function TypeSelector({ value, onChange, disabled = false }) {
  const typeOptions = [
    { value: 'string', label: 'String', color: '#10a37f' },
    { value: 'number', label: 'Number', color: '#0066cc' },
    { value: 'boolean', label: 'Boolean', color: '#9333ea' },
    { value: 'null', label: 'Null', color: '#6b7280' }
  ];

  const currentType = typeOptions.find(opt => opt.value === value) || typeOptions[0];

  return (
    <Box sx={{ minWidth: 100 }}>
      <FormControl size="small" fullWidth disabled={disabled}>
        <Select
          value={value || 'string'}
          onChange={(e) => onChange(e.target.value)}
          renderValue={(selected) => {
            const type = typeOptions.find(opt => opt.value === selected);
            return (
              <Chip
                label={type.label}
                size="small"
                sx={{
                  backgroundColor: type.color,
                  color: '#ffffff',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  height: '24px',
                  '& .MuiChip-label': {
                    padding: '0 8px'
                  }
                }}
              />
            );
          }}
          sx={{
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(0, 0, 0, 0.23)'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: currentType.color
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: currentType.color
            }
          }}
        >
          {typeOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={option.label}
                  size="small"
                  sx={{
                    backgroundColor: option.color,
                    color: '#ffffff',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    height: '24px',
                    '& .MuiChip-label': {
                      padding: '0 8px'
                    }
                  }}
                />
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

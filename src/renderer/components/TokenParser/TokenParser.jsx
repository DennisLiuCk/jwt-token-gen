import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import { parseToken } from '../../services/jwtService';
import ParsedOutput from './ParsedOutput';

/**
 * TokenParser Component
 *
 * Allows users to paste existing JWT tokens and view decoded header/payload.
 * Useful for debugging and token analysis.
 */
export default function TokenParser() {
  const [tokenInput, setTokenInput] = useState('');
  const [parsedToken, setParsedToken] = useState(null);
  const [error, setError] = useState(null);

  const handleTokenInput = (e) => {
    const token = e.target.value;
    setTokenInput(token);

    // Auto-parse if token looks complete (has three parts)
    if (token && token.split('.').length === 3) {
      try {
        const parsed = parseToken(token);
        setParsedToken(parsed);
        setError(null);
      } catch (err) {
        setError(err.message);
        setParsedToken(null);
      }
    } else if (token) {
      setError('Token incomplete. Expected format: header.payload.signature');
      setParsedToken(null);
    } else {
      setError(null);
      setParsedToken(null);
    }
  };

  return (
    <Paper
      sx={{
        p: 4,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        boxShadow: 2
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          mb: 3,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        Token Parser & Analyzer
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 3, fontSize: '0.9375rem' }}
      >
        Paste a JWT token to decode and analyze its header and payload
      </Typography>

      <TextField
        fullWidth
        multiline
        rows={4}
        label="JWT Token"
        placeholder="Paste your JWT token here (e.g., eyJhbGciOiJIUzI1NiIs...)"
        value={tokenInput}
        onChange={handleTokenInput}
        error={!!error}
        helperText={error || 'Token will be automatically parsed as you type'}
        sx={{ mb: 3, fontFamily: 'monospace' }}
        data-testid="token-parser-input"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {parsedToken && (
        <ParsedOutput parsedToken={parsedToken} />
      )}

      {!tokenInput && !error && (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
          <Typography variant="body2">
            No token to parse. Paste a JWT token above to begin.
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

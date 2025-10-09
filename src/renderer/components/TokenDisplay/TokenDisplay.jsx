import React from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  Chip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { visualizeToken, formatJSON, formatTimestamp } from '../../utils/format';

export default function TokenDisplay({ token, onCopy }) {
  if (!token) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No token generated yet. Configure settings and click Generate Token.
        </Typography>
      </Paper>
    );
  }

  const { header, payload, signature } = visualizeToken(token.raw);

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Generated Token</Typography>
        <Button
          variant="contained"
          startIcon={<ContentCopyIcon />}
          onClick={() => onCopy(token.raw)}
          data-testid="copy-token-button"
        >
          Copy to Clipboard
        </Button>
      </Box>

      {/* Encoded Token */}
      <TextField
        fullWidth
        multiline
        rows={4}
        value={token.raw}
        label="Encoded JWT Token"
        InputProps={{
          readOnly: true,
          sx: { fontFamily: 'monospace', fontSize: '0.875rem' }
        }}
        sx={{ mb: 3 }}
        data-testid="token-output"
      />

      {/* Visual Separation */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Token Structure
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, fontFamily: 'monospace', fontSize: '0.75rem' }}>
          <Box>
            <Chip label="Header" size="small" color="primary" sx={{ mr: 1 }} />
            <Typography component="span" sx={{ wordBreak: 'break-all', color: 'primary.main' }}>
              {header}
            </Typography>
          </Box>
          <Box>
            <Chip label="Payload" size="small" color="secondary" sx={{ mr: 1 }} />
            <Typography component="span" sx={{ wordBreak: 'break-all', color: 'secondary.main' }}>
              {payload}
            </Typography>
          </Box>
          <Box>
            <Chip label="Signature" size="small" color="success" sx={{ mr: 1 }} />
            <Typography component="span" sx={{ wordBreak: 'break-all', color: 'success.main' }}>
              {signature}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Decoded Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Decoded Header
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
          <pre style={{ margin: 0, fontSize: '0.875rem', overflow: 'auto' }}>
            {formatJSON(token.header)}
          </pre>
        </Paper>
      </Box>

      {/* Decoded Payload */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Decoded Payload
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
          <pre style={{ margin: 0, fontSize: '0.875rem', overflow: 'auto' }}>
            {formatJSON(token.payload)}
          </pre>
        </Paper>
        {token.payload.exp && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Expires: {formatTimestamp(token.payload.exp)}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

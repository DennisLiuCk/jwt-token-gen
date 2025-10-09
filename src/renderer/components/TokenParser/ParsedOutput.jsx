import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Alert
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { formatTimestamp } from '../../utils/format';

/**
 * ParsedOutput Component
 *
 * Displays decoded JWT header and payload in a readable format.
 * Shows timestamps in human-readable format and allows copying claim values.
 */
export default function ParsedOutput({ parsedToken }) {
  const { header, payload } = parsedToken;

  /**
   * Copy a claim value to the clipboard
   * @param {string} claimName - The name of the claim
   * @param {any} claimValue - The value of the claim
   */
  const handleCopyClaim = async (claimName, claimValue) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(claimValue));
    } catch (error) {
      // Clipboard operation failure handled silently
    }
  };

  const renderClaimValue = (key, value) => {
    // Format timestamp claims
    if (['exp', 'iat', 'nbf'].includes(key) && typeof value === 'number') {
      return (
        <Box>
          <Typography variant="body2" component="span">
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            ({formatTimestamp(value)})
          </Typography>
        </Box>
      );
    }

    // Render other values
    if (typeof value === 'object') {
      return (
        <pre style={{ margin: 0, fontSize: '0.875rem', fontFamily: 'monospace' }}>
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }

    return (
      <Typography variant="body2" component="span" sx={{ fontFamily: 'monospace' }}>
        {String(value)}
      </Typography>
    );
  };

  return (
    <Box>
      {/* Header Section */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'info.50' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Header
          </Typography>
          <Chip
            label={header.alg}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
        <Divider sx={{ my: 1 }} />

        <Grid container spacing={1}>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">
              Algorithm
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {header.alg}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">
              Type
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {header.typ || 'JWT'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Payload Section */}
      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'success.50' }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Payload Claims
        </Typography>
        <Divider sx={{ my: 1 }} />

        {Object.entries(payload).length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No claims in payload
          </Typography>
        ) : (
          <Box>
            {Object.entries(payload).map(([key, value]) => (
              <Box
                key={key}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  py: 1,
                  borderBottom: 1,
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 0 }
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {key}
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {renderClaimValue(key, value)}
                  </Box>
                </Box>
                <Tooltip title="Copy claim value">
                  <IconButton
                    size="small"
                    onClick={() => handleCopyClaim(key, value)}
                    data-testid={`copy-claim-${key}`}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      {/* Token Validation Info */}
      {payload.exp && (
        <Box sx={{ mt: 2 }}>
          {payload.exp * 1000 < Date.now() ? (
            <Alert severity="warning">
              This token has expired on {formatTimestamp(payload.exp)}
            </Alert>
          ) : (
            <Alert severity="success">
              This token is valid until {formatTimestamp(payload.exp)}
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
}

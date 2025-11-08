import React, { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Chip,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  History as HistoryIcon,
  Replay as ReplayIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useTokenHistory } from '../../context/TokenHistoryContext';

export default function TokenHistory({ onRegenerate }) {
  const { history, loading, clearHistory } = useTokenHistory();
  const [expanded, setExpanded] = useState(false);

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all token generation history?')) {
      await clearHistory();
    }
  };

  const handleRegenerate = (entry) => {
    if (onRegenerate) {
      onRegenerate({
        profileId: entry.profileId,
        profileName: entry.profileName,
        algorithm: entry.algorithm,
        expirationPreset: entry.expirationPreset
      });
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleString();
  };

  if (loading) {
    return null;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon />
            <Typography>Token Generation History</Typography>
            {history.length > 0 && (
              <Chip
                label={history.length}
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {history.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No token generation history yet. Generate a token to see it here.
            </Typography>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <Button
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={handleClearHistory}
                  color="error"
                >
                  Clear History
                </Button>
              </Box>
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {history.map((entry) => (
                  <ListItem
                    key={entry.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                    secondaryAction={
                      <Tooltip title="Regenerate token with this configuration">
                        <IconButton
                          edge="end"
                          onClick={() => handleRegenerate(entry)}
                          size="small"
                        >
                          <ReplayIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle2">{entry.profileName}</Typography>
                          <Chip label={entry.algorithm} size="small" variant="outlined" />
                          {entry.expirationPreset && (
                            <Chip
                              label={entry.expirationPreset}
                              size="small"
                              icon={<ScheduleIcon />}
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Generated: {formatDate(entry.generatedAt)}
                          </Typography>
                          {entry.expiresAt && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Expires: {new Date(entry.expiresAt).toLocaleString()}
                            </Typography>
                          )}
                          {entry.payloadSummary && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              sx={{
                                mt: 0.5,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '500px'
                              }}
                            >
                              Payload: {entry.payloadSummary}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { useProfile } from '../../context/ProfileContext';

export default function ProfileList() {
  const { profiles, selectedProfile, selectProfile, loading } = useProfile();

  const handleSelectProfile = (profile) => {
    selectProfile(profile);
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2, height: '100%' }}>
        <Typography variant="body2">Loading profiles...</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Profiles
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {profiles.length} of 50
        </Typography>
      </Box>

      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {profiles.length === 0 ? (
          <ListItem>
            <ListItemText
              primary="No profiles"
              secondary="Create a profile to get started"
            />
          </ListItem>
        ) : (
          profiles.map((profile) => (
            <ListItemButton
              key={profile.id}
              selected={selectedProfile?.id === profile.id}
              onClick={() => handleSelectProfile(profile)}
              data-testid={`profile-${profile.id}`}
            >
              <ListItemText
                primary={profile.name}
                secondary={
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Chip
                      label={profile.algorithm}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={profile.expirationPreset || '1h'}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                }
              />
            </ListItemButton>
          ))
        )}
      </List>
    </Paper>
  );
}

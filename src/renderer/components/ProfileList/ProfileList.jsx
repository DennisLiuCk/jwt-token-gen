import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import { useProfile } from '../../context/ProfileContext';
import ProfileEditorDialog from '../ProfileEditor/ProfileEditorDialog';

export default function ProfileList({ compact = false }) {
  const {
    profiles,
    selectedProfile,
    selectProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    hasUnsavedChanges,
    discardChanges,
    loading
  } = useProfile();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState('create');
  const [editingProfile, setEditingProfile] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [unsavedChangesDialogOpen, setUnsavedChangesDialogOpen] = useState(false);
  const [pendingProfile, setPendingProfile] = useState(null);

  const handleSelectProfile = (profile) => {
    if (hasUnsavedChanges) {
      setPendingProfile(profile);
      setUnsavedChangesDialogOpen(true);
    } else {
      selectProfile(profile);
    }
  };

  const handleSaveUnsavedChanges = () => {
    // Save current changes and then switch
    // For now, just discard as we don't have form state here
    discardChanges();
    if (pendingProfile) {
      selectProfile(pendingProfile, true);
      setPendingProfile(null);
    }
    setUnsavedChangesDialogOpen(false);
  };

  const handleDiscardUnsavedChanges = () => {
    discardChanges();
    if (pendingProfile) {
      selectProfile(pendingProfile, true);
      setPendingProfile(null);
    }
    setUnsavedChangesDialogOpen(false);
  };

  const handleNewProfile = () => {
    setEditorMode('create');
    setEditingProfile(null);
    setEditorOpen(true);
  };

  const handleEditProfile = (profile, event) => {
    event.stopPropagation(); // Prevent profile selection
    setEditorMode('edit');
    setEditingProfile(profile);
    setEditorOpen(true);
  };

  const handleDeleteProfile = (profile, event) => {
    event.stopPropagation(); // Prevent profile selection
    setProfileToDelete(profile);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (profileToDelete) {
      await deleteProfile(profileToDelete.id);
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
    }
  };

  const handleSaveProfile = async (profileData) => {
    let result;
    if (editorMode === 'create') {
      result = await createProfile(profileData);
    } else if (editorMode === 'edit' && editingProfile) {
      result = await updateProfile(editingProfile.id, profileData);
    }

    if (result) {
      setEditorOpen(false);
    }
    // Error handling is done in the context
  };

  if (loading) {
    return compact ? (
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2">Loading profiles...</Typography>
      </Box>
    ) : (
      <Paper sx={{ p: 2, height: '100%' }}>
        <Typography variant="body2">Loading profiles...</Typography>
      </Paper>
    );
  }

  // Compact mode - horizontal selector
  if (compact) {
    return (
      <>
        <Paper
          sx={{
            p: 3,
            mb: 3,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <FormControl fullWidth>
              <InputLabel id="profile-select-label">Select Profile</InputLabel>
              <Select
                labelId="profile-select-label"
                value={selectedProfile?.id || ''}
                label="Select Profile"
                onChange={(e) => {
                  const profile = profiles.find(p => p.id === e.target.value);
                  if (profile) handleSelectProfile(profile);
                }}
                data-testid="profile-selector"
              >
                {profiles.length === 0 ? (
                  <MenuItem value="" disabled>
                    No profiles available
                  </MenuItem>
                ) : (
                  profiles.map((profile) => (
                    <MenuItem key={profile.id} value={profile.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Typography sx={{ flexGrow: 1, fontWeight: 500 }}>
                          {profile.name}
                        </Typography>
                        <Chip
                          label={profile.algorithm}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.7rem',
                            bgcolor: 'grey.100',
                            border: 'none'
                          }}
                        />
                        <Chip
                          label={profile.expirationPreset || '1h'}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.7rem',
                            bgcolor: 'grey.100',
                            border: 'none'
                          }}
                        />
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleNewProfile}
              sx={{
                minWidth: 'auto',
                whiteSpace: 'nowrap',
                borderRadius: 1.5
              }}
              data-testid="new-profile-button-compact"
            >
              New
            </Button>

            {selectedProfile && (
              <>
                <IconButton
                  color="primary"
                  onClick={(e) => handleEditProfile(selectedProfile, { stopPropagation: () => {} })}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1.5,
                    '&:hover': {
                      bgcolor: 'primary.50'
                    }
                  }}
                  data-testid="edit-profile-button-compact"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={(e) => handleDeleteProfile(selectedProfile, { stopPropagation: () => {} })}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1.5,
                    '&:hover': {
                      bgcolor: 'error.50'
                    }
                  }}
                  data-testid="delete-profile-button-compact"
                >
                  <DeleteIcon />
                </IconButton>
              </>
            )}
          </Box>

          {selectedProfile && (
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Current Profile
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {selectedProfile.name}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Dialogs */}
        <ProfileEditorDialog
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          onSave={handleSaveProfile}
          profile={editingProfile}
          mode={editorMode}
        />

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          aria-labelledby="delete-dialog-title"
        >
          <DialogTitle id="delete-dialog-title">Delete Profile</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the profile "{profileToDelete?.name}"?
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={unsavedChangesDialogOpen}
          onClose={() => setUnsavedChangesDialogOpen(false)}
          aria-labelledby="unsaved-changes-dialog-title"
        >
          <DialogTitle id="unsaved-changes-dialog-title">Unsaved Changes</DialogTitle>
          <DialogContent>
            <DialogContentText>
              You have unsaved changes in the current profile. What would you like to do?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUnsavedChangesDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleDiscardUnsavedChanges} color="warning">
              Discard Changes
            </Button>
            <Button onClick={handleSaveUnsavedChanges} variant="contained" color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  // Original sidebar mode
  return (
    <>
      <Paper
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          boxShadow: 2
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: '1rem',
                fontWeight: 600,
                letterSpacing: '-0.01em'
              }}
            >
              Profiles
            </Typography>
            <Button
              startIcon={<AddIcon />}
              size="small"
              variant="contained"
              onClick={handleNewProfile}
              data-testid="new-profile-button"
              sx={{
                borderRadius: 1.5,
                textTransform: 'none',
                fontSize: '0.875rem'
              }}
            >
              New
            </Button>
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: '0.8125rem',
              display: 'block'
            }}
          >
            {profiles.length} of 50
          </Typography>
        </Box>

        <List sx={{ flexGrow: 1, overflow: 'auto', p: 1.5 }}>
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
                sx={{
                  borderRadius: 1.5,
                  mb: 0.5,
                  px: 2,
                  py: 1.5,
                  transition: 'all 0.2s',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(171, 107, 46, 0.08)',
                    borderLeft: '3px solid',
                    borderColor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'rgba(171, 107, 46, 0.12)',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'grey.50',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        fontSize: '0.9375rem',
                        fontWeight: selectedProfile?.id === profile.id ? 600 : 500,
                        color: 'text.primary',
                        mb: 0.5
                      }}
                    >
                      {profile.name}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', gap: 0.75, mt: 0.75 }}>
                      <Chip
                        label={profile.algorithm}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.75rem',
                          bgcolor: 'grey.100',
                          color: 'text.secondary',
                          border: 'none',
                          fontWeight: 500
                        }}
                      />
                      <Chip
                        label={profile.expirationPreset || '1h'}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.75rem',
                          bgcolor: 'grey.100',
                          color: 'text.secondary',
                          border: 'none',
                          fontWeight: 500
                        }}
                      />
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => handleEditProfile(profile, e)}
                    data-testid={`edit-profile-${profile.id}`}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                        bgcolor: 'rgba(171, 107, 46, 0.08)'
                      }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => handleDeleteProfile(profile, e)}
                    data-testid={`delete-profile-${profile.id}`}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'error.main',
                        bgcolor: 'error.50'
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </ListItemButton>
            ))
          )}
        </List>
      </Paper>

      {/* Profile Editor Dialog */}
      <ProfileEditorDialog
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSaveProfile}
        profile={editingProfile}
        mode={editorMode}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Profile
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the profile "{profileToDelete?.name}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unsaved Changes Warning Dialog */}
      <Dialog
        open={unsavedChangesDialogOpen}
        onClose={() => setUnsavedChangesDialogOpen(false)}
        aria-labelledby="unsaved-changes-dialog-title"
      >
        <DialogTitle id="unsaved-changes-dialog-title">
          Unsaved Changes
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have unsaved changes in the current profile. What would you like to do?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnsavedChangesDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDiscardUnsavedChanges} color="warning">
            Discard Changes
          </Button>
          <Button onClick={handleSaveUnsavedChanges} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

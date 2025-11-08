import React, { useState, useMemo, useRef } from 'react';
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
  MenuItem,
  TextField,
  InputAdornment,
  Collapse,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FolderIcon from '@mui/icons-material/Folder';
import { useProfile } from '../../context/ProfileContext';
import { useProfileGroup } from '../../context/ProfileGroupContext';
import ProfileEditorDialog from '../ProfileEditor/ProfileEditorDialog';
import ProfileGroupManager from './ProfileGroupManager';

export default function ProfileList({ compact = false }) {
  const {
    profiles,
    selectedProfile,
    selectProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    duplicateProfile,
    toggleFavorite,
    toggleTemplate,
    hasUnsavedChanges,
    discardChanges,
    loading
  } = useProfile();

  const { groups, toggleCollapsed } = useProfileGroup();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState('create');
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [unsavedChangesDialogOpen, setUnsavedChangesDialogOpen] = useState(false);
  const [pendingProfile, setPendingProfile] = useState(null);
  const [recentProfiles, setRecentProfiles] = useState([]);
  const [groupManagerOpen, setGroupManagerOpen] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    algorithm: null,      // 'HS256' | 'RS256' | null
    expirationPreset: null, // '1h' | '1d' | '1w' | null
    showFavoritesOnly: false,
    showTemplatesOnly: false
  });

  // Search input ref for Ctrl+F
  const searchInputRef = useRef(null);

  // Load recent profiles
  React.useEffect(() => {
    loadRecentProfiles();
  }, [profiles]); // Reload when profiles change

  const loadRecentProfiles = async () => {
    try {
      const result = await window.electronAPI.getRecentProfiles();
      if (result.success) {
        setRecentProfiles(result.data || []);
      }
    } catch (err) {
      console.error('Failed to load recent profiles:', err);
    }
  };

  // Filter profiles based on search and filters
  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchName = profile.name.toLowerCase().includes(query);
        const matchAlgorithm = profile.algorithm.toLowerCase().includes(query);
        const matchPayload = JSON.stringify(profile.payload)
          .toLowerCase()
          .includes(query);

        if (!matchName && !matchAlgorithm && !matchPayload) {
          return false;
        }
      }

      // Algorithm filter
      if (activeFilters.algorithm && profile.algorithm !== activeFilters.algorithm) {
        return false;
      }

      // Expiration preset filter
      if (activeFilters.expirationPreset &&
          profile.expirationPreset !== activeFilters.expirationPreset) {
        return false;
      }

      // Favorites only filter
      if (activeFilters.showFavoritesOnly && !profile.isFavorite) {
        return false;
      }

      // Templates only filter
      if (activeFilters.showTemplatesOnly && !profile.isTemplate) {
        return false;
      }

      return true;
    });
  }, [profiles, searchQuery, activeFilters]);

  // Separate profiles into categories
  const favoriteProfiles = useMemo(() => {
    return filteredProfiles.filter(p => p.isFavorite);
  }, [filteredProfiles]);

  const nonFavoriteProfiles = useMemo(() => {
    return filteredProfiles.filter(p => !p.isFavorite);
  }, [filteredProfiles]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return activeFilters.algorithm !== null ||
           activeFilters.expirationPreset !== null ||
           activeFilters.showFavoritesOnly ||
           activeFilters.showTemplatesOnly;
  }, [activeFilters]);

  const clearSearch = () => {
    setSearchQuery('');
    setActiveFilters({
      algorithm: null,
      expirationPreset: null,
      showFavoritesOnly: false,
      showTemplatesOnly: false
    });
  };

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
    setEditingProfileId(null);
    setEditorOpen(true);
  };

  const handleEditProfile = (profile, event) => {
    if (event && event.stopPropagation) {
      event.stopPropagation(); // Prevent profile selection
    }
    setEditorMode('edit');
    setEditingProfileId(profile.id);
    setEditorOpen(true);
  };

  const handleDeleteProfile = (profile, event) => {
    if (event && event.stopPropagation) {
      event.stopPropagation(); // Prevent profile selection
    }
    setProfileToDelete(profile);
    setDeleteDialogOpen(true);
  };

  const handleDuplicateProfile = async (profile, event) => {
    if (event && event.stopPropagation) {
      event.stopPropagation(); // Prevent profile selection
    }
    await duplicateProfile(profile.id);
  };

  const handleToggleFavorite = async (profile, event) => {
    if (event && event.stopPropagation) {
      event.stopPropagation(); // Prevent profile selection
    }
    await toggleFavorite(profile.id);
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
    } else if (editorMode === 'edit' && editingProfileId) {
      result = await updateProfile(editingProfileId, profileData);
    }

    if (result) {
      setEditorOpen(false);
    }
    // Error handling is done in the context
  };

  // Get the current editing profile from the fresh profiles array
  const editingProfile = editingProfileId
    ? profiles.find(p => p.id === editingProfileId)
    : null;

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
          {/* Search Bar */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search profiles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              inputRef={searchInputRef}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (searchQuery || hasActiveFilters) && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={clearSearch}
                      edge="end"
                      title="Clear search and filters"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ borderRadius: 1.5 }}
            />

            {/* Filter Chips */}
            {(searchQuery || hasActiveFilters) && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
                {activeFilters.algorithm && (
                  <Chip
                    label={activeFilters.algorithm}
                    size="small"
                    onDelete={() => setActiveFilters(prev => ({ ...prev, algorithm: null }))}
                    color="primary"
                    variant="outlined"
                  />
                )}
                {activeFilters.expirationPreset && (
                  <Chip
                    label={`Exp: ${activeFilters.expirationPreset}`}
                    size="small"
                    onDelete={() => setActiveFilters(prev => ({ ...prev, expirationPreset: null }))}
                    color="primary"
                    variant="outlined"
                  />
                )}
                {activeFilters.showFavoritesOnly && (
                  <Chip
                    icon={<StarIcon />}
                    label="Favorites"
                    size="small"
                    onDelete={() => setActiveFilters(prev => ({ ...prev, showFavoritesOnly: false }))}
                    color="warning"
                    variant="outlined"
                  />
                )}
                {activeFilters.showTemplatesOnly && (
                  <Chip
                    label="Templates"
                    size="small"
                    onDelete={() => setActiveFilters(prev => ({ ...prev, showTemplatesOnly: false }))}
                    color="primary"
                    variant="outlined"
                  />
                )}
                <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', ml: 1 }}>
                  {filteredProfiles.length} of {profiles.length} profiles
                </Typography>
              </Box>
            )}

            {/* Quick Filter Buttons */}
            <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
              <Chip
                label="HS256"
                size="small"
                clickable
                onClick={() => setActiveFilters(prev => ({
                  ...prev,
                  algorithm: prev.algorithm === 'HS256' ? null : 'HS256'
                }))}
                color={activeFilters.algorithm === 'HS256' ? 'primary' : 'default'}
                variant={activeFilters.algorithm === 'HS256' ? 'filled' : 'outlined'}
              />
              <Chip
                label="RS256"
                size="small"
                clickable
                onClick={() => setActiveFilters(prev => ({
                  ...prev,
                  algorithm: prev.algorithm === 'RS256' ? null : 'RS256'
                }))}
                color={activeFilters.algorithm === 'RS256' ? 'primary' : 'default'}
                variant={activeFilters.algorithm === 'RS256' ? 'filled' : 'outlined'}
              />
              <Chip
                icon={<StarIcon />}
                label="Favorites"
                size="small"
                clickable
                onClick={() => setActiveFilters(prev => ({
                  ...prev,
                  showFavoritesOnly: !prev.showFavoritesOnly
                }))}
                color={activeFilters.showFavoritesOnly ? 'warning' : 'default'}
                variant={activeFilters.showFavoritesOnly ? 'filled' : 'outlined'}
              />
            </Box>
          </Box>

          {/* Recent Profiles Quick Access */}
          {recentProfiles.length > 0 && !searchQuery && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                🕐 Recent Profiles
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {recentProfiles.slice(0, 5).map((profile) => (
                  <Button
                    key={profile.id}
                    size="small"
                    variant={selectedProfile?.id === profile.id ? 'contained' : 'outlined'}
                    onClick={() => handleSelectProfile(profile)}
                    sx={{
                      borderRadius: 1.5,
                      textTransform: 'none',
                      fontSize: '0.8125rem',
                      px: 1.5,
                      py: 0.5
                    }}
                  >
                    {profile.isFavorite && '⭐ '}
                    {profile.name}
                  </Button>
                ))}
              </Box>
            </Box>
          )}

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
                {filteredProfiles.length === 0 ? (
                  <MenuItem value="" disabled>
                    {searchQuery || hasActiveFilters ? 'No matching profiles' : 'No profiles available'}
                  </MenuItem>
                ) : (
                  <>
                    {/* Favorites Section */}
                    {favoriteProfiles.length > 0 && (
                      <>
                        <MenuItem disabled sx={{ opacity: 0.8, fontWeight: 600, fontSize: '0.75rem' }}>
                          ⭐ FAVORITES ({favoriteProfiles.length})
                        </MenuItem>
                        {favoriteProfiles.map((profile) => (
                          <MenuItem key={profile.id} value={profile.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                              <StarIcon fontSize="small" sx={{ color: 'warning.main' }} />
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
                        ))}
                        {nonFavoriteProfiles.length > 0 && <Divider sx={{ my: 1 }} />}
                      </>
                    )}

                    {/* Non-Favorites Section */}
                    {nonFavoriteProfiles.length > 0 && (
                      <>
                        {favoriteProfiles.length > 0 && (
                          <MenuItem disabled sx={{ opacity: 0.8, fontWeight: 600, fontSize: '0.75rem' }}>
                            📂 ALL PROFILES ({nonFavoriteProfiles.length})
                          </MenuItem>
                        )}
                        {nonFavoriteProfiles.map((profile) => (
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
                        ))}
                      </>
                    )}
                  </>
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

            <IconButton
              color="default"
              onClick={() => setGroupManagerOpen(true)}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5,
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
              title="Manage Profile Groups"
            >
              <FolderIcon />
            </IconButton>

            {selectedProfile && (
              <>
                <IconButton
                  color={selectedProfile.isFavorite ? 'warning' : 'default'}
                  onClick={() => handleToggleFavorite(selectedProfile)}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1.5,
                    '&:hover': {
                      bgcolor: 'warning.50'
                    }
                  }}
                  title={selectedProfile.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  data-testid="favorite-profile-button-compact"
                >
                  {selectedProfile.isFavorite ? <StarIcon /> : <StarBorderIcon />}
                </IconButton>
                <IconButton
                  color="primary"
                  onClick={() => handleDuplicateProfile(selectedProfile)}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1.5,
                    '&:hover': {
                      bgcolor: 'primary.50'
                    }
                  }}
                  title="Duplicate profile"
                  data-testid="duplicate-profile-button-compact"
                >
                  <ContentCopyIcon />
                </IconButton>
                <IconButton
                  color="primary"
                  onClick={() => handleEditProfile(selectedProfile)}
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
                  onClick={() => handleDeleteProfile(selectedProfile)}
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
                    onClick={(e) => handleToggleFavorite(profile, e)}
                    data-testid={`favorite-profile-${profile.id}`}
                    sx={{
                      color: profile.isFavorite ? 'warning.main' : 'text.secondary',
                      '&:hover': {
                        color: 'warning.main',
                        bgcolor: 'warning.50'
                      }
                    }}
                    title={profile.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {profile.isFavorite ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => handleDuplicateProfile(profile, e)}
                    data-testid={`duplicate-profile-${profile.id}`}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                        bgcolor: 'rgba(171, 107, 46, 0.08)'
                      }
                    }}
                    title="Duplicate profile"
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
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

      {/* P3.2: Profile Group Manager Dialog */}
      <ProfileGroupManager
        open={groupManagerOpen}
        onClose={() => setGroupManagerOpen(false)}
      />
    </>
  );
}

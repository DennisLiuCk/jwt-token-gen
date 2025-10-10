import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ProfileForm from './ProfileForm';

/**
 * ProfileEditorDialog Component
 *
 * Material-UI Dialog for creating or editing profiles.
 * Supports both create and edit modes.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Callback when dialog is closed
 * @param {Function} props.onSave - Callback when profile is saved
 * @param {Object} props.profile - Profile to edit (null for create mode)
 * @param {string} props.mode - 'create' or 'edit'
 */
function ProfileEditorDialog({ open, onClose, onSave, profile, mode = 'create' }) {
  const [formData, setFormData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (profile && mode === 'edit') {
      // Include the profile's payload when editing
      setFormData({
        ...profile,
        payload: profile.payload || {}
      });
    } else {
      // Initialize empty form for create mode
      setFormData({
        name: '',
        algorithm: 'HS256',
        key: '',
        payload: {},
        expirationPreset: '1h',
        customExpiration: null
      });
    }
    setHasChanges(false);
  }, [profile, mode, open]);

  const handleClose = () => {
    if (hasChanges) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmClose) return;
    }
    onClose();
  };

  const handleSave = () => {
    if (formData) {
      onSave(formData);
      setHasChanges(false);
    }
  };

  const handleFormChange = (updatedFormData) => {
    setFormData(updatedFormData);
    setHasChanges(true);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="profile-editor-dialog-title"
    >
      <DialogTitle id="profile-editor-dialog-title">
        {mode === 'create' ? 'Create New Profile' : 'Edit Profile'}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {formData && (
          <ProfileForm
            formData={formData}
            onChange={handleFormChange}
            mode={mode}
          />
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={mode === 'edit' && !hasChanges}
        >
          {mode === 'create' ? 'Create' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProfileEditorDialog;

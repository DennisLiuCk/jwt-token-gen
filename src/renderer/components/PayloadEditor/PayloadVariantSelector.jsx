import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  BookmarkBorder as VariantIcon
} from '@mui/icons-material';
import { useProfile } from '../../context/ProfileContext';

export default function PayloadVariantSelector({ currentPayload, onApplyVariant }) {
  const { selectedProfile, addPayloadVariant, updatePayloadVariant, deletePayloadVariant } = useProfile();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [variantName, setVariantName] = useState('');
  const [variantDescription, setVariantDescription] = useState('');

  const variants = selectedProfile?.payloadVariants || [];

  const handleApplyVariant = (variantId) => {
    const variant = variants.find(v => v.id === variantId);
    if (variant && onApplyVariant) {
      onApplyVariant(variant.payload);
    }
  };

  const handleSaveVariant = async () => {
    if (!variantName.trim()) {
      alert('Variant name is required');
      return;
    }

    if (!selectedProfile) {
      alert('No profile selected');
      return;
    }

    const variantData = {
      name: variantName.trim(),
      description: variantDescription.trim(),
      payload: currentPayload
    };

    if (editingVariant) {
      // Update existing variant
      await updatePayloadVariant(selectedProfile.id, editingVariant.id, variantData);
    } else {
      // Create new variant
      await addPayloadVariant(selectedProfile.id, variantData);
    }

    resetForm();
    setSaveDialogOpen(false);
  };

  const handleEditVariant = (variant) => {
    setEditingVariant(variant);
    setVariantName(variant.name);
    setVariantDescription(variant.description || '');
    setSaveDialogOpen(true);
  };

  const handleDeleteVariant = async (variantId) => {
    if (window.confirm('Are you sure you want to delete this variant?')) {
      await deletePayloadVariant(selectedProfile.id, variantId);
    }
  };

  const resetForm = () => {
    setEditingVariant(null);
    setVariantName('');
    setVariantDescription('');
  };

  const handleCloseSaveDialog = () => {
    resetForm();
    setSaveDialogOpen(false);
  };

  if (!selectedProfile) {
    return null;
  }

  return (
    <Box>
      {/* Variant Selector */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <FormControl fullWidth size="small">
          <InputLabel>Apply Payload Variant</InputLabel>
          <Select
            label="Apply Payload Variant"
            value=""
            onChange={(e) => handleApplyVariant(e.target.value)}
            displayEmpty
          >
            <MenuItem value="" disabled>
              {variants.length === 0 ? 'No variants saved' : 'Select a variant to apply'}
            </MenuItem>
            {variants.map((variant) => (
              <MenuItem key={variant.id} value={variant.id}>
                <Box sx={{ width: '100%' }}>
                  <Typography variant="subtitle2">{variant.name}</Typography>
                  {variant.description && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {variant.description}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<SaveIcon />}
          onClick={() => setSaveDialogOpen(true)}
          size="small"
          sx={{ whiteSpace: 'nowrap' }}
        >
          Save Variant
        </Button>

        {variants.length > 0 && (
          <IconButton
            size="small"
            onClick={() => setManageDialogOpen(true)}
            title="Manage variants"
          >
            <EditIcon />
          </IconButton>
        )}
      </Box>

      {/* Save/Edit Variant Dialog */}
      <Dialog open={saveDialogOpen} onClose={handleCloseSaveDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingVariant ? 'Edit Variant' : 'Save as Variant'}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Save the current payload configuration as a variant for this profile ({selectedProfile.name}).
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Variant Name"
            fullWidth
            value={variantName}
            onChange={(e) => setVariantName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            multiline
            rows={2}
            value={variantDescription}
            onChange={(e) => setVariantDescription(e.target.value)}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Variants: {variants.length}/10
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSaveDialog}>Cancel</Button>
          <Button onClick={handleSaveVariant} variant="contained">
            {editingVariant ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Variants Dialog */}
      <Dialog open={manageDialogOpen} onClose={() => setManageDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VariantIcon />
            Manage Payload Variants
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Profile: {selectedProfile.name}
          </Typography>
          {variants.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No variants saved for this profile yet.
            </Typography>
          ) : (
            <List>
              {variants.map((variant, index) => (
                <React.Fragment key={variant.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    secondaryAction={
                      <Box>
                        <IconButton
                          edge="end"
                          onClick={() => handleEditVariant(variant)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteVariant(variant.id)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={variant.name}
                      secondary={
                        <>
                          {variant.description && (
                            <Typography variant="caption" display="block">
                              {variant.description}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            Created: {new Date(variant.createdAt).toLocaleDateString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import { useProfileGroup } from '../../context/ProfileGroupContext';

export default function ProfileGroupManager({ open, onClose }) {
  const { groups, createGroup, updateGroup, deleteGroup } = useProfileGroup();
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#1976d2'
  });

  const handleCreateOrUpdate = async () => {
    if (!formData.name.trim()) {
      alert('Group name is required');
      return;
    }

    if (editingGroup) {
      // Update existing group
      const success = await updateGroup(editingGroup.id, formData);
      if (success) {
        resetForm();
      }
    } else {
      // Create new group
      const created = await createGroup(formData);
      if (created) {
        resetForm();
      }
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || '',
      color: group.color || '#1976d2'
    });
  };

  const handleDelete = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group? Profiles in this group will be moved to "Ungrouped".')) {
      await deleteGroup(groupId);
    }
  };

  const resetForm = () => {
    setEditingGroup(null);
    setFormData({
      name: '',
      description: '',
      color: '#1976d2'
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const predefinedColors = [
    '#1976d2', // Blue
    '#388e3c', // Green
    '#d32f2f', // Red
    '#f57c00', // Orange
    '#7b1fa2', // Purple
    '#0097a7', // Cyan
    '#c2185b', // Pink
    '#5d4037'  // Brown
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FolderIcon />
          Manage Profile Groups
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Create/Edit Form */}
        <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            {editingGroup ? 'Edit Group' : 'Create New Group'}
          </Typography>
          <TextField
            label="Group Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            size="small"
            sx={{ mt: 1, mb: 2 }}
            required
          />
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            size="small"
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />
          <Typography variant="caption" display="block" gutterBottom>
            Color
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {predefinedColors.map((color) => (
              <Box
                key={color}
                onClick={() => setFormData({ ...formData, color })}
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: color,
                  borderRadius: 1,
                  cursor: 'pointer',
                  border: formData.color === color ? '3px solid #000' : '1px solid #ccc',
                  '&:hover': {
                    transform: 'scale(1.1)'
                  }
                }}
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={editingGroup ? <EditIcon /> : <AddIcon />}
              onClick={handleCreateOrUpdate}
              size="small"
            >
              {editingGroup ? 'Update' : 'Create'}
            </Button>
            {editingGroup && (
              <Button onClick={resetForm} size="small">
                Cancel
              </Button>
            )}
          </Box>
        </Box>

        {/* Groups List */}
        <Typography variant="subtitle2" gutterBottom>
          Existing Groups ({groups.length}/20)
        </Typography>
        {groups.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No groups created yet. Create your first group above.
          </Typography>
        ) : (
          <List>
            {groups.map((group) => (
              <ListItem
                key={group.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  borderLeft: `4px solid ${group.color}`
                }}
                secondaryAction={
                  <Box>
                    <IconButton
                      edge="end"
                      onClick={() => handleEdit(group)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(group.id)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2">{group.name}</Typography>
                      <Chip
                        size="small"
                        label={`Order: ${group.order}`}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={group.description || 'No description'}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

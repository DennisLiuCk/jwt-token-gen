import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { usePayloadTemplate } from '../../context/PayloadTemplateContext';

/**
 * PayloadTemplateSelector Component
 *
 * Allows users to:
 * - Select and apply payload templates
 * - Save current payload as a new template
 * - Delete existing templates
 */
export default function PayloadTemplateSelector({ currentPayload, onApplyTemplate }) {
  const {
    templates,
    createTemplate,
    deleteTemplate,
    error,
    setError
  } = usePayloadTemplate();

  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');

  const handleApplyTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template && onApplyTemplate) {
      onApplyTemplate(template.payload);
      setSelectedTemplateId(''); // Reset selection after applying
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!newTemplateName.trim()) {
      setError('Template name is required');
      return;
    }

    const result = await createTemplate({
      name: newTemplateName.trim(),
      description: newTemplateDescription.trim(),
      payload: currentPayload
    });

    if (result) {
      setNewTemplateName('');
      setNewTemplateDescription('');
      setSaveDialogOpen(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      await deleteTemplate(templateId);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="template-selector-label" shrink={true}>Apply Template</InputLabel>
          <Select
            labelId="template-selector-label"
            value={selectedTemplateId}
            label="Apply Template"
            onChange={(e) => {
              const templateId = e.target.value;
              setSelectedTemplateId(templateId);
              if (templateId) {
                handleApplyTemplate(templateId);
              }
            }}
            displayEmpty
            notched
          >
            <MenuItem value="">
              <em>-- Select a template --</em>
            </MenuItem>
            {templates.map((template) => (
              <MenuItem key={template.id} value={template.id}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {template.name}
                    </Typography>
                    {template.description && (
                      <Typography variant="caption" color="text.secondary">
                        {template.description}
                      </Typography>
                    )}
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(template.id);
                    }}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<SaveIcon />}
          onClick={() => setSaveDialogOpen(true)}
          sx={{
            minWidth: 'auto',
            whiteSpace: 'nowrap',
            borderRadius: 1.5
          }}
        >
          Save as Template
        </Button>
      </Box>

      {error && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Save Template Dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Save Payload as Template</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Template Name"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="e.g., Admin User, Test Merchant"
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Description (optional)"
              value={newTemplateDescription}
              onChange={(e) => setNewTemplateDescription(e.target.value)}
              placeholder="Brief description of this template"
              multiline
              rows={2}
              fullWidth
            />
            <Divider />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Current payload preview:
              </Typography>
              <Box
                sx={{
                  bgcolor: 'grey.100',
                  p: 1.5,
                  borderRadius: 1,
                  maxHeight: 150,
                  overflow: 'auto',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace'
                }}
              >
                {JSON.stringify(currentPayload, null, 2)}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveAsTemplate}
            variant="contained"
            disabled={!newTemplateName.trim()}
          >
            Save Template
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

import React from 'react';
import {
  Paper,
  Tabs,
  Tab,
  Box,
  Alert
} from '@mui/material';
import FormMode from './FormMode';
import JsonMode from './JsonMode';

/**
 * PayloadEditor Component
 *
 * Provides dual-mode editing for JWT payload: Form mode and JSON mode.
 * Includes tabs for mode switching.
 */
export default function PayloadEditor({
  payloadObject,
  jsonString,
  mode,
  jsonError,
  onSwitchToForm,
  onSwitchToJson,
  onUpdateField,
  onAddCustomField,
  onRemoveField,
  onUpdateJsonString
}) {
  const [tabValue, setTabValue] = React.useState(mode === 'form' ? 0 : 1);

  React.useEffect(() => {
    setTabValue(mode === 'form' ? 0 : 1);
  }, [mode]);

  const handleTabChange = (event, newValue) => {
    if (newValue === 0 && mode === 'json') {
      // Switching from JSON to Form
      const success = onSwitchToForm();
      if (success) {
        setTabValue(0);
      }
      // If unsuccessful, tab won't change and error will be shown
    } else if (newValue === 1 && mode === 'form') {
      // Switching from Form to JSON
      onSwitchToJson();
      setTabValue(1);
    }
  };

  return (
    <Paper
      sx={{
        width: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="payload editor tabs"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.9375rem',
              minHeight: 48
            }
          }}
        >
          <Tab label="Form Mode" data-testid="form-mode-tab" />
          <Tab label="JSON Mode" data-testid="json-mode-tab" />
        </Tabs>
      </Box>

      {jsonError && mode === 'json' && (
        <Alert
          severity="error"
          sx={{
            m: 2,
            borderRadius: 1.5
          }}
        >
          {jsonError}
        </Alert>
      )}

      <Box sx={{ p: 3 }}>
        {mode === 'form' ? (
          <FormMode
            payload={payloadObject}
            onUpdateField={onUpdateField}
            onAddCustomField={onAddCustomField}
            onRemoveField={onRemoveField}
          />
        ) : (
          <JsonMode
            jsonString={jsonString}
            onUpdateJsonString={onUpdateJsonString}
            error={jsonError}
          />
        )}
      </Box>
    </Paper>
  );
}

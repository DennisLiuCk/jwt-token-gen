import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { AppProvider } from './context/AppContext';
import { ProfileProvider } from './context/ProfileContext';
import ProfileList from './components/ProfileList/ProfileList';
import AlgorithmSelector from './components/AlgorithmSelector/AlgorithmSelector';
import KeyInput from './components/KeyInput/KeyInput';
import ExpirationPicker from './components/ExpirationPicker/ExpirationPicker';
import TokenDisplay from './components/TokenDisplay/TokenDisplay';
import PayloadEditor from './components/PayloadEditor/PayloadEditor';
import TokenParser from './components/TokenParser/TokenParser';
import { useProfile } from './context/ProfileContext';
import { useClipboard } from './hooks/useClipboard';
import { usePayload } from './hooks/usePayload';
import { generateToken } from './services/jwtService';
import { validateKey } from './services/validationService';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#AB6B2E', // Claude's warm brown
      light: '#C78850',
      dark: '#8B5523',
    },
    secondary: {
      main: '#2D2D2D',
      light: '#4A4A4A',
      dark: '#1A1A1A',
    },
    background: {
      default: '#FAFAF8',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2D2D2D',
      secondary: '#666666',
    },
    divider: '#E8E8E6',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem',
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      letterSpacing: '-0.01em',
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    ...Array(19).fill('none'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '8px 16px',
          fontSize: '0.9375rem',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
          },
        },
      },
    },
  },
});

function AppContent() {
  const { selectedProfile } = useProfile();
  const { copyToClipboard, copied } = useClipboard();

  const [algorithm, setAlgorithm] = useState('HS256');
  const [key, setKey] = useState('');
  const [expiration, setExpiration] = useState('1h');
  const [customExpiration, setCustomExpiration] = useState(null);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isGenerating, setIsGenerating] = useState(false);

  // Payload editor hook
  const {
    payloadObject,
    jsonString,
    mode: payloadMode,
    jsonError,
    fieldTypes,
    switchToJsonMode,
    switchToFormMode,
    updateField,
    updateFieldType,
    addCustomField,
    removeField,
    updateJsonString,
    resetPayload,
    getCurrentPayload,
    autoConvertNumericStrings
  } = usePayload({});

  // Update form when profile changes
  React.useEffect(() => {
    if (selectedProfile) {
      setAlgorithm(selectedProfile.algorithm);
      setExpiration(selectedProfile.expirationPreset || '1h');
      setCustomExpiration(selectedProfile.customExpiration || null);

      // Load and decrypt the signing key if saved with profile
      const loadKey = async () => {
        if (selectedProfile.encryptedKey) {
          try {
            const result = await window.electronAPI.decryptKey(selectedProfile.encryptedKey);
            if (result.success) {
              setKey(result.data);
            } else {
              console.error('Failed to decrypt key:', result.error);
              setKey('');
              setError('Failed to load saved key. Please enter it manually.');
            }
          } catch (err) {
            console.error('Error decrypting key:', err);
            setKey('');
            setError('Error loading saved key. Please enter it manually.');
          }
        } else {
          setKey('');
        }
      };
      loadKey();

      // Load profile payload
      resetPayload(selectedProfile.payload || {});

      // Auto-convert numeric strings in loaded profile (migration logic)
      setTimeout(() => {
        autoConvertNumericStrings();
      }, 100);
    }
  }, [selectedProfile]); // FIXED: Only depend on selectedProfile, not the functions

  // Keyboard shortcuts (T109)
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+G: Generate Token
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        if (selectedProfile && key) {
          handleGenerateToken();
        }
      }

      // Ctrl+C: Copy Token (when token is displayed)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && generatedToken) {
        // Let default copy work if text is selected
        if (!window.getSelection()?.toString()) {
          e.preventDefault();
          handleCopyToken(generatedToken.raw);
        }
      }

      // Ctrl+S: Save Profile (prevent browser save dialog)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Could be extended to save current profile changes
        setSnackbarOpen(false);
        setTimeout(() => {
          setError('Save profile functionality can be accessed via Edit Profile button');
        }, 100);
      }

      // Escape: Close dialogs (handled by MUI Dialog components)
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProfile, key, generatedToken]);

  // Handle algorithm change - clear key and show format hint
  const handleAlgorithmChange = (newAlgorithm) => {
    setAlgorithm(newAlgorithm);
    setKey(''); // Clear key when algorithm changes (T064)
    setGeneratedToken(null); // Clear any generated token
  };

  const handleGenerateToken = async () => {
    try {
      setError(null);
      setIsGenerating(true); // Show loading state (T108)

      // Validation
      if (!selectedProfile) {
        throw new Error('Please select a profile');
      }

      if (!key) {
        throw new Error('Please enter a signing key');
      }

      // Validate key format
      const keyValidation = validateKey(key, algorithm);
      if (!keyValidation.valid) {
        throw new Error(keyValidation.error);
      }

      // Get payload from payload editor
      const payload = getCurrentPayload();
      if (!payload) {
        throw new Error('Invalid payload. Please fix JSON syntax errors.');
      }

      // Use custom expiration if set, otherwise use preset
      const expirationValue = expiration === 'custom' && customExpiration
        ? customExpiration
        : expiration;

      // Generate token
      const token = generateToken(algorithm, key, payload, expirationValue);
      setGeneratedToken(token);

      // Show success notification (T110)
      showNotification('Token generated successfully!', 'success');

    } catch (err) {
      setError(err.message);
      showNotification(err.message, 'error');
      // Token generation error handled and displayed to user
    } finally {
      setIsGenerating(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCopyToken = async (tokenText) => {
    const success = await copyToClipboard(tokenText);
    if (success) {
      showNotification('Token copied to clipboard!', 'success');
    } else {
      showNotification('Failed to copy token', 'error');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        {/* Header */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              color: 'text.primary',
              fontWeight: 600,
              mb: 1,
              fontSize: '2rem'
            }}
          >
            JWT Token Generator
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: '1rem' }}
          >
            Generate and manage JWT tokens with ease
          </Typography>
        </Box>

        {/* Main Content */}
        <Box>
          {/* Profile Selector */}
          <ProfileList compact={true} />

          {/* Configuration Panel */}
          <Paper
            sx={{
              p: 4,
              mb: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              boxShadow: 2
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                mb: 3,
                pb: 2,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              Token Configuration
            </Typography>

            {!selectedProfile && (
              <Alert
                severity="info"
                sx={{
                  mb: 3,
                  borderRadius: 1.5,
                  '& .MuiAlert-icon': {
                    color: 'primary.main'
                  }
                }}
              >
                Select a profile to get started
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <AlgorithmSelector
                  value={algorithm}
                  onChange={handleAlgorithmChange}
                  disabled={!selectedProfile}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <ExpirationPicker
                  value={expiration}
                  onChange={setExpiration}
                  customTimestamp={customExpiration}
                  onCustomTimestampChange={setCustomExpiration}
                  disabled={!selectedProfile}
                />
              </Grid>

              <Grid item xs={12}>
                <KeyInput
                  algorithm={algorithm}
                  value={key}
                  onChange={setKey}
                  disabled={!selectedProfile}
                />
              </Grid>

              {selectedProfile && (
                <Grid item xs={12}>
                  <PayloadEditor
                    payloadObject={payloadObject}
                    jsonString={jsonString}
                    mode={payloadMode}
                    jsonError={jsonError}
                    fieldTypes={fieldTypes}
                    onSwitchToForm={switchToFormMode}
                    onSwitchToJson={switchToJsonMode}
                    onUpdateField={updateField}
                    onUpdateFieldType={updateFieldType}
                    onAddCustomField={addCustomField}
                    onRemoveField={removeField}
                    onUpdateJsonString={updateJsonString}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleGenerateToken}
                  disabled={!selectedProfile || !key || isGenerating}
                  data-testid="generate-button"
                  startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : null}
                  sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    mt: 2
                  }}
                >
                  {isGenerating ? 'Generating...' : 'Generate Token'}
                </Button>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    mt: 1.5,
                    display: 'block',
                    textAlign: 'center',
                    fontSize: '0.8125rem'
                  }}
                >
                  Keyboard shortcut: <Box component="kbd" sx={{
                    px: 0.75,
                    py: 0.25,
                    bgcolor: 'grey.100',
                    borderRadius: 0.5,
                    fontSize: '0.75rem',
                    fontFamily: 'monospace'
                  }}>Ctrl+G</Box>
                </Typography>
              </Grid>

              {error && (
                <Grid item xs={12}>
                  <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Token Display */}
          <TokenDisplay
            token={generatedToken}
            onCopy={handleCopyToken}
          />

          {/* Token Parser */}
          <TokenParser />
        </Box>

      {/* Snackbar for Notifications (T110) */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      </Container>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <ProfileProvider>
          <AppContent />
        </ProfileProvider>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;

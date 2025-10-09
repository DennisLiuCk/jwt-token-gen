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
  Snackbar
} from '@mui/material';
import { AppProvider } from './context/AppContext';
import { ProfileProvider } from './context/ProfileContext';
import ProfileList from './components/ProfileList/ProfileList';
import AlgorithmSelector from './components/AlgorithmSelector/AlgorithmSelector';
import KeyInput from './components/KeyInput/KeyInput';
import ExpirationPicker from './components/ExpirationPicker/ExpirationPicker';
import TokenDisplay from './components/TokenDisplay/TokenDisplay';
import { useProfile } from './context/ProfileContext';
import { useClipboard } from './hooks/useClipboard';
import { generateToken } from './services/jwtService';
import { validateKey } from './services/validationService';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function AppContent() {
  const { selectedProfile } = useProfile();
  const { copyToClipboard, copied } = useClipboard();

  const [algorithm, setAlgorithm] = useState('HS256');
  const [key, setKey] = useState('');
  const [expiration, setExpiration] = useState('1h');
  const [generatedToken, setGeneratedToken] = useState(null);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Update form when profile changes
  React.useEffect(() => {
    if (selectedProfile) {
      setAlgorithm(selectedProfile.algorithm);
      setExpiration(selectedProfile.expirationPreset || '1h');
      // Note: We don't set the key from profile as it's encrypted
      // User must enter it each time for security
    }
  }, [selectedProfile]);

  const handleGenerateToken = async () => {
    try {
      setError(null);

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

      // Get payload from selected profile
      const payload = selectedProfile.payload || {};

      // Generate token
      const token = generateToken(algorithm, key, payload, expiration);
      setGeneratedToken(token);

    } catch (err) {
      setError(err.message);
      console.error('Token generation error:', err);
    }
  };

  const handleCopyToken = async (tokenText) => {
    const success = await copyToClipboard(tokenText);
    if (success) {
      setSnackbarOpen(true);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          JWT Token Generator
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Generate and manage JWT tokens with ease
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Sidebar - Profile List */}
        <Grid item xs={12} md={3}>
          <ProfileList />
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          {/* Configuration Panel */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Token Configuration
            </Typography>

            {!selectedProfile && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Select a profile to get started
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <AlgorithmSelector
                  value={algorithm}
                  onChange={setAlgorithm}
                  disabled={!selectedProfile}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <ExpirationPicker
                  value={expiration}
                  onChange={setExpiration}
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
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Payload Preview (from profile: {selectedProfile.name})
                    </Typography>
                    <pre style={{ margin: 0, fontSize: '0.875rem', overflow: 'auto' }}>
                      {JSON.stringify(selectedProfile.payload, null, 2)}
                    </pre>
                  </Paper>
                </Grid>
              )}

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleGenerateToken}
                  disabled={!selectedProfile || !key}
                  data-testid="generate-button"
                >
                  Generate Token
                </Button>
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
        </Grid>
      </Grid>

      {/* Snackbar for Copy Feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message="Token copied to clipboard!"
      />
    </Container>
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

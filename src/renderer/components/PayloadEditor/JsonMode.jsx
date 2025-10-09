import React, { useEffect, useRef } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import Editor from '@monaco-editor/react';

/**
 * JsonMode Component
 *
 * Monaco Editor integration for JSON payload editing.
 * Provides syntax highlighting, validation, and formatting.
 */
export default function JsonMode({ jsonString, onUpdateJsonString, error }) {
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Configure JSON validation
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [],
      enableSchemaRequest: false
    });
  };

  const handleEditorChange = (value) => {
    if (value !== undefined) {
      onUpdateJsonString(value);
    }
  };

  const formatJson = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
    }
  };

  useEffect(() => {
    // Auto-format on mount
    const timer = setTimeout(() => {
      formatJson();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Edit the JSON payload directly. Use Shift+Alt+F to format.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          border: 1,
          borderColor: error ? 'error.main' : 'divider',
          borderRadius: 1,
          overflow: 'hidden'
        }}
      >
        <Editor
          height="400px"
          language="json"
          theme="vs-light"
          value={jsonString}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            lineNumbers: 'on',
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            wrappingIndent: 'indent',
            tabSize: 2,
            insertSpaces: true,
            fontSize: 14,
            fontFamily: 'Consolas, Monaco, "Courier New", monospace'
          }}
        />
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Maximum payload size: 64KB
      </Typography>
    </Box>
  );
}

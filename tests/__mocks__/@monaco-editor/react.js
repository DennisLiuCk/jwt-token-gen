/**
 * Mock for @monaco-editor/react
 * Provides mock implementation of Monaco Editor component
 */

import React from 'react';

/**
 * Mock Monaco Editor component
 */
export const Editor = React.forwardRef(function Editor(props, ref) {
  const { value, onChange, onMount, language, theme, ...rest } = props;

  React.useEffect(() => {
    if (onMount) {
      const mockEditor = {
        getValue: () => value || '',
        setValue: (newValue) => onChange?.(newValue),
        getModel: () => ({
          updateOptions: jest.fn(),
          onDidChangeContent: jest.fn(),
        }),
        updateOptions: jest.fn(),
        layout: jest.fn(),
        focus: jest.fn(),
      };

      const mockMonaco = {
        editor: {
          defineTheme: jest.fn(),
          setTheme: jest.fn(),
        },
        languages: {
          json: {
            jsonDefaults: {
              setDiagnosticsOptions: jest.fn(),
            },
          },
        },
      };

      onMount(mockEditor, mockMonaco);
    }
  }, [onMount]);

  return (
    <textarea
      data-testid="monaco-editor"
      data-language={language}
      data-theme={theme}
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      ref={ref}
      {...rest}
    />
  );
});

/**
 * Mock DiffEditor component
 */
export const DiffEditor = React.forwardRef(function DiffEditor(props, ref) {
  const { original, modified, language } = props;

  return (
    <div data-testid="monaco-diff-editor" data-language={language} ref={ref}>
      <div data-testid="original">{original}</div>
      <div data-testid="modified">{modified}</div>
    </div>
  );
});

/**
 * Mock useMonaco hook
 */
export function useMonaco() {
  return {
    editor: {
      defineTheme: jest.fn(),
      setTheme: jest.fn(),
    },
    languages: {
      register: jest.fn(),
      setMonarchTokensProvider: jest.fn(),
    },
  };
}

export default Editor;

/**
 * Regression Tests for fix/initialization-and-ui-issues
 *
 * These tests verify fixes and prevent regressions of the issues:
 * 1. TDZ error in App.jsx (showNotification before useEffect)
 * 2. Text overlap in PayloadTemplateSelector
 */

const fs = require('fs');
const path = require('path');

describe('Regression Test - App.jsx TDZ Error', () => {
  const appSource = fs.readFileSync(
    path.join(__dirname, '../../src/renderer/App.jsx'),
    'utf-8'
  );

  test('showNotification should use useCallback', () => {
    // Verify showNotification is defined with useCallback
    expect(appSource).toMatch(/const showNotification = useCallback/);
  });

  test('showNotification should be defined before useEffect hooks', () => {
    // Find the position of showNotification definition
    const showNotificationMatch = appSource.match(/const showNotification = useCallback/);
    expect(showNotificationMatch).toBeTruthy();

    const showNotificationIndex = appSource.indexOf(showNotificationMatch[0]);

    // Find the first useEffect
    const firstUseEffectMatch = appSource.match(/React\.useEffect\(/);
    expect(firstUseEffectMatch).toBeTruthy();

    const firstUseEffectIndex = appSource.indexOf(firstUseEffectMatch[0]);

    // showNotification must be defined BEFORE first useEffect
    expect(showNotificationIndex).toBeLessThan(firstUseEffectIndex);
  });

  test('showNotification should have empty dependency array', () => {
    // Find the useCallback for showNotification
    const callbackMatch = appSource.match(
      /const showNotification = useCallback\([\s\S]*?\},\s*\[(.*?)\]/
    );

    expect(callbackMatch).toBeTruthy();

    // Extract dependencies
    const deps = callbackMatch[1].trim();

    // Should have empty dependency array for stable reference
    expect(deps).toBe('');
  });

  test('useCallback should be imported from React', () => {
    // Verify useCallback is imported
    expect(appSource).toMatch(/import React, \{[^}]*useCallback[^}]*\} from 'react'/);
  });

  test('keyboard shortcuts useEffect should include showNotification in deps', () => {
    // Find the keyboard shortcuts useEffect (has keydown listener)
    const keyboardEffectMatch = appSource.match(
      /React\.useEffect\(\(\) => \{[\s\S]*?window\.addEventListener\('keydown'[\s\S]*?\}, \[(.*?)\]\)/
    );

    expect(keyboardEffectMatch).toBeTruthy();

    const deps = keyboardEffectMatch[1];

    // showNotification should be in the dependency array
    expect(deps).toContain('showNotification');
  });
});

describe('Regression Test - PayloadTemplateSelector Text Overlap', () => {
  const selectorSource = fs.readFileSync(
    path.join(__dirname, '../../src/renderer/components/PayloadEditor/PayloadTemplateSelector.jsx'),
    'utf-8'
  );

  test('InputLabel should have shrink={true} prop', () => {
    // Verify InputLabel has shrink={true}
    expect(selectorSource).toMatch(/<InputLabel[^>]*shrink=\{true\}[^>]*>/);
  });

  test('Select should have notched prop', () => {
    // Verify Select has notched prop (can be on separate line)
    expect(selectorSource).toMatch(/notched/);
  });

  test('InputLabel should have correct id for accessibility', () => {
    // Verify InputLabel has proper id
    expect(selectorSource).toMatch(/<InputLabel[^>]*id="template-selector-label"[^>]*>/);
  });

  test('Select should reference InputLabel via labelId', () => {
    // Verify Select has labelId prop
    expect(selectorSource).toMatch(/<Select[^>]*labelId="template-selector-label"[^>]*>/);
  });

  test('FormControl should use size="small"', () => {
    // Verify FormControl uses small size
    expect(selectorSource).toMatch(/<FormControl[^>]*size="small"[^>]*>/);
  });

  test('Select should have displayEmpty prop', () => {
    // Verify Select has displayEmpty for placeholder (can be on separate line)
    expect(selectorSource).toMatch(/displayEmpty/);
  });

  test('placeholder text should be present', () => {
    // Verify placeholder text exists
    expect(selectorSource).toContain('-- Select a template --');
  });
});

describe('Code Quality - TDZ Prevention', () => {
  test('all useCallback should be defined before useEffect in App.jsx', () => {
    const appSource = fs.readFileSync(
      path.join(__dirname, '../../src/renderer/App.jsx'),
      'utf-8'
    );

    // Find all useCallback definitions
    const useCallbackMatches = Array.from(
      appSource.matchAll(/const \w+ = useCallback/g)
    );

    // Find all useEffect calls
    const useEffectMatches = Array.from(
      appSource.matchAll(/React\.useEffect\(/g)
    );

    if (useCallbackMatches.length > 0 && useEffectMatches.length > 0) {
      const lastCallbackIndex = Math.max(
        ...useCallbackMatches.map(m => m.index)
      );
      const firstEffectIndex = Math.min(
        ...useEffectMatches.map(m => m.index)
      );

      // All useCallbacks should be defined before first useEffect
      expect(lastCallbackIndex).toBeLessThan(firstEffectIndex);
    }
  });
});

describe('Material-UI Best Practices', () => {
  test('InputLabel with Select should use shrink for displayEmpty', () => {
    const selectorSource = fs.readFileSync(
      path.join(__dirname, '../../src/renderer/components/PayloadEditor/PayloadTemplateSelector.jsx'),
      'utf-8'
    );

    // When using displayEmpty, InputLabel should have shrink
    const hasDisplayEmpty = selectorSource.includes('displayEmpty');
    const hasShrink = selectorSource.includes('shrink={true}');

    if (hasDisplayEmpty) {
      expect(hasShrink).toBe(true);
    }
  });
});

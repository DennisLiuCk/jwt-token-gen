# Testing Documentation

## Overview

This document describes the test architecture for the JWT Token Generator project. The test suite is built using **Jest** and **React Testing Library** to ensure comprehensive coverage and maintainable tests.

## Test Architecture

### Directory Structure

```
tests/
├── unit/                      # Unit tests
│   ├── components/           # Component tests
│   │   ├── AlgorithmSelector.test.js
│   │   └── TokenDisplay.test.js
│   ├── services/             # Service tests
│   │   ├── jwtService.test.js
│   │   └── validationService.test.js
│   ├── hooks/                # Custom hook tests
│   │   ├── useClipboard.test.js
│   │   └── usePayload.test.js
│   ├── utils/                # Utility function tests
│   └── contexts/             # Context provider tests
├── integration/              # Integration tests
├── helpers/                  # Test utilities
│   ├── test-utils.js        # Custom render & helpers
│   ├── fixtures.js          # Test data fixtures
│   └── mock-factories.js    # Mock data generators
├── __mocks__/               # Module mocks
│   ├── @monaco-editor/      # Monaco editor mock
│   ├── electron-store.js    # Electron store mock
│   ├── jsonwebtoken.js      # JWT library mock
│   ├── styleMock.js         # CSS mock
│   └── fileMock.js          # File/image mock
├── setup.js                 # Test environment setup
└── README.md               # This file
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with coverage in watch mode
npm run test:coverage:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests with verbose output
npm run test:verbose

# Run tests in CI mode
npm run test:ci

# Clear Jest cache
npm run test:clear

# Debug tests
npm run test:debug
```

### Coverage Requirements

The project enforces the following minimum coverage thresholds:

- **Statements**: 60%
- **Branches**: 50%
- **Functions**: 50%
- **Lines**: 60%

Coverage reports are generated in `coverage/` directory with:
- HTML report: `coverage/index.html`
- LCOV report: `coverage/lcov.info`
- JSON report: `coverage/coverage-final.json`

## Writing Tests

### Test Utilities

#### `renderWithProviders`

Renders a component with all necessary context providers:

```javascript
import { renderWithProviders } from '../../helpers/test-utils';
import MyComponent from '../../../src/renderer/components/MyComponent';

test('should render component', () => {
  const { getByText } = renderWithProviders(<MyComponent />);
  expect(getByText('Hello')).toBeInTheDocument();
});
```

#### `renderWithTheme`

Renders a component with only the theme provider (for components that don't need context):

```javascript
import { renderWithTheme } from '../../helpers/test-utils';

test('should render with theme', () => {
  const { getByRole } = renderWithTheme(<Button>Click me</Button>);
  expect(getByRole('button')).toBeInTheDocument();
});
```

### Fixtures and Mocks

#### Using Fixtures

Pre-defined test data for consistent testing:

```javascript
import { mockProfiles, mockPayloads, mockTokens } from '../../helpers/fixtures';

test('should process profile', () => {
  const profile = mockProfiles.hs256Profile;
  expect(profile.algorithm).toBe('HS256');
});
```

#### Using Mock Factories

Generate custom test data on the fly:

```javascript
import {
  createMockProfile,
  createMockPayload,
  createMockToken,
} from '../../helpers/mock-factories';

test('should create custom profile', () => {
  const profile = createMockProfile({
    name: 'Custom Profile',
    algorithm: 'RS256',
  });

  expect(profile.name).toBe('Custom Profile');
  expect(profile.algorithm).toBe('RS256');
});
```

### Testing Patterns

#### Component Testing

```javascript
import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithTheme } from '../../helpers/test-utils';
import MyComponent from '../../../src/renderer/components/MyComponent';

describe('MyComponent', () => {
  test('should render correctly', () => {
    renderWithTheme(<MyComponent />);
    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  test('should handle user interaction', () => {
    const mockOnClick = jest.fn();
    renderWithTheme(<MyComponent onClick={mockOnClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
```

#### Service Testing

```javascript
import { myService } from '../../../src/renderer/services/myService';

describe('myService', () => {
  test('should process data correctly', () => {
    const result = myService.process('input');
    expect(result).toBe('expected output');
  });

  test('should handle errors', () => {
    expect(() => {
      myService.process(null);
    }).toThrow('Invalid input');
  });
});
```

#### Hook Testing

```javascript
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '../../../src/renderer/hooks/useMyHook';

describe('useMyHook', () => {
  test('should initialize with default value', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe(0);
  });

  test('should update value', () => {
    const { result } = renderHook(() => useMyHook());

    act(() => {
      result.current.increment();
    });

    expect(result.current.value).toBe(1);
  });
});
```

#### Context Testing

```javascript
import React from 'react';
import { renderHook } from '@testing-library/react';
import { MyProvider, useMyContext } from '../../../src/renderer/context/MyContext';

describe('MyContext', () => {
  test('should provide context values', () => {
    const wrapper = ({ children }) => (
      <MyProvider>{children}</MyProvider>
    );

    const { result } = renderHook(() => useMyContext(), { wrapper });

    expect(result.current.value).toBeDefined();
  });
});
```

## Mock Implementations

### Electron API Mock

The `window.electronAPI` is automatically mocked in `tests/setup.js`:

```javascript
// Automatically available in all tests
window.electronAPI.getProfiles();
window.electronAPI.saveProfile(profile);
// etc.
```

### Monaco Editor Mock

Monaco Editor is mocked to render as a simple textarea for testing:

```javascript
import Editor from '@monaco-editor/react';

// In tests, this renders as:
<textarea data-testid="monaco-editor" />
```

### JWT Library Mock

The `jsonwebtoken` library is mocked for consistent testing:

```javascript
import jwt from 'jsonwebtoken';

// Works in tests without real crypto
const token = jwt.sign(payload, secret);
const decoded = jwt.decode(token);
```

## Best Practices

### 1. Test Organization

- Group related tests using `describe` blocks
- Use clear, descriptive test names
- Follow AAA pattern: Arrange, Act, Assert

```javascript
describe('Component Feature', () => {
  test('should do something when condition is met', () => {
    // Arrange
    const props = { value: 'test' };

    // Act
    renderWithTheme(<Component {...props} />);

    // Assert
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});
```

### 2. Cleanup

- Jest automatically clears mocks between tests (configured in `jest.config.js`)
- Use `beforeEach` and `afterEach` for test-specific setup/cleanup
- Restore mocks after tests

```javascript
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  // Additional cleanup if needed
});
```

### 3. Async Testing

Always use `async/await` or `waitFor` for async operations:

```javascript
import { waitFor } from '@testing-library/react';

test('should load data', async () => {
  renderWithTheme(<Component />);

  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

### 4. Accessibility

Test for accessibility:

```javascript
test('should be accessible', () => {
  renderWithTheme(<Component />);

  const button = screen.getByRole('button');
  expect(button).toHaveAccessibleName();
});
```

### 5. Coverage Goals

- Aim for high coverage, but focus on meaningful tests
- Test edge cases and error conditions
- Don't test implementation details
- Test user interactions and behavior

## Common Patterns

### Testing Form Inputs

```javascript
test('should update input value', () => {
  renderWithTheme(<Form />);

  const input = screen.getByLabelText('Name');
  fireEvent.change(input, { target: { value: 'John' } });

  expect(input).toHaveValue('John');
});
```

### Testing API Calls

```javascript
test('should call API', async () => {
  const mockFn = jest.fn().mockResolvedValue({ data: 'result' });
  window.electronAPI.getProfiles = mockFn;

  renderWithTheme(<Component />);

  await waitFor(() => {
    expect(mockFn).toHaveBeenCalled();
  });
});
```

### Testing Error States

```javascript
test('should display error message', async () => {
  const mockFn = jest.fn().mockRejectedValue(new Error('Failed'));
  window.electronAPI.getProfiles = mockFn;

  renderWithTheme(<Component />);

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Increase timeout in `jest.config.js` or use `jest.setTimeout()`
   - Check for unresolved promises

2. **Mock not working**
   - Ensure mock is in `__mocks__` directory
   - Use `jest.mock()` if needed
   - Check mock path matches module path

3. **Coverage not collected**
   - Check `collectCoverageFrom` patterns in `jest.config.js`
   - Ensure files are not in ignore patterns

4. **Tests failing in CI but passing locally**
   - Use `npm run test:ci` to simulate CI environment
   - Check for timing issues
   - Ensure all dependencies are installed

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Next Steps

To expand test coverage, add tests for:

1. **Components** (20+ components to test)
   - All PayloadEditor components
   - ProfileList and ProfileEditor
   - ExpirationPicker
   - KeyInput
   - etc.

2. **Services**
   - ipcService
   - Complete validationService tests

3. **Hooks**
   - useProfiles

4. **Utils**
   - format.js
   - validation.js

5. **Contexts**
   - All context providers

6. **Integration Tests**
   - Complete user workflows
   - Component interactions
   - Form submissions

Start by copying the example tests and adapting them to each component/service/hook!

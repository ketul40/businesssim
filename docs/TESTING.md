# Testing Guide

## Overview

SkillLoops uses a comprehensive testing strategy combining unit tests, integration tests, and property-based tests to ensure code quality and correctness.

## Testing Stack

- **Vitest**: Fast unit test framework
- **React Testing Library**: Component testing utilities
- **fast-check**: Property-based testing library
- **jsdom**: Browser environment simulation

## Running Tests

### Basic Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with interactive UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Running Specific Tests

```bash
# Run tests matching a pattern
npm test -- useSimulation

# Run tests in a specific file
npm test -- src/hooks/useSimulation.test.ts

# Run only integration tests
npm test -- integration
```

## Test Types

### 1. Unit Tests

Unit tests verify individual components, hooks, and functions in isolation.

**Location**: Co-located with source files (e.g., `Component.test.tsx`)

**Example**:
```typescript
import { render, screen } from '@testing-library/react';
import { AuthScreen } from './AuthScreen';

describe('AuthScreen', () => {
  it('renders sign in form', () => {
    render(<AuthScreen />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});
```

### 2. Integration Tests

Integration tests verify complete user flows across multiple components.

**Location**: `src/test/integration/`

**Example**:
```typescript
describe('Authentication Flow', () => {
  it('allows user to sign up and sign in', async () => {
    // Test complete authentication flow
  });
});
```

### 3. Property-Based Tests

Property-based tests verify universal properties across many randomly generated inputs.

**Location**: `*.property.test.ts` files

**Example**:
```typescript
import fc from 'fast-check';

/**
 * Feature: app-optimization, Property 3: Stable callback references
 * Validates: Requirements 1.4
 */
test('callbacks maintain stable references when dependencies unchanged', () => {
  fc.assert(
    fc.property(
      fc.array(fc.string()),
      (items) => {
        // Test property with generated data
      }
    ),
    { numRuns: 100 }
  );
});
```

## Writing Tests

### Component Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('MyComponent', () => {
  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.getByText('Success')).toBeInTheDocument();
  });
});
```

### Hook Tests

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useMyHook } from './useMyHook';

describe('useMyHook', () => {
  it('returns expected value', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe('expected');
  });
});
```

### Mocking Firebase

```typescript
import { vi } from 'vitest';

vi.mock('../firebase/config', () => ({
  db: {},
  auth: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  // ... other mocks
}));
```

## Property-Based Testing

### What is Property-Based Testing?

Property-based testing verifies that certain properties hold true across many randomly generated inputs, rather than testing specific examples.

### Benefits

- **Finds edge cases**: Discovers bugs you didn't think to test
- **Comprehensive coverage**: Tests hundreds of inputs automatically
- **Specification as code**: Properties document expected behavior

### Writing Property Tests

1. **Identify the property**: What should always be true?
2. **Choose generators**: What types of inputs to test?
3. **Write the assertion**: Verify the property holds

**Example**:
```typescript
import fc from 'fast-check';

test('debounce delays value updates', () => {
  fc.assert(
    fc.property(
      fc.string(),
      fc.integer({ min: 100, max: 1000 }),
      (value, delay) => {
        // Property: debounced value should not update immediately
        const { result } = renderHook(() => useDebounce(value, delay));
        expect(result.current).not.toBe(value);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Common Generators

```typescript
// Primitives
fc.string()
fc.integer()
fc.boolean()
fc.float()

// Arrays and objects
fc.array(fc.string())
fc.record({ name: fc.string(), age: fc.integer() })

// Custom generators
fc.string().filter(s => s.length > 0) // Non-empty strings
fc.integer({ min: 0, max: 100 })      // Range
```

## Test Coverage

### Coverage Goals

- **Unit Test Coverage**: 80% of code lines
- **Property Test Coverage**: All 21 correctness properties
- **Integration Test Coverage**: All 5 critical user flows

### Viewing Coverage

```bash
npm run test:coverage
```

Coverage report will be generated in `coverage/` directory. Open `coverage/index.html` in a browser to view detailed coverage.

### Coverage Exclusions

The following are excluded from coverage:
- `node_modules/`
- Test files (`*.test.ts`, `*.test.tsx`)
- Test utilities (`src/test/`)

## Best Practices

### DO

✅ Test behavior, not implementation
✅ Use descriptive test names
✅ Keep tests focused and simple
✅ Mock external dependencies
✅ Test error cases
✅ Use property tests for universal properties

### DON'T

❌ Test internal implementation details
❌ Write tests that depend on other tests
❌ Use real Firebase in tests
❌ Test third-party libraries
❌ Ignore failing tests

## Continuous Integration

Tests run automatically on every commit via CI/CD:

- All tests must pass before merging
- Coverage reports are generated
- Property tests run with 100 iterations

## Troubleshooting

### Tests Timeout

Increase timeout in test file:
```typescript
test('slow test', async () => {
  // test code
}, 10000); // 10 second timeout
```

### Mock Not Working

Ensure mocks are defined before imports:
```typescript
vi.mock('./module', () => ({
  // mock implementation
}));

import { Component } from './Component'; // Import after mock
```

### Property Test Fails

1. Check the failing example in the error message
2. Verify generators produce valid inputs
3. Ensure property is correctly specified
4. Add constraints to generators if needed

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [fast-check Documentation](https://fast-check.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

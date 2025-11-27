# Quick Reference Guide

## Common Commands

### Development
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run type-check       # Check TypeScript types
```

### Testing
```bash
npm test                 # Run all tests once
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report
```

### Specific Tests
```bash
npm test -- useSimulation           # Run tests matching pattern
npm test -- src/hooks/              # Run all hook tests
npm test -- integration             # Run integration tests
npm test -- property                # Run property-based tests
```

## Project Structure

```
src/
├── components/          # React components (.tsx)
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── firebase/           # Firebase integration
├── constants/          # App constants
└── test/               # Test utilities and integration tests

docs/                   # Documentation
├── TESTING.md          # Testing guide
├── HOOKS.md            # Custom hooks API
├── ARCHITECTURE.md     # Architecture decisions
└── TYPESCRIPT_SETUP.md # TypeScript guide
```

## Custom Hooks Quick Reference

### useSimulation
```typescript
const { messages, turnCount, isLoading, sendMessage, exitSimulation } = 
  useSimulation({ scenario, sessionId, onEvaluationComplete });
```

### useFirestore
```typescript
const { data, loading, error, refetch } = 
  useFirestore({ collectionName: 'users', queryConstraints: [...] });
```

### useDebounce
```typescript
const debouncedValue = useDebounce(value, 500);
```

### useLocalStorage
```typescript
const [value, setValue] = useLocalStorage('key', initialValue);
```

### useOnlineStatus
```typescript
const isOnline = useOnlineStatus();
```

## TypeScript Patterns

### Component Props
```typescript
interface MyComponentProps {
  title: string;
  count: number;
  onUpdate?: (value: number) => void;
}

export function MyComponent({ title, count, onUpdate }: MyComponentProps) {
  // ...
}
```

### Event Handlers
```typescript
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => { };
const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => { };
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => { };
```

### Async Functions
```typescript
async function fetchData(id: string): Promise<Data> {
  const response = await fetch(`/api/data/${id}`);
  return response.json();
}
```

## Testing Patterns

### Component Test
```typescript
import { render, screen } from '@testing-library/react';

test('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### Hook Test
```typescript
import { renderHook } from '@testing-library/react';

test('hook returns value', () => {
  const { result } = renderHook(() => useMyHook());
  expect(result.current.value).toBe('expected');
});
```

### Property Test
```typescript
import fc from 'fast-check';

test('property holds for all inputs', () => {
  fc.assert(
    fc.property(fc.string(), (input) => {
      // Test property
    }),
    { numRuns: 100 }
  );
});
```

## Firebase Patterns

### Query with Limit
```typescript
import { collection, query, where, orderBy, limit } from 'firebase/firestore';

const q = query(
  collection(db, 'sessions'),
  where('userId', '==', userId),
  orderBy('startedAt', 'desc'),
  limit(10)
);
```

### Listener Cleanup
```typescript
useEffect(() => {
  const unsubscribe = onSnapshot(docRef, (snapshot) => {
    setData(snapshot.data());
  });
  
  return () => unsubscribe(); // Cleanup
}, [docRef]);
```

## Error Handling

### API Errors
```typescript
import { handleApiError, retryWithBackoff } from '../utils/errorHandling';

try {
  const data = await retryWithBackoff(() => fetchData(id));
} catch (error) {
  const apiError = handleApiError(error);
  showError(apiError.userMessage);
}
```

### Error Boundary
```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <MyComponent />
</ErrorBoundary>
```

## Performance Optimization

### Memoization
```typescript
// Component memoization
const MemoizedComponent = memo(MyComponent);

// Callback memoization
const handleClick = useCallback(() => {
  // handler
}, [dependencies]);

// Value memoization
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

### Code Splitting
```typescript
const LazyComponent = lazy(() => import('./LazyComponent'));

<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

## Accessibility

### ARIA Labels
```typescript
<button aria-label="Close dialog">×</button>
<input aria-labelledby="label-id" />
<div role="alert" aria-live="polite">Message</div>
```

### Keyboard Navigation
```typescript
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Click me
</div>
```

## Analytics

### Track Events
```typescript
import { trackUserAction, simulationAnalytics } from '../utils/analytics';

trackUserAction('button_click', { buttonName: 'submit' });
simulationAnalytics.trackSimulationStart(scenarioId, scenarioTitle);
```

### Track Performance
```typescript
import { measurePerformanceAsync } from '../utils/performanceMonitoring';

const data = await measurePerformanceAsync('fetch_users', () => 
  fetchUsers()
);
```

## Common Issues

### TypeScript Error: Property does not exist
```typescript
// Problem: Object is possibly 'null'
const user = users.find(u => u.id === id);
console.log(user.name); // Error

// Solution: Check for null
if (user) {
  console.log(user.name);
}
// Or use optional chaining
console.log(user?.name);
```

### Test Timeout
```typescript
// Increase timeout for slow tests
test('slow test', async () => {
  // test code
}, 10000); // 10 second timeout
```

### Mock Not Working
```typescript
// Ensure mocks are defined before imports
vi.mock('./module', () => ({
  myFunction: vi.fn(),
}));

import { Component } from './Component'; // Import after mock
```

## Useful Links

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [fast-check Documentation](https://fast-check.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)

## Getting Help

1. Check relevant documentation in `docs/`
2. Search for similar issues in tests
3. Review examples in the codebase
4. Check TypeScript errors carefully
5. Use IDE autocomplete and type hints
6. Ask team members or create an issue

## Best Practices Checklist

- [ ] TypeScript types defined for all props and state
- [ ] Tests written for new functionality
- [ ] Error handling implemented
- [ ] Accessibility attributes added
- [ ] Performance optimizations applied (memo, useCallback)
- [ ] Firebase queries have limits
- [ ] Subscriptions cleaned up on unmount
- [ ] JSDoc comments added to public functions
- [ ] Code follows established patterns
- [ ] Documentation updated if needed

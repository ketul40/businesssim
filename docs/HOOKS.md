# Custom Hooks Documentation

## Overview

SkillLoops uses custom React hooks to encapsulate business logic and provide reusable functionality across components. This document describes each custom hook, its API, and usage examples.

---

## useSimulation

Manages simulation state and handles AI interactions during a practice session.

### Import

```typescript
import { useSimulation } from '../hooks/useSimulation';
```

### Type Signature

```typescript
interface UseSimulationOptions {
  scenario: Scenario;
  sessionId: string | null;
  onEvaluationComplete?: (evaluation: any) => void;
}

interface UseSimulationReturn {
  messages: Message[];
  turnCount: number;
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  requestTimeout: () => Promise<void>;
  exitSimulation: () => Promise<void>;
  clearMessages: () => void;
}

function useSimulation(options: UseSimulationOptions): UseSimulationReturn
```

### Parameters

- **scenario** (required): The scenario object containing stakeholders, objectives, and constraints
- **sessionId** (required): The Firestore document ID for the current session
- **onEvaluationComplete** (optional): Callback function called when evaluation is complete

### Return Values

- **messages**: Array of all messages in the conversation
- **turnCount**: Current number of user turns
- **isLoading**: Boolean indicating if AI is processing
- **sendMessage**: Function to send a user message and get AI response
- **requestTimeout**: Function to request a coaching hint
- **exitSimulation**: Function to exit and trigger evaluation
- **clearMessages**: Function to reset messages and turn count

### Usage Example

```typescript
function ChatInterface({ scenario, sessionId }) {
  const {
    messages,
    turnCount,
    isLoading,
    sendMessage,
    requestTimeout,
    exitSimulation,
  } = useSimulation({
    scenario,
    sessionId,
    onEvaluationComplete: (evaluation) => {
      console.log('Evaluation:', evaluation);
      // Navigate to feedback screen
    },
  });

  const handleSend = async (content: string) => {
    await sendMessage(content);
  };

  return (
    <div>
      <MessageList messages={messages} />
      <MessageInput onSend={handleSend} disabled={isLoading} />
      <button onClick={requestTimeout}>Get Hint</button>
      <button onClick={exitSimulation}>Exit</button>
    </div>
  );
}
```

### Notes

- Automatically updates Firestore session document with transcript
- Handles errors gracefully with system messages
- Maintains stable callback references with useCallback

---

## useFirestore

Generic hook for fetching Firestore data with caching and real-time updates.

### Import

```typescript
import { useFirestore } from '../hooks/useFirestore';
```

### Type Signature

```typescript
interface UseFirestoreOptions<T> {
  collectionName: string;
  queryConstraints?: QueryConstraint[];
  realtime?: boolean;
  cacheTime?: number;
}

interface UseFirestoreReturn<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

function useFirestore<T>(options: UseFirestoreOptions<T>): UseFirestoreReturn<T>
```

### Parameters

- **collectionName** (required): Name of the Firestore collection
- **queryConstraints** (optional): Array of Firestore query constraints (where, orderBy, limit, etc.)
- **realtime** (optional): Enable real-time updates via onSnapshot (default: false)
- **cacheTime** (optional): Cache duration in milliseconds (default: 5 minutes)

### Return Values

- **data**: Array of documents from the collection
- **loading**: Boolean indicating if data is being fetched
- **error**: Error object if fetch failed, null otherwise
- **refetch**: Function to manually refetch data and clear cache

### Usage Examples

#### Basic Fetch

```typescript
import { useFirestore } from '../hooks/useFirestore';

function ScenarioList() {
  const { data: scenarios, loading, error } = useFirestore({
    collectionName: 'scenarios',
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {scenarios.map(scenario => (
        <li key={scenario.id}>{scenario.title}</li>
      ))}
    </ul>
  );
}
```

#### With Query Constraints

```typescript
import { where, orderBy, limit } from 'firebase/firestore';

function UserSessions({ userId }) {
  const { data: sessions, loading } = useFirestore({
    collectionName: 'sessions',
    queryConstraints: [
      where('userId', '==', userId),
      orderBy('startedAt', 'desc'),
      limit(10),
    ],
  });

  return <SessionList sessions={sessions} />;
}
```

#### Real-time Updates

```typescript
function LiveScores() {
  const { data: scores } = useFirestore({
    collectionName: 'scores',
    realtime: true, // Enable real-time updates
  });

  return <ScoreBoard scores={scores} />;
}
```

#### Manual Refetch

```typescript
function RefreshableList() {
  const { data, loading, refetch } = useFirestore({
    collectionName: 'items',
  });

  return (
    <div>
      <button onClick={refetch} disabled={loading}>
        Refresh
      </button>
      <ItemList items={data} />
    </div>
  );
}
```

### Notes

- Implements in-memory caching to reduce Firestore reads
- Automatically cleans up listeners on unmount
- Cache is shared across all hook instances with same query
- Type-safe with TypeScript generics

---

## useDebounce

Debounces a value by delaying updates until after a specified delay.

### Import

```typescript
import { useDebounce } from '../hooks/useDebounce';
```

### Type Signature

```typescript
function useDebounce<T>(value: T, delay: number): T
```

### Parameters

- **value** (required): The value to debounce
- **delay** (required): Delay in milliseconds

### Return Value

The debounced value that updates after the delay period

### Usage Example

```typescript
function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // Perform search with debounced value
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### Use Cases

- Search inputs (avoid API calls on every keystroke)
- Window resize handlers
- Scroll event handlers
- Form validation

### Notes

- Cleans up timeout on unmount or value change
- Generic type support for any value type

---

## useLocalStorage

Syncs React state with localStorage, including cross-tab synchronization.

### Import

```typescript
import { useLocalStorage } from '../hooks/useLocalStorage';
```

### Type Signature

```typescript
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void]
```

### Parameters

- **key** (required): localStorage key
- **initialValue** (required): Default value if key doesn't exist

### Return Value

Tuple of `[value, setValue]` similar to useState

### Usage Examples

#### Basic Usage

```typescript
function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

#### With Objects

```typescript
interface UserPreferences {
  notifications: boolean;
  language: string;
}

function Settings() {
  const [prefs, setPrefs] = useLocalStorage<UserPreferences>('preferences', {
    notifications: true,
    language: 'en',
  });

  const toggleNotifications = () => {
    setPrefs(prev => ({
      ...prev,
      notifications: !prev.notifications,
    }));
  };

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={prefs.notifications}
          onChange={toggleNotifications}
        />
        Enable notifications
      </label>
    </div>
  );
}
```

### Features

- **Cross-tab sync**: Changes in one tab update other tabs
- **Type-safe**: Full TypeScript support
- **Error handling**: Gracefully handles localStorage errors
- **Functional updates**: Supports updater functions like useState

### Notes

- Values are JSON serialized/deserialized
- Dispatches custom events for same-tab synchronization
- Listens to storage events for cross-tab synchronization

---

## useOnlineStatus

Tracks the browser's online/offline status.

### Import

```typescript
import { useOnlineStatus } from '../hooks/useOnlineStatus';
```

### Type Signature

```typescript
function useOnlineStatus(): boolean
```

### Return Value

Boolean indicating if the browser is online

### Usage Example

```typescript
function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="offline-banner">
      <span>⚠️ You are offline</span>
      <p>Some features may not be available</p>
    </div>
  );
}
```

### Advanced Usage

```typescript
function DataSync() {
  const isOnline = useOnlineStatus();
  const [pendingChanges, setPendingChanges] = useState([]);

  useEffect(() => {
    if (isOnline && pendingChanges.length > 0) {
      // Sync pending changes when back online
      syncChanges(pendingChanges);
      setPendingChanges([]);
    }
  }, [isOnline, pendingChanges]);

  return (
    <div>
      {!isOnline && (
        <div>Offline - {pendingChanges.length} changes pending</div>
      )}
    </div>
  );
}
```

### Notes

- Listens to `online` and `offline` browser events
- Cleans up event listeners on unmount
- Returns `true` by default in non-browser environments

---

## Best Practices

### Hook Composition

Combine hooks to create more powerful abstractions:

```typescript
function usePersistedState<T>(key: string, initialValue: T) {
  const [value, setValue] = useLocalStorage(key, initialValue);
  const debouncedValue = useDebounce(value, 500);
  
  return [debouncedValue, setValue] as const;
}
```

### Error Handling

Always handle errors from async hooks:

```typescript
const { data, error } = useFirestore({ collectionName: 'items' });

if (error) {
  return <ErrorMessage error={error} />;
}
```

### Cleanup

Hooks automatically clean up resources, but be aware of dependencies:

```typescript
// ✅ Good: Dependencies are correct
useEffect(() => {
  const unsubscribe = subscribe(userId);
  return () => unsubscribe();
}, [userId]);

// ❌ Bad: Missing dependency
useEffect(() => {
  const unsubscribe = subscribe(userId);
  return () => unsubscribe();
}, []); // userId should be in dependencies
```

### Type Safety

Use TypeScript generics for type-safe hooks:

```typescript
interface User {
  id: string;
  name: string;
}

const { data: users } = useFirestore<User>({
  collectionName: 'users',
});

// users is typed as User[]
```

---

## Testing Hooks

Use `@testing-library/react` to test custom hooks:

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from './useDebounce';

test('debounces value', async () => {
  const { result, rerender } = renderHook(
    ({ value, delay }) => useDebounce(value, delay),
    { initialProps: { value: 'initial', delay: 500 } }
  );

  expect(result.current).toBe('initial');

  rerender({ value: 'updated', delay: 500 });
  expect(result.current).toBe('initial'); // Still old value

  await waitFor(() => {
    expect(result.current).toBe('updated'); // Updated after delay
  });
});
```

---

## Additional Resources

- [React Hooks Documentation](https://react.dev/reference/react)
- [Custom Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Testing Hooks](https://react-hooks-testing-library.com/)

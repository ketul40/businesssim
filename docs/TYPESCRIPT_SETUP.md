# TypeScript Setup Guide

## Overview

This guide explains the TypeScript configuration and setup for the SkillLoops application.

## Configuration Files

### tsconfig.json

Main TypeScript configuration for the application:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### tsconfig.node.json

TypeScript configuration for Node.js files (Vite config, etc.):

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

## Type Definitions

### Core Types Location

All type definitions are organized in `src/types/`:

```
src/types/
├── models.ts    # Data models (User, Scenario, Session, etc.)
├── props.ts     # Component prop interfaces
├── api.ts       # API request/response types
└── index.ts     # Re-exports all types
```

### Importing Types

```typescript
// Import from centralized location
import type { User, Scenario, Message } from '../types';

// Or import specific type files
import type { UserProfile } from '../types/models';
import type { ChatInterfaceProps } from '../types/props';
```

## Type Patterns

### Component Props

Always define explicit prop interfaces:

```typescript
interface MyComponentProps {
  title: string;
  count: number;
  onUpdate?: (value: number) => void;
  children?: React.ReactNode;
}

export function MyComponent({ title, count, onUpdate, children }: MyComponentProps) {
  // Component implementation
}
```

### State Types

Define explicit types for state:

```typescript
interface FormState {
  email: string;
  password: string;
  errors: Record<string, string>;
}

const [formState, setFormState] = useState<FormState>({
  email: '',
  password: '',
  errors: {},
});
```

### Event Handlers

Use React's built-in event types:

```typescript
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  // Handle click
};

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setValue(event.target.value);
};

const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  // Handle submit
};
```

### Async Functions

Always type async function return values:

```typescript
async function fetchUser(userId: string): Promise<User> {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
}

// With error handling
async function fetchUserSafe(userId: string): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}
```

### Generic Components

Use generics for reusable components:

```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}

// Usage
<List<User>
  items={users}
  renderItem={user => <span>{user.name}</span>}
  keyExtractor={user => user.id}
/>
```

### Custom Hooks

Type custom hooks properly:

```typescript
interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

function useCounter(initialValue: number = 0): UseCounterReturn {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount(c => c - 1);
  }, []);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  return { count, increment, decrement, reset };
}
```

## Firebase Types

### Firestore Documents

```typescript
import { Timestamp } from 'firebase/firestore';

interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// When reading from Firestore
const userDoc = await getDoc(doc(db, 'users', userId));
const userData = userDoc.data() as UserDocument;
```

### Firebase Auth

```typescript
import { User as FirebaseUser } from 'firebase/auth';

interface AuthState {
  user: FirebaseUser | null;
  loading: boolean;
  error: Error | null;
}
```

## Type Guards

Use type guards for runtime type checking:

```typescript
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'uid' in value &&
    'email' in value
  );
}

// Usage
const data = await fetchData();
if (isUser(data)) {
  // TypeScript knows data is User here
  console.log(data.email);
}
```

## Utility Types

### Built-in Utility Types

```typescript
// Partial - Make all properties optional
type PartialUser = Partial<User>;

// Required - Make all properties required
type RequiredUser = Required<User>;

// Pick - Select specific properties
type UserBasicInfo = Pick<User, 'uid' | 'email' | 'displayName'>;

// Omit - Exclude specific properties
type UserWithoutPassword = Omit<User, 'password'>;

// Record - Create object type with specific keys
type UserMap = Record<string, User>;

// ReturnType - Extract return type of function
type FetchUserReturn = ReturnType<typeof fetchUser>;
```

### Custom Utility Types

```typescript
// Make specific properties optional
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type UserWithOptionalEmail = Optional<User, 'email'>;

// Deep partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

## Common Patterns

### Discriminated Unions

```typescript
type Message =
  | { type: 'user'; content: string; timestamp: string }
  | { type: 'ai'; content: string; stakeholder: string; timestamp: string }
  | { type: 'system'; content: string; timestamp: string }
  | { type: 'coaching'; content: string; timestamp: string };

function renderMessage(message: Message) {
  switch (message.type) {
    case 'user':
      return <UserMessage content={message.content} />;
    case 'ai':
      return <AIMessage content={message.content} stakeholder={message.stakeholder} />;
    case 'system':
      return <SystemMessage content={message.content} />;
    case 'coaching':
      return <CoachingMessage content={message.content} />;
  }
}
```

### Const Assertions

```typescript
const STATES = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
} as const;

type State = typeof STATES[keyof typeof STATES];
// Type is: 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'
```

### Enum Alternatives

```typescript
// Instead of enum, use const object with type
const Difficulty = {
  Easy: 'Easy',
  Medium: 'Medium',
  Hard: 'Hard',
} as const;

type Difficulty = typeof Difficulty[keyof typeof Difficulty];
```

## Type Checking

### Run Type Checker

```bash
# Check types without emitting files
npm run type-check

# Watch mode
npx tsc --noEmit --watch
```

### IDE Integration

TypeScript works best with:
- **VS Code**: Built-in TypeScript support
- **WebStorm**: Excellent TypeScript support
- **Vim/Neovim**: With coc-tsserver or similar

### Type Errors in Tests

For test files, you may need to add type assertions:

```typescript
import { vi } from 'vitest';

// Mock with proper types
const mockFunction = vi.fn<[string], Promise<User>>();

// Type assertion for test data
const testUser = {
  uid: '123',
  email: 'test@example.com',
} as User;
```

## Migration Tips

### Gradual Migration

1. Rename `.jsx` to `.tsx` one file at a time
2. Add `// @ts-nocheck` at top if needed initially
3. Fix type errors incrementally
4. Remove `@ts-nocheck` when complete

### Common Migration Issues

**Issue**: `Property 'x' does not exist on type 'never'`
```typescript
// Problem
const [state, setState] = useState({});

// Solution: Provide explicit type
interface State {
  x: string;
}
const [state, setState] = useState<State>({ x: '' });
```

**Issue**: `Object is possibly 'null'`
```typescript
// Problem
const user = users.find(u => u.id === id);
console.log(user.name); // Error

// Solution: Check for null
const user = users.find(u => u.id === id);
if (user) {
  console.log(user.name);
}

// Or use optional chaining
console.log(user?.name);
```

**Issue**: `Type 'string | undefined' is not assignable to type 'string'`
```typescript
// Problem
const value: string = obj.optionalProp;

// Solution: Provide default or check
const value: string = obj.optionalProp ?? '';
// Or
const value: string | undefined = obj.optionalProp;
```

## Best Practices

### DO

✅ Use explicit types for function parameters and return values
✅ Define interfaces for component props
✅ Use type guards for runtime checks
✅ Leverage TypeScript's strict mode
✅ Use `unknown` instead of `any` when type is truly unknown
✅ Use const assertions for literal types

### DON'T

❌ Use `any` type (defeats purpose of TypeScript)
❌ Use type assertions (`as`) unless necessary
❌ Ignore TypeScript errors with `@ts-ignore`
❌ Over-complicate types
❌ Use `Function` type (use specific function signature)

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Total TypeScript](https://www.totaltypescript.com/)

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Clear cache: `rm -rf node_modules/.vite`
2. Reinstall dependencies: `npm install`
3. Check TypeScript version: `npx tsc --version`
4. Verify tsconfig.json is valid

### IDE Not Recognizing Types

1. Restart TypeScript server (VS Code: Cmd+Shift+P → "Restart TS Server")
2. Check workspace TypeScript version matches project version
3. Ensure `tsconfig.json` includes all source files

### Type Errors in node_modules

Add to tsconfig.json:
```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

This skips type checking of declaration files in node_modules.

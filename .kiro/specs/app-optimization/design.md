# Design Document

## Overview

This design document outlines the optimization and improvement strategy for the SkillLoops business simulation application. The application is built with React 18, Firebase, and Vite, providing an AI-powered platform for practicing workplace scenarios.

The optimization effort focuses on:
- **Performance**: Reducing unnecessary re-renders, optimizing bundle size, and improving load times
- **Code Quality**: Implementing TypeScript, improving component architecture, and following React best practices
- **Maintainability**: Better code organization, separation of concerns, and documentation
- **User Experience**: Enhanced error handling, accessibility, and responsive feedback
- **Testing**: Establishing a comprehensive testing infrastructure

## Architecture

### Current Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React Application                    │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │    App     │  │ Components │  │  Custom Hooks    │  │
│  │  (State)   │──│  (UI)      │──│  (useAuth)       │  │
│  └────────────┘  └────────────┘  └──────────────────┘  │
│         │              │                    │            │
│         └──────────────┴────────────────────┘            │
│                        │                                 │
└────────────────────────┼─────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
    ┌────▼─────┐                  ┌─────▼──────┐
    │ Firebase │                  │   Utils    │
    │ Services │                  │ (aiService)│
    └──────────┘                  └────────────┘
```

### Optimized Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     React Application                         │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐   │
│  │    App     │  │ Components │  │   Custom Hooks       │   │
│  │  (Router)  │──│  (UI Only) │──│  (Business Logic)    │   │
│  └────────────┘  └────────────┘  └──────────────────────┘   │
│         │              │                    │                 │
│         │              │         ┌──────────▼──────────┐     │
│         │              │         │   Context Providers  │     │
│         │              │         │  (Auth, Theme, etc)  │     │
│         │              │         └─────────────────────┘     │
│         └──────────────┴────────────────────┘                │
│                        │                                      │
└────────────────────────┼──────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
    ┌────▼─────┐                  ┌─────▼──────┐
    │ Services │                  │   Utils    │
    │ (Typed)  │                  │  (Typed)   │
    └──────────┘                  └────────────┘
```

## Components and Interfaces

### Component Hierarchy Optimization

**Current Issues:**
- App.jsx contains too much state management logic (500+ lines)
- Components mix presentation and business logic
- No clear separation between container and presentational components
- Missing prop type definitions

**Optimized Structure:**

```typescript
// Type definitions
interface User {
  uid: string;
  email: string;
  displayName?: string;
}

interface Scenario {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  // ... other fields
}

interface Message {
  type: 'user' | 'ai' | 'system' | 'coaching';
  content: string;
  timestamp: string;
  stakeholder?: string;
  role?: string;
}

// Container Components (with logic)
- AppContainer
- SimulationContainer
- ScenarioSelectContainer

// Presentational Components (UI only)
- ChatInterface
- MessageList
- MessageInput
- ScenarioCard
- FeedbackDisplay
```

### Custom Hooks Architecture

**New Custom Hooks:**

1. **useSimulation** - Manages simulation state and logic
```typescript
interface UseSimulationReturn {
  messages: Message[];
  turnCount: number;
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  requestTimeout: () => Promise<void>;
  exitSimulation: () => Promise<void>;
}

function useSimulation(scenario: Scenario, sessionId: string): UseSimulationReturn
```

2. **useFirestore** - Generic Firestore operations with caching
```typescript
function useFirestore<T>(
  collectionName: string,
  queryConstraints?: QueryConstraint[]
): {
  data: T[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
```

3. **useDebounce** - Debounce values for performance
```typescript
function useDebounce<T>(value: T, delay: number): T
```

4. **useLocalStorage** - Sync state with localStorage
```typescript
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void]
```

## Data Models

### TypeScript Interfaces

```typescript
// User Models
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  roleLevel: 'individual_contributor' | 'manager' | 'director' | 'executive';
  totalSessions: number;
  averageScore: number;
  createdAt: Timestamp;
}

// Scenario Models
interface Stakeholder {
  role: string;
  name: string;
  relationshipType: 'direct_report' | 'peer' | 'stakeholder';
  personality: string;
  concerns: string[];
  motivations: string[];
}

interface ScenarioTemplate {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rubricId: string;
  description: string;
  situation: string;
  objective: string;
  turnLimit: number;
  stakeholders: Stakeholder[];
  constraints: string[];
}

// Session Models
interface SimulationSession {
  id: string;
  userId: string;
  scenario: ScenarioTemplate;
  transcript: Message[];
  turnCount: number;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  state: 'IN_SIM' | 'TIMEOUT' | 'EXITED' | 'EVALUATED';
}

// Evaluation Models
interface CriterionScore {
  criterion: string;
  weight: number;
  score: number;
  evidence: string[];
}

interface MissedOpportunity {
  criterion: string;
  what: string;
  how_to_improve: string;
}

interface MomentThatMattered {
  turn: number;
  description: string;
  why: string;
}

interface PracticeDrill {
  title: string;
  instructions: string;
  estimated_minutes: number;
}

interface Evaluation {
  id: string;
  sessionId: string;
  rubricId: string;
  overall_score: number;
  criterion_scores: CriterionScore[];
  missed_opportunities: MissedOpportunity[];
  moments_that_mattered: MomentThatMattered[];
  reflection_prompt: string;
  drills: PracticeDrill[];
  createdAt: Timestamp;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, I've identified the following testable properties. Some criteria are redundant or can be combined:

**Redundancies identified:**
- Properties 1.3 and 7.2 both test cleanup of subscriptions - can be combined
- Properties 7.4 and 1.3 overlap on memory leak prevention - can be combined
- Properties 4.2 and 4.5 both test user feedback for failures - can be combined

**Properties to implement:**

Property 1: Component re-render optimization
Property 2: Subscription cleanup on unmount
Property 3: Stable callback references
Property 4: UI interaction responsiveness
Property 5: Large list virtualization
Property 6: Lazy loading for images
Property 7: Error boundary coverage
Property 8: API error handling with user feedback
Property 9: Error logging context
Property 10: Network retry with exponential backoff
Property 11: Interactive element accessibility
Property 12: Form label associations
Property 13: Keyboard navigation support
Property 14: Color-independent information
Property 15: Dynamic content announcements
Property 16: Firestore query limits
Property 17: Derived state memoization
Property 18: Offline state indicators
Property 19: Graceful handling of corrupted data
Property 20: Race condition handling
Property 21: Input validation with clear messages

### Correctness Properties

Property 1: Component re-render optimization
*For any* component that receives props, when props haven't changed, the component should not re-render
**Validates: Requirements 1.1**

Property 2: Subscription cleanup on unmount
*For any* component that creates subscriptions (Firebase listeners, intervals, event listeners), when the component unmounts, all subscriptions should be properly cleaned up
**Validates: Requirements 1.3, 7.2, 7.4**

Property 3: Stable callback references
*For any* callback function passed as a prop, when the callback's dependencies haven't changed, the callback reference should remain stable across re-renders
**Validates: Requirements 1.4**

Property 4: UI interaction responsiveness
*For any* interactive UI element (button, input, link), when a user interacts with it, visual feedback should be provided within 100 milliseconds
**Validates: Requirements 3.2**

Property 5: Large list virtualization
*For any* list with more than 50 items, the rendering should use virtualization or pagination to limit DOM nodes
**Validates: Requirements 3.3**

Property 6: Lazy loading for images
*For any* image element in the application, it should have the loading="lazy" attribute or use an intersection observer for lazy loading
**Validates: Requirements 3.4**

Property 7: Error boundary coverage
*For any* component that might throw an error, there should be an error boundary ancestor that catches and handles the error gracefully
**Validates: Requirements 4.1**

Property 8: API error handling with user feedback
*For any* API call that fails, the application should display a user-friendly error message and provide recovery options
**Validates: Requirements 4.2, 4.5**

Property 9: Error logging context
*For any* error that is logged, the log entry should include timestamp, error message, stack trace, and relevant application context
**Validates: Requirements 4.3**

Property 10: Network retry with exponential backoff
*For any* network request that fails with a retryable error, the application should retry with exponential backoff (1s, 2s, 4s) up to 3 attempts
**Validates: Requirements 4.4**

Property 11: Interactive element accessibility
*For any* interactive element (button, link, input), it should have an appropriate ARIA role and accessible name (via aria-label, aria-labelledby, or text content)
**Validates: Requirements 6.1**

Property 12: Form label associations
*For any* form input element, it should have an associated label element with a matching htmlFor attribute or be wrapped in a label
**Validates: Requirements 6.2**

Property 13: Keyboard navigation support
*For any* interactive element, it should be reachable via keyboard navigation (Tab key) and have visible focus indicators
**Validates: Requirements 6.3**

Property 14: Color-independent information
*For any* UI element that uses color to convey information (success, error, warning), it should also provide a non-color indicator (icon, text, or pattern)
**Validates: Requirements 6.4**

Property 15: Dynamic content announcements
*For any* dynamically updated content region (loading states, notifications, live data), it should have an appropriate aria-live attribute to announce changes to screen readers
**Validates: Requirements 6.5**

Property 16: Firestore query limits
*For any* Firestore query that fetches a collection, it should include a limit() clause to prevent unbounded reads
**Validates: Requirements 7.1**

Property 17: Derived state memoization
*For any* expensive computation that derives state from props or state, when the dependencies haven't changed, the computation should not be re-executed
**Validates: Requirements 8.3**

Property 18: Offline state indicators
*For any* application state, when network connectivity is lost, the UI should display an offline indicator within 2 seconds
**Validates: Requirements 10.1**

Property 19: Graceful handling of corrupted data
*For any* data loaded from storage or API, when the data is malformed or missing required fields, the application should handle it gracefully without crashing
**Validates: Requirements 10.2**

Property 20: Race condition handling
*For any* asynchronous operation, when multiple instances of the same operation are triggered concurrently, the application should handle the race condition (cancel previous, debounce, or queue)
**Validates: Requirements 10.3**

Property 21: Input validation with clear messages
*For any* user input field, when invalid data is entered, the application should display a clear validation error message explaining what is wrong and how to fix it
**Validates: Requirements 10.5**

## Error Handling

### Error Boundary Implementation

```typescript
// ErrorBoundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    logError({
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
      userContext: getCurrentUserContext(),
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### API Error Handling Strategy

```typescript
// Centralized error handling
interface ApiError {
  code: string;
  message: string;
  userMessage: string;
  retryable: boolean;
}

function handleApiError(error: unknown): ApiError {
  if (error instanceof FirebaseError) {
    return {
      code: error.code,
      message: error.message,
      userMessage: getFirebaseErrorMessage(error.code),
      retryable: isRetryableFirebaseError(error.code),
    };
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: String(error),
    userMessage: 'An unexpected error occurred. Please try again.',
    retryable: true,
  };
}

// Retry logic with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const apiError = handleApiError(error);
      
      if (!apiError.retryable || i === maxRetries - 1) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}
```

### Offline Detection

```typescript
// useOnlineStatus hook
function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}
```

## Testing Strategy

### Testing Approach

The application will use a dual testing approach combining unit tests and property-based tests:

**Unit Tests:**
- Test specific component behaviors and edge cases
- Test custom hook functionality in isolation
- Test utility functions with known inputs/outputs
- Test error handling for specific scenarios
- Mock external dependencies (Firebase, API calls)

**Property-Based Tests:**
- Verify universal properties across many generated inputs
- Test performance characteristics (render counts, timing)
- Test accessibility properties across all components
- Test error handling with random error scenarios
- Test data validation with generated invalid inputs

### Testing Framework

**Framework:** Vitest + React Testing Library + fast-check (for property-based testing)

**Configuration:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ],
    },
  },
});
```

### Property-Based Testing Configuration

Each property-based test will:
- Run a minimum of 100 iterations with randomly generated inputs
- Be tagged with a comment referencing the design document property
- Use fast-check generators appropriate for the data being tested

**Example Property Test:**
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
        const { result, rerender } = renderHook(() => {
          const [data, setData] = useState(items);
          const callback = useCallback(() => {
            console.log(data);
          }, [data]);
          return { callback, setData };
        });
        
        const firstCallback = result.current.callback;
        rerender();
        const secondCallback = result.current.callback;
        
        // Callback reference should be stable when dependencies haven't changed
        expect(firstCallback).toBe(secondCallback);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing Guidelines

**Component Tests:**
- Test rendering with different prop combinations
- Test user interactions (clicks, inputs, form submissions)
- Test conditional rendering logic
- Test error states and loading states
- Mock external dependencies

**Hook Tests:**
- Test state updates and side effects
- Test cleanup functions
- Test error handling
- Test with various input combinations

**Service Tests:**
- Test API call formatting
- Test response parsing
- Test error handling
- Mock Firebase services

### Integration Testing

**Critical User Flows:**
1. User authentication (sign up, sign in, sign out)
2. Scenario selection and simulation start
3. Message exchange during simulation
4. Simulation exit and evaluation
5. Progress tracking and history viewing

### Test Coverage Goals

- **Unit Test Coverage:** 80% of code lines
- **Property Test Coverage:** All 21 correctness properties
- **Integration Test Coverage:** All 5 critical user flows
- **Accessibility Test Coverage:** All interactive components

### Continuous Testing

- Tests run on every commit via CI/CD
- Property tests run with 100 iterations in CI
- Coverage reports generated and tracked
- Failed tests block merges to main branch

## Performance Optimization Strategy

### Bundle Size Optimization

**Current Issues:**
- No code splitting implemented
- All components loaded upfront
- Large bundle size impacts initial load time

**Optimizations:**
1. **Route-based code splitting:**
```typescript
// Lazy load route components
const ScenarioSelect = lazy(() => import('./components/ScenarioSelect'));
const ChatInterface = lazy(() => import('./components/ChatInterface'));
const Feedback = lazy(() => import('./components/Feedback'));
const ProgressDashboard = lazy(() => import('./components/ProgressDashboard'));
```

2. **Dynamic imports for heavy dependencies:**
```typescript
// Load Firebase services on demand
const loadFirebaseAuth = () => import('./firebase/auth');
const loadFirebaseFirestore = () => import('./firebase/firestore');
```

3. **Tree shaking optimization:**
```typescript
// Import only what's needed from libraries
import { useState, useEffect, useCallback } from 'react';
import { Send, Clock } from 'lucide-react'; // Not entire library
```

### Render Optimization

**Memoization Strategy:**

1. **Component memoization:**
```typescript
// Memoize expensive components
const MessageList = memo(({ messages }: { messages: Message[] }) => {
  return (
    <div>
      {messages.map(msg => (
        <MessageItem key={msg.timestamp} message={msg} />
      ))}
    </div>
  );
});
```

2. **Callback memoization:**
```typescript
// Stable callback references
const handleSendMessage = useCallback((content: string) => {
  // Implementation
}, [/* dependencies */]);
```

3. **Computed value memoization:**
```typescript
// Expensive computations
const sortedScenarios = useMemo(() => {
  return scenarios.sort((a, b) => a.difficulty.localeCompare(b.difficulty));
}, [scenarios]);
```

### Firebase Optimization

**Query Optimization:**
```typescript
// Always use limits
const getUserSessions = (userId: string) => {
  return query(
    collection(db, 'sessions'),
    where('userId', '==', userId),
    orderBy('startedAt', 'desc'),
    limit(10) // Prevent unbounded reads
  );
};

// Batch writes
const batchUpdateSessions = async (updates: SessionUpdate[]) => {
  const batch = writeBatch(db);
  updates.forEach(update => {
    const ref = doc(db, 'sessions', update.id);
    batch.update(ref, update.data);
  });
  await batch.commit();
};
```

**Listener Management:**
```typescript
// Proper cleanup
useEffect(() => {
  const unsubscribe = onSnapshot(
    doc(db, 'sessions', sessionId),
    (snapshot) => {
      setSessionData(snapshot.data());
    }
  );
  
  return () => unsubscribe(); // Cleanup on unmount
}, [sessionId]);
```

### Image and Asset Optimization

```typescript
// Lazy loading images
<img 
  src={imageUrl} 
  loading="lazy" 
  alt={description}
/>

// Responsive images
<img
  srcSet={`${imageUrl}?w=400 400w, ${imageUrl}?w=800 800w`}
  sizes="(max-width: 600px) 400px, 800px"
  src={imageUrl}
  alt={description}
/>
```

## Migration Strategy

### Phase 1: TypeScript Migration
1. Add TypeScript configuration
2. Rename .jsx files to .tsx incrementally
3. Add type definitions for props and state
4. Fix type errors component by component

### Phase 2: Component Refactoring
1. Extract business logic from App.jsx into custom hooks
2. Split large components into smaller, focused components
3. Implement container/presentational pattern
4. Add memoization where beneficial

### Phase 3: Performance Optimization
1. Implement code splitting for routes
2. Add React.memo to expensive components
3. Optimize Firebase queries with limits
4. Implement proper cleanup for subscriptions

### Phase 4: Testing Infrastructure
1. Set up Vitest and React Testing Library
2. Add fast-check for property-based testing
3. Write unit tests for critical components
4. Implement property tests for correctness properties
5. Add integration tests for user flows

### Phase 5: Accessibility Improvements
1. Audit all interactive elements for ARIA attributes
2. Add keyboard navigation support
3. Implement focus management
4. Add screen reader announcements for dynamic content

### Phase 6: Error Handling Enhancement
1. Implement error boundaries
2. Add centralized error handling
3. Implement retry logic with backoff
4. Add offline detection and indicators

## Monitoring and Observability

### Performance Monitoring

```typescript
// Performance tracking
const measurePerformance = (metricName: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const duration = performance.now() - start;
  
  // Log to analytics
  logPerformanceMetric({
    metric: metricName,
    duration,
    timestamp: new Date().toISOString(),
  });
};
```

### Error Tracking

```typescript
// Centralized error logging
interface ErrorLog {
  error: Error;
  context: {
    userId?: string;
    sessionId?: string;
    component?: string;
    action?: string;
  };
  timestamp: string;
  userAgent: string;
}

function logError(errorLog: ErrorLog) {
  // Send to error tracking service (e.g., Sentry)
  console.error('[Error]', errorLog);
  
  // Could integrate with Firebase Analytics or external service
  // analytics.logEvent('error', errorLog);
}
```

### User Analytics

```typescript
// Track user actions
function trackUserAction(action: string, properties?: Record<string, any>) {
  // Firebase Analytics or similar
  logEvent(analytics, action, {
    ...properties,
    timestamp: new Date().toISOString(),
  });
}
```

## Documentation Requirements

### Code Documentation
- JSDoc comments for all public functions and components
- README files for each major module
- Architecture decision records (ADRs) for significant changes

### API Documentation
- TypeScript interfaces serve as API contracts
- Document expected behavior and edge cases
- Include usage examples

### Testing Documentation
- Document testing strategy and patterns
- Provide examples of writing property tests
- Document mock setup and test utilities

## Success Metrics

### Performance Metrics
- Initial load time < 2 seconds
- Time to interactive < 3 seconds
- Lighthouse performance score > 90
- Bundle size < 500KB (gzipped)

### Quality Metrics
- Test coverage > 80%
- All 21 correctness properties passing
- Zero TypeScript errors
- Zero accessibility violations (axe-core)

### User Experience Metrics
- Error rate < 1% of sessions
- Average session duration increase
- User satisfaction score improvement
- Reduced support tickets for bugs

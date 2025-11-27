# Performance Monitoring and Analytics

This directory contains utilities for monitoring application performance, tracking user analytics, and logging errors.

## Overview

The monitoring system consists of three main components:

1. **Performance Monitoring** - Tracks application performance metrics and Web Vitals
2. **Analytics Tracking** - Tracks user actions and events
3. **Error Logging** - Logs errors with context for debugging

## Quick Start

### 1. Initialize Monitoring

Add this to your `main.tsx` or `App.tsx`:

```typescript
import { initMonitoring } from './utils/monitoring';

// Initialize when app starts
initMonitoring({
  enablePerformanceTracking: true,
  enableAnalytics: true,
  enableErrorTracking: true,
  debug: import.meta.env.DEV,
});
```

### 2. Set User Context

When a user signs in:

```typescript
import { setMonitoringUser } from './utils/monitoring';

setMonitoringUser('user123', {
  roleLevel: 'manager',
  totalSessions: 10,
  averageScore: 85.5,
});
```

When a user signs out:

```typescript
import { clearMonitoringUser } from './utils/monitoring';

clearMonitoringUser();
```

## Performance Monitoring

### Measuring Function Performance

**Synchronous functions:**

```typescript
import { measurePerformance } from './utils/monitoring';

const result = measurePerformance('expensive_calculation', () => {
  // Your expensive operation
  return calculateSomething();
});
```

**Asynchronous functions:**

```typescript
import { measurePerformanceAsync } from './utils/monitoring';

const data = await measurePerformanceAsync('api_call', async () => {
  const response = await fetch('/api/data');
  return response.json();
});
```

### Web Vitals Tracking

Web Vitals are automatically tracked when you call `initMonitoring()`. The following metrics are tracked:

- **LCP (Largest Contentful Paint)** - Loading performance
- **FID (First Input Delay)** - Interactivity
- **CLS (Cumulative Layout Shift)** - Visual stability
- **FCP (First Contentful Paint)** - Initial render
- **TTFB (Time to First Byte)** - Server response time

### Custom Performance Metrics

```typescript
import { logPerformanceMetric } from './utils/monitoring';

logPerformanceMetric({
  name: 'custom_metric',
  value: 123.45,
  unit: 'ms',
  timestamp: new Date().toISOString(),
  context: {
    component: 'MyComponent',
  },
});
```

## Analytics Tracking

### Page Views

```typescript
import { trackPageView } from './utils/monitoring';

trackPageView('scenario_select', {
  referrer: 'dashboard',
});
```

### User Actions

```typescript
import { trackUserAction } from './utils/monitoring';

trackUserAction('button_click', {
  category: 'ui_interaction',
  label: 'submit_button',
  value: 1,
});
```

### Simulation Events

```typescript
import { simulationAnalytics } from './utils/monitoring';

// When simulation starts
simulationAnalytics.trackSimulationStart('scenario123', 'Difficult Conversation');

// When user sends a message
simulationAnalytics.trackMessageSent(5, 150);

// When simulation exits
simulationAnalytics.trackSimulationExit('scenario123', 8, 'manual');

// When evaluation is received
simulationAnalytics.trackEvaluationReceived('scenario123', 85.5, 10);
```

### Authentication Events

```typescript
import { authAnalytics } from './utils/monitoring';

// Sign in
authAnalytics.trackSignIn('google');

// Sign up
authAnalytics.trackSignUp('email');

// Sign out
authAnalytics.trackSignOut();

// Auth error
authAnalytics.trackAuthError('auth/invalid-email');
```

### UI Interaction Events

```typescript
import { uiAnalytics } from './utils/monitoring';

// Button click
uiAnalytics.trackButtonClick('submit_button', 'form');

// Tab change
uiAnalytics.trackTabChange('progress');

// Modal open/close
uiAnalytics.trackModalOpen('scenario_details');
uiAnalytics.trackModalClose('scenario_details');
```

## Error Logging

### Basic Error Logging

```typescript
import { logError } from './utils/monitoring';

try {
  // Your code
} catch (error) {
  logError(error as Error, {
    component: 'MyComponent',
    action: 'submit_form',
    userId: 'user123',
  });
}
```

### Warning and Info Logs

```typescript
import { logWarning, logInfo } from './utils/monitoring';

// Warning (non-critical)
logWarning('API rate limit approaching', {
  component: 'ApiService',
});

// Info (development only)
logInfo('Debug information', { data: someData });
```

## Integration with Firebase Analytics

To integrate with Firebase Analytics (or another analytics service), update the TODO sections in:

- `src/utils/performanceMonitoring.ts`
- `src/utils/analytics.ts`
- `src/utils/errorLogging.ts`

Example Firebase Analytics integration:

```typescript
import { logEvent, setUserProperties as setFirebaseUserProperties } from 'firebase/analytics';
import { analytics } from '../firebase/config';

// In performanceMonitoring.ts
export function logPerformanceMetric(metric: PerformanceMetric): void {
  if (import.meta.env.PROD) {
    logEvent(analytics, 'performance_metric', {
      metric_name: metric.name,
      metric_value: metric.value,
      metric_unit: metric.unit,
    });
  }
}

// In analytics.ts
export function trackUserAction(action: string, properties?: Record<string, any>): void {
  if (import.meta.env.PROD) {
    logEvent(analytics, action, properties);
  }
}

export function setUserProperties(properties: UserProperties): void {
  if (import.meta.env.PROD) {
    setFirebaseUserProperties(analytics, properties);
  }
}
```

## Testing

All monitoring utilities have comprehensive unit tests:

- `performanceMonitoring.test.ts` - Tests for performance measurement
- `analytics.test.ts` - Tests for analytics tracking
- `monitoring.test.ts` - Tests for the central monitoring module
- `errorLogging.test.ts` - Tests for error logging (includes property-based tests)

Run tests:

```bash
npm test -- src/utils/performanceMonitoring.test.ts
npm test -- src/utils/analytics.test.ts
npm test -- src/utils/monitoring.test.ts
npm test -- src/utils/errorLogging.test.ts
```

## Configuration

The monitoring system can be configured when initializing:

```typescript
interface MonitoringConfig {
  enablePerformanceTracking?: boolean; // Default: true
  enableAnalytics?: boolean;           // Default: true
  enableErrorTracking?: boolean;       // Default: true
  debug?: boolean;                     // Default: import.meta.env.DEV
}
```

## Best Practices

1. **Initialize Early** - Call `initMonitoring()` as early as possible in your app lifecycle
2. **Set User Context** - Always set user context after authentication
3. **Clear User Context** - Clear user context on sign out
4. **Measure Critical Paths** - Focus on measuring performance of critical user flows
5. **Track Key Events** - Track events that matter for understanding user behavior
6. **Include Context** - Always include relevant context when logging errors
7. **Don't Over-Track** - Be selective about what you track to avoid noise

## Privacy Considerations

- User IDs are tracked but can be anonymized
- No personally identifiable information (PII) should be included in event properties
- Ensure compliance with privacy regulations (GDPR, CCPA, etc.)
- Consider implementing user consent for analytics tracking

## Performance Impact

The monitoring utilities are designed to have minimal performance impact:

- Performance measurements use `performance.now()` which is highly optimized
- Analytics events are logged asynchronously
- In development, events are only logged to console
- In production, events should be batched and sent to analytics services

## Troubleshooting

### Monitoring not working

1. Check that `initMonitoring()` was called
2. Verify the configuration is correct
3. Check browser console for errors

### Web Vitals not tracking

1. Ensure browser supports Performance Observer API
2. Check that performance tracking is enabled in config
3. Some metrics (like FID) only fire on user interaction

### Analytics events not appearing

1. Verify analytics is enabled in config
2. Check that the analytics service integration is configured
3. In development, events only log to console

## Future Enhancements

- [ ] Batch analytics events for better performance
- [ ] Add session replay integration
- [ ] Implement custom performance budgets
- [ ] Add A/B testing support
- [ ] Integrate with error tracking services (Sentry, LogRocket)
- [ ] Add user feedback collection
- [ ] Implement feature flag tracking

# Bundle Size and Code Splitting Optimization

This document describes the bundle optimization strategies implemented in the SkillLoops application.

## Overview

The application uses several techniques to minimize bundle size and improve load times:

1. **Route-based code splitting** with React.lazy
2. **Manual chunk splitting** for better caching
3. **Production build optimizations** with Terser
4. **Bundle analysis** with rollup-plugin-visualizer

## Code Splitting Strategy

### Lazy-Loaded Components

All major route components are lazy-loaded using React.lazy:

```typescript
const AuthScreen = lazy(() => import('./components/AuthScreen'));
const ScenarioSelect = lazy(() => import('./components/ScenarioSelect'));
const ChatInterface = lazy(() => import('./components/ChatInterface'));
const Sidebar = lazy(() => import('./components/Sidebar'));
const Feedback = lazy(() => import('./components/Feedback'));
const ProgressDashboard = lazy(() => import('./components/ProgressDashboard'));
const ThemeToggle = lazy(() => import('./components/ThemeToggle'));
```

These components are wrapped in `<Suspense>` boundaries with loading fallbacks.

### Manual Chunk Splitting

The Vite configuration splits the bundle into logical chunks:

#### Vendor Chunks
- **react-vendor**: React and React-DOM
- **firebase-vendor**: All Firebase services
- **icons-vendor**: Lucide React icons

#### Feature Chunks
- **simulation**: Chat interface and simulation logic
- **scenarios**: Scenario selection and browsing
- **feedback**: Evaluation and feedback display
- **progress**: Progress dashboard and analytics

This strategy ensures:
- Better browser caching (vendor code changes less frequently)
- Parallel loading of independent chunks
- Smaller initial bundle size

## Production Build Optimizations

### Terser Minification

The build process uses Terser with aggressive optimizations:

```typescript
terserOptions: {
  compress: {
    drop_console: true,    // Remove console.log statements
    drop_debugger: true,   // Remove debugger statements
  },
}
```

### Asset Optimization

- **Target**: ES2015 for broad browser support
- **Source maps**: Disabled in production (can be enabled for debugging)
- **Chunk size warning**: 500KB threshold

## Bundle Analysis

### Running Bundle Analysis

To analyze the bundle size and composition:

```bash
npm run build:analyze
```

This will:
1. Build the production bundle
2. Generate a visual report at `dist/stats.html`
3. Open the report in your browser

### What to Look For

In the bundle analysis report:
- **Large dependencies**: Identify unexpectedly large packages
- **Duplicate code**: Check for code included in multiple chunks
- **Unused exports**: Look for tree-shaking opportunities
- **Chunk sizes**: Ensure no single chunk exceeds 500KB

## Import Optimization Guidelines

### ✅ Good Practices

```typescript
// Named imports from libraries
import { useState, useEffect } from 'react';
import { Send, Clock } from 'lucide-react';

// Modular Firebase imports
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Lazy loading for routes
const Dashboard = lazy(() => import('./Dashboard'));
```

### ❌ Avoid

```typescript
// Wildcard imports (prevents tree-shaking)
import * as React from 'react';
import * as Icons from 'lucide-react';

// Importing entire Firebase SDK
import firebase from 'firebase';

// Importing large libraries without lazy loading
import HeavyComponent from './HeavyComponent';
```

## Performance Targets

### Bundle Size Goals

- **Initial bundle**: < 200KB (gzipped)
- **Total bundle**: < 500KB (gzipped)
- **Largest chunk**: < 150KB (gzipped)

### Load Time Goals

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Largest Contentful Paint**: < 2.5s

## Monitoring Bundle Size

### CI/CD Integration

Consider adding bundle size checks to your CI/CD pipeline:

```bash
# Build and check bundle size
npm run build
# Add size limit checks here
```

### Regular Audits

Perform bundle analysis:
- After adding new dependencies
- Before major releases
- Monthly as part of maintenance

## Optimization Checklist

- [x] Implement React.lazy for route components
- [x] Configure manual chunk splitting
- [x] Enable Terser minification
- [x] Remove console.log in production
- [x] Add bundle visualization
- [x] Optimize Firebase imports (modular SDK)
- [x] Configure optimal Vite build settings
- [ ] Set up bundle size monitoring in CI/CD
- [ ] Implement performance budgets

## Further Optimizations

### Future Improvements

1. **Image Optimization**
   - Use WebP format with fallbacks
   - Implement responsive images
   - Add lazy loading for images

2. **Font Optimization**
   - Use font-display: swap
   - Subset fonts to include only needed characters
   - Consider system fonts

3. **CSS Optimization**
   - Remove unused CSS
   - Consider CSS-in-JS solutions
   - Implement critical CSS extraction

4. **Dependency Audit**
   - Regularly review dependencies
   - Replace large libraries with lighter alternatives
   - Remove unused dependencies

## Resources

- [Vite Build Optimizations](https://vitejs.dev/guide/build.html)
- [React Code Splitting](https://react.dev/reference/react/lazy)
- [Web Performance Best Practices](https://web.dev/performance/)
- [Bundle Size Optimization Guide](https://web.dev/reduce-javascript-payloads-with-code-splitting/)

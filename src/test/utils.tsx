import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

/**
 * Custom render function that wraps components with common providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options });
}

/**
 * Wait for a condition to be true with timeout
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();
  
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

/**
 * Create a mock Firebase user
 */
export function createMockUser(overrides = {}) {
  return {
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
    emailVerified: true,
    ...overrides,
  };
}

/**
 * Create a mock scenario
 */
export function createMockScenario(overrides = {}) {
  return {
    id: 'test-scenario-id',
    title: 'Test Scenario',
    category: 'Communication',
    difficulty: 'Medium' as const,
    rubricId: 'test-rubric-id',
    description: 'Test scenario description',
    situation: 'Test situation',
    objective: 'Test objective',
    turnLimit: 10,
    stakeholders: [],
    constraints: [],
    ...overrides,
  };
}

/**
 * Create a mock message
 */
export function createMockMessage(overrides = {}) {
  return {
    type: 'user' as const,
    content: 'Test message',
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a mock session
 */
export function createMockSession(overrides = {}) {
  return {
    id: 'test-session-id',
    userId: 'test-user-id',
    scenario: createMockScenario(),
    transcript: [],
    turnCount: 0,
    startedAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
    state: 'IN_SIM' as const,
    ...overrides,
  };
}

/**
 * Suppress console errors during tests
 */
export function suppressConsoleError(callback: () => void) {
  const originalError = console.error;
  console.error = () => {};
  try {
    callback();
  } finally {
    console.error = originalError;
  }
}

/**
 * Mock Firebase Firestore operations
 */
export const mockFirestore = {
  collection: () => mockFirestore,
  doc: () => mockFirestore,
  where: () => mockFirestore,
  orderBy: () => mockFirestore,
  limit: () => mockFirestore,
  get: () => Promise.resolve({ docs: [], empty: true }),
  set: () => Promise.resolve(),
  update: () => Promise.resolve(),
  delete: () => Promise.resolve(),
  onSnapshot: () => () => {},
};

/**
 * Mock Firebase Auth operations
 */
export const mockAuth = {
  currentUser: null,
  signInWithEmailAndPassword: () => Promise.resolve({ user: createMockUser() }),
  signOut: () => Promise.resolve(),
  onAuthStateChanged: () => () => {},
};

// Re-export testing library utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

/**
 * Integration tests for authentication flow
 * Tests: Sign up, sign in, sign out, and guest mode
 * Requirements: 9.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import * as authModule from '../../firebase/auth';
import * as firestoreModule from '../../firebase/firestore';

// Mock Firebase modules
vi.mock('../../firebase/auth');
vi.mock('../../firebase/firestore');
vi.mock('../../firebase/config', () => ({
  auth: {},
  db: {},
  storage: {},
  functions: {},
}));
vi.mock('../../utils/aiService');

describe('Authentication Integration Tests', () => {
  const mockUser = {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    emailVerified: true,
  };

  const mockUserData = {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    roleLevel: 'individual_contributor',
    totalSessions: 5,
    averageScore: 75,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default: user not authenticated (guest mode)
    vi.mocked(authModule.observeAuthState).mockImplementation((callback) => {
      callback(null);
      return () => {};
    });
    
    vi.mocked(firestoreModule.getUser).mockResolvedValue(mockUserData);
    vi.mocked(firestoreModule.createUser).mockResolvedValue(undefined);
    vi.mocked(firestoreModule.createSession).mockResolvedValue('session-123');
  });

  it('should start in guest mode when user is not authenticated', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Guest Mode/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Sign In \/ Sign Up/i)).toBeInTheDocument();
  });

  it('should display authenticated user information when logged in', async () => {
    // Mock authenticated user
    vi.mocked(authModule.observeAuthState).mockImplementation((callback) => {
      callback(mockUser);
      return () => {};
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    expect(screen.queryByText(/Guest Mode/i)).not.toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
  });

  it('should open auth modal when sign in button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Sign In \/ Sign Up/i)).toBeInTheDocument();
    });

    const signInButton = screen.getByText(/Sign In \/ Sign Up/i);
    await user.click(signInButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  it('should handle sign up flow successfully', async () => {
    const user = userEvent.setup();
    
    vi.mocked(authModule.signUpWithEmail).mockResolvedValue(mockUser);
    
    // Start with auth modal open
    let authCallback: ((user: any) => void) | null = null;
    vi.mocked(authModule.observeAuthState).mockImplementation((callback) => {
      authCallback = callback;
      callback(null); // Start as guest
      return () => {};
    });

    render(<App />);

    // Open auth modal
    await waitFor(() => {
      expect(screen.getByText(/Sign In \/ Sign Up/i)).toBeInTheDocument();
    });
    
    const signInButton = screen.getByText(/Sign In \/ Sign Up/i);
    await user.click(signInButton);

    // Wait for auth screen to load
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });

    // Switch to sign up tab
    const signUpTab = screen.getByText(/sign up/i, { selector: 'button' });
    await user.click(signUpTab);

    // Fill in sign up form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const displayNameInput = screen.getByLabelText(/display name/i);

    await user.type(emailInput, 'newuser@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(displayNameInput, 'New User');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    // Verify sign up was called
    await waitFor(() => {
      expect(authModule.signUpWithEmail).toHaveBeenCalledWith(
        'newuser@example.com',
        'password123',
        'New User'
      );
    });

    // Simulate auth state change after sign up
    if (authCallback) {
      authCallback(mockUser);
    }

    // Verify user is now authenticated
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  it('should handle sign in flow successfully', async () => {
    const user = userEvent.setup();
    
    vi.mocked(authModule.signInWithEmail).mockResolvedValue(mockUser);
    
    let authCallback: ((user: any) => void) | null = null;
    vi.mocked(authModule.observeAuthState).mockImplementation((callback) => {
      authCallback = callback;
      callback(null); // Start as guest
      return () => {};
    });

    render(<App />);

    // Open auth modal
    await waitFor(() => {
      expect(screen.getByText(/Sign In \/ Sign Up/i)).toBeInTheDocument();
    });
    
    const signInButton = screen.getByText(/Sign In \/ Sign Up/i);
    await user.click(signInButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });

    // Fill in sign in form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    // Verify sign in was called
    await waitFor(() => {
      expect(authModule.signInWithEmail).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
    });

    // Simulate auth state change
    if (authCallback) {
      authCallback(mockUser);
    }

    // Verify user is authenticated
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  it('should handle sign out flow successfully', async () => {
    const user = userEvent.setup();
    
    // Start authenticated
    let authCallback: ((user: any) => void) | null = null;
    vi.mocked(authModule.observeAuthState).mockImplementation((callback) => {
      authCallback = callback;
      callback(mockUser);
      return () => {};
    });

    vi.mocked(authModule.signOutUser).mockResolvedValue(undefined);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Find and click sign out button
    const signOutButton = screen.getByRole('button', { name: /log out/i });
    await user.click(signOutButton);

    // Verify sign out was called
    await waitFor(() => {
      expect(authModule.signOutUser).toHaveBeenCalled();
    });

    // Simulate auth state change to null
    if (authCallback) {
      authCallback(null);
    }

    // Verify user is back in guest mode
    await waitFor(() => {
      expect(screen.getByText(/Guest Mode/i)).toBeInTheDocument();
    });
  });

  it('should prompt authentication when guest tries to create custom scenario', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Guest Mode/i)).toBeInTheDocument();
    });

    // Find and click "Create Custom" scenario card
    const createCustomButton = screen.getByText(/create your own/i);
    await user.click(createCustomButton);

    // Should show auth prompt
    await waitFor(() => {
      expect(screen.getByText(/sign in required/i)).toBeInTheDocument();
      expect(screen.getByText(/to create custom scenarios/i)).toBeInTheDocument();
    });
  });

  it('should maintain session state across authentication changes', async () => {
    const user = userEvent.setup();
    
    let authCallback: ((user: any) => void) | null = null;
    vi.mocked(authModule.observeAuthState).mockImplementation((callback) => {
      authCallback = callback;
      callback(null); // Start as guest
      return () => {};
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Guest Mode/i)).toBeInTheDocument();
    });

    // Simulate authentication
    if (authCallback) {
      authCallback(mockUser);
    }

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Verify app state is maintained
    expect(screen.getByText(/SkillLoops/i)).toBeInTheDocument();
    expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
  });
});

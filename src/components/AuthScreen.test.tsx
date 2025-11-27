import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthScreen from './AuthScreen';

// Mock firebase auth functions
vi.mock('../firebase/auth', () => ({
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
}));

import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../firebase/auth';

describe('AuthScreen', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Sign In Flow', () => {
    it('should render sign in form by default', () => {
      render(<AuthScreen onClose={mockOnClose} />);
      
      const tabs = screen.getAllByText('Sign In');
      expect(tabs[0]).toHaveClass('active'); // First one is the tab
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    });

    it('should call signInWithEmail when sign in form is submitted', async () => {
      (signInWithEmail as any).mockResolvedValue({ uid: 'test-uid' });
      
      render(<AuthScreen onClose={mockOnClose} />);
      
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const form = emailInput.closest('form')!;
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(signInWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should display error message when sign in fails', async () => {
      (signInWithEmail as any).mockRejectedValue(new Error('Invalid credentials'));
      
      render(<AuthScreen onClose={mockOnClose} />);
      
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const form = emailInput.closest('form')!;
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrong' } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });
  });

  describe('Sign Up Flow', () => {
    it('should switch to sign up form when sign up tab is clicked', () => {
      render(<AuthScreen onClose={mockOnClose} />);
      
      const tabs = screen.getAllByText('Sign Up');
      const signUpTab = tabs.find(el => el.classList.contains('auth-tab'));
      fireEvent.click(signUpTab!);
      
      const activeTabs = screen.getAllByText('Sign Up');
      expect(activeTabs[0]).toHaveClass('active');
      expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
    });

    it('should call signUpWithEmail when sign up form is submitted', async () => {
      (signUpWithEmail as any).mockResolvedValue({ uid: 'test-uid' });
      
      render(<AuthScreen onClose={mockOnClose} />);
      
      // Switch to sign up
      const tabs = screen.getAllByText('Sign Up');
      const signUpTab = tabs.find(el => el.classList.contains('auth-tab'));
      fireEvent.click(signUpTab!);
      
      const nameInput = screen.getByPlaceholderText('Your name');
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const form = emailInput.closest('form')!;
      
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(signUpWithEmail).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User');
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should display error message when sign up fails', async () => {
      (signUpWithEmail as any).mockRejectedValue(new Error('Email already in use'));
      
      render(<AuthScreen onClose={mockOnClose} />);
      
      // Switch to sign up
      const tabs = screen.getAllByText('Sign Up');
      const signUpTab = tabs.find(el => el.classList.contains('auth-tab'));
      fireEvent.click(signUpTab!);
      
      const nameInput = screen.getByPlaceholderText('Your name');
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const form = emailInput.closest('form')!;
      
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText('Email already in use')).toBeInTheDocument();
      });
    });
  });

  describe('Google Sign In', () => {
    it('should call signInWithGoogle when Google button is clicked', async () => {
      (signInWithGoogle as any).mockResolvedValue({ uid: 'test-uid' });
      
      render(<AuthScreen onClose={mockOnClose} />);
      
      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      fireEvent.click(googleButton);
      
      await waitFor(() => {
        expect(signInWithGoogle).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should display error message when Google sign in fails', async () => {
      (signInWithGoogle as any).mockRejectedValue(new Error('Google sign-in cancelled'));
      
      render(<AuthScreen onClose={mockOnClose} />);
      
      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      fireEvent.click(googleButton);
      
      await waitFor(() => {
        expect(screen.getByText('Google sign-in cancelled')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should disable buttons and show loading text during authentication', async () => {
      (signInWithEmail as any).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<AuthScreen onClose={mockOnClose} />);
      
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const form = emailInput.closest('form')!;
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.submit(form);
      
      expect(screen.getByText('Please wait...')).toBeInTheDocument();
      const submitButtons = screen.getAllByRole('button');
      const formSubmitButton = submitButtons.find(btn => btn.textContent === 'Please wait...');
      expect(formSubmitButton).toBeDisabled();
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });
});

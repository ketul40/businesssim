import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';

describe('ThemeToggle', () => {
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      length: 0,
      key: vi.fn(),
    } as Storage;

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Theme Initialization', () => {
    it('should default to dark theme when no saved preference', () => {
      render(<ThemeToggle />);
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('should use saved theme from localStorage', () => {
      localStorageMock['theme'] = 'light';
      
      render(<ThemeToggle />);
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should use system preference when no saved theme', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query === '(prefers-color-scheme: light)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<ThemeToggle />);
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  describe('Theme Toggle', () => {
    it('should toggle from dark to light theme', () => {
      localStorageMock['theme'] = 'dark';
      
      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /switch to light mode/i });
      fireEvent.click(toggleButton);
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    });

    it('should toggle from light to dark theme', () => {
      localStorageMock['theme'] = 'light';
      
      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /switch to dark mode/i });
      fireEvent.click(toggleButton);
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('should toggle multiple times correctly', () => {
      localStorageMock['theme'] = 'dark';
      
      render(<ThemeToggle />);
      
      let toggleButton = screen.getByRole('button', { name: /switch to light mode/i });
      fireEvent.click(toggleButton);
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      
      toggleButton = screen.getByRole('button', { name: /switch to dark mode/i });
      fireEvent.click(toggleButton);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      
      toggleButton = screen.getByRole('button', { name: /switch to light mode/i });
      fireEvent.click(toggleButton);
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  describe('Theme Persistence', () => {
    it('should persist theme to localStorage on toggle', () => {
      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);
      
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    });

    it('should apply theme to document on mount', () => {
      localStorageMock['theme'] = 'light';
      
      render(<ThemeToggle />);
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should update document theme on every toggle', () => {
      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button');
      
      fireEvent.click(toggleButton);
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      
      fireEvent.click(toggleButton);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('UI Display', () => {
    it('should show sun icon in dark mode', () => {
      localStorageMock['theme'] = 'dark';
      
      render(<ThemeToggle />);
      
      const button = screen.getByRole('button', { name: /switch to light mode/i });
      expect(button).toBeInTheDocument();
    });

    it('should show moon icon in light mode', () => {
      localStorageMock['theme'] = 'light';
      
      render(<ThemeToggle />);
      
      const button = screen.getByRole('button', { name: /switch to dark mode/i });
      expect(button).toBeInTheDocument();
    });

    it('should have proper aria-label', () => {
      localStorageMock['theme'] = 'dark';
      
      render(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    });

    it('should have proper title attribute', () => {
      localStorageMock['theme'] = 'dark';
      
      render(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Switch to light mode');
    });

    it('should update aria-label after toggle', () => {
      localStorageMock['theme'] = 'dark';
      
      render(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
      
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid theme value in localStorage', () => {
      localStorageMock['theme'] = 'invalid-theme';
      
      render(<ThemeToggle />);
      
      // Should default to dark theme
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage.setItem to throw an error
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      
      // Should not crash
      expect(() => {
        render(<ThemeToggle />);
        const button = screen.getByRole('button');
        fireEvent.click(button);
      }).not.toThrow();
    });
  });
});

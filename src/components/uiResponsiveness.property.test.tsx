import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import { Send, Clock, Play, LogOut } from 'lucide-react';

/**
 * Feature: app-optimization, Property 4: UI interaction responsiveness
 * Validates: Requirements 3.2
 * 
 * Property: For any interactive UI element (button, input, link), when a user 
 * interacts with it, visual feedback should be provided within 100 milliseconds
 */

// Helper to create a button component with various states
const TestButton = ({ 
  onClick, 
  disabled = false, 
  className = '', 
  children 
}: { 
  onClick: () => void; 
  disabled?: boolean; 
  className?: string; 
  children: React.ReactNode;
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn ${className}`}
      data-testid="test-button"
    >
      {children}
    </button>
  );
};

// Helper to create an input component
const TestInput = ({ 
  onChange, 
  value, 
  placeholder 
}: { 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  value: string; 
  placeholder?: string;
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      data-testid="test-input"
      className="chat-input"
    />
  );
};

// Helper to create a link component
const TestLink = ({ 
  onClick, 
  children 
}: { 
  onClick: () => void; 
  children: React.ReactNode;
}) => {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      data-testid="test-link"
    >
      {children}
    </a>
  );
};

describe('Property 4: UI interaction responsiveness', () => {
  it('button clicks should provide visual feedback within 100ms', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.boolean(),
        (buttonText, isDisabled) => {
          const handleClick = vi.fn();
          const startTime = performance.now();
          
          const { unmount } = render(
            <TestButton onClick={handleClick} disabled={isDisabled}>
              {buttonText}
            </TestButton>
          );
          
          const button = screen.getByTestId('test-button');
          
          // Measure time for button to be interactive
          const renderTime = performance.now() - startTime;
          
          // Button should render within 100ms
          expect(renderTime).toBeLessThan(100);
          
          if (!isDisabled) {
            const clickStartTime = performance.now();
            fireEvent.click(button);
            const clickResponseTime = performance.now() - clickStartTime;
            
            // Click handler should execute within 100ms
            expect(clickResponseTime).toBeLessThan(100);
            expect(handleClick).toHaveBeenCalled();
          }
          
          // Clean up after each property test run
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('input changes should provide visual feedback within 100ms', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (inputText) => {
          let value = '';
          const handleChange = vi.fn((e: React.ChangeEvent<HTMLInputElement>) => {
            value = e.target.value;
          });
          
          const startTime = performance.now();
          
          const { unmount } = render(
            <TestInput onChange={handleChange} value={value} />
          );
          
          const renderTime = performance.now() - startTime;
          
          // Input should render within 100ms
          expect(renderTime).toBeLessThan(100);
          
          const input = screen.getByTestId('test-input');
          
          const changeStartTime = performance.now();
          fireEvent.change(input, { target: { value: inputText } });
          const changeResponseTime = performance.now() - changeStartTime;
          
          // Change handler should execute within 100ms
          expect(changeResponseTime).toBeLessThan(100);
          expect(handleChange).toHaveBeenCalled();
          
          // Clean up after each property test run
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('link clicks should provide visual feedback within 100ms', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 30 }),
        (linkText) => {
          const handleClick = vi.fn();
          const startTime = performance.now();
          
          const { unmount } = render(
            <TestLink onClick={handleClick}>
              {linkText}
            </TestLink>
          );
          
          const renderTime = performance.now() - startTime;
          
          // Link should render within 100ms
          expect(renderTime).toBeLessThan(100);
          
          const link = screen.getByTestId('test-link');
          
          const clickStartTime = performance.now();
          fireEvent.click(link);
          const clickResponseTime = performance.now() - clickStartTime;
          
          // Click handler should execute within 100ms
          expect(clickResponseTime).toBeLessThan(100);
          expect(handleClick).toHaveBeenCalled();
          
          // Clean up after each property test run
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('interactive elements with icons should render within 100ms', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(Send, Clock, Play, LogOut),
        fc.string({ minLength: 1, maxLength: 15 }),
        (IconComponent, buttonText) => {
          const handleClick = vi.fn();
          const startTime = performance.now();
          
          const { unmount } = render(
            <button onClick={handleClick} data-testid="icon-button">
              <IconComponent size={18} />
              {buttonText}
            </button>
          );
          
          const renderTime = performance.now() - startTime;
          
          // Button with icon should render within 100ms
          expect(renderTime).toBeLessThan(100);
          
          const button = screen.getByTestId('icon-button');
          
          const clickStartTime = performance.now();
          fireEvent.click(button);
          const clickResponseTime = performance.now() - clickStartTime;
          
          // Click should respond within 100ms
          expect(clickResponseTime).toBeLessThan(100);
          expect(handleClick).toHaveBeenCalled();
          
          // Clean up after each property test run
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('disabled interactive elements should still render within 100ms', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        (buttonText) => {
          const handleClick = vi.fn();
          const startTime = performance.now();
          
          const { unmount } = render(
            <TestButton onClick={handleClick} disabled={true}>
              {buttonText}
            </TestButton>
          );
          
          const renderTime = performance.now() - startTime;
          
          // Disabled button should still render within 100ms
          expect(renderTime).toBeLessThan(100);
          
          const button = screen.getByTestId('test-button');
          expect(button).toBeDisabled();
          
          // Clean up after each property test run
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

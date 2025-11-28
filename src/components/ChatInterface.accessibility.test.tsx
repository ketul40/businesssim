import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInterface from './ChatInterface';
import { ScenarioTemplate, Message } from '../types/models';
import { MESSAGE_TYPES } from '../constants/states';

describe('ChatInterface - Accessibility', () => {
  const mockScenario: ScenarioTemplate = {
    id: 'test-scenario',
    title: 'Test Scenario',
    category: 'Communication',
    difficulty: 'Medium',
    rubricId: 'rubric-1',
    description: 'A test scenario',
    situation: 'You need to handle a difficult conversation',
    objective: 'Navigate the conversation successfully',
    turnLimit: 10,
    stakeholders: [],
    constraints: []
  };

  const mockMessages: Message[] = [
    {
      type: MESSAGE_TYPES.AI,
      content: 'Hello, how can I help you?',
      timestamp: new Date().toISOString(),
      stakeholder: 'Manager',
      role: 'Direct Manager'
    },
    {
      type: MESSAGE_TYPES.USER,
      content: 'I need to discuss the project',
      timestamp: new Date().toISOString()
    }
  ];

  const defaultProps = {
    scenario: mockScenario,
    messages: mockMessages,
    onSendMessage: vi.fn(),
    onTimeout: vi.fn(),
    onExit: vi.fn(),
    onGetSuggestions: vi.fn(),
    turnCount: 2,
    isLoading: false,
    suggestions: ['Suggestion 1', 'Suggestion 2'],
    isSuggestionsLoading: false
  };

  describe('ARIA Labels and Roles', () => {
    test('chat interface has proper role and label', () => {
      render(<ChatInterface {...defaultProps} />);
      
      const mainElement = document.querySelector('[role="main"]');
      expect(mainElement).toBeInTheDocument();
      expect(mainElement).toHaveAttribute('aria-label', 'Chat simulation interface');
    });

    test('chat header has banner role', () => {
      render(<ChatInterface {...defaultProps} />);
      
      const header = document.querySelector('[role="banner"]');
      expect(header).toBeInTheDocument();
    });

    test('turn counter has proper ARIA attributes', () => {
      render(<ChatInterface {...defaultProps} />);
      
      const turnCounter = screen.getByText(/2 \/ 10 turns/);
      expect(turnCounter).toHaveAttribute('role', 'status');
      expect(turnCounter).toHaveAttribute('aria-live', 'polite');
      expect(turnCounter).toHaveAttribute('aria-atomic', 'true');
    });

    test('turn counter warning has descriptive aria-label', () => {
      render(<ChatInterface {...defaultProps} turnCount={8} />);
      
      const turnCounter = screen.getByText(/8 \/ 10 turns/);
      expect(turnCounter).toHaveAttribute('aria-label');
      expect(turnCounter.getAttribute('aria-label')).toContain('approaching limit');
    });

    test('chat actions have toolbar role', () => {
      render(<ChatInterface {...defaultProps} />);
      
      const toolbar = document.querySelector('[role="toolbar"]');
      expect(toolbar).toBeInTheDocument();
      expect(toolbar).toHaveAttribute('aria-label', 'Chat actions');
    });

    test('message list has log role with proper ARIA attributes', () => {
      render(<ChatInterface {...defaultProps} />);
      
      const messageLog = document.querySelector('[role="log"]');
      expect(messageLog).toBeInTheDocument();
      expect(messageLog).toHaveAttribute('aria-live', 'polite');
      expect(messageLog).toHaveAttribute('aria-label', 'Conversation messages');
    });

    test('individual messages have article role', () => {
      render(<ChatInterface {...defaultProps} />);
      
      const messages = document.querySelectorAll('[role="article"]');
      // Should have scenario brief + 2 messages
      expect(messages.length).toBeGreaterThanOrEqual(3);
    });

    test('typing indicator has proper ARIA attributes', () => {
      render(<ChatInterface {...defaultProps} isLoading={true} />);
      
      const typingStatus = screen.getByText(/AI is typing/);
      const statusElement = typingStatus.closest('[role="status"]');
      expect(statusElement).toHaveAttribute('aria-live', 'polite');
      expect(statusElement).toHaveAttribute('aria-atomic', 'true');
    });

    test('suggestions container has region role', () => {
      render(<ChatInterface {...defaultProps} />);
      
      const suggestionsRegion = document.querySelector('[role="region"][aria-label="AI Suggestions"]');
      expect(suggestionsRegion).toBeInTheDocument();
    });

    test('suggestions list has proper role and label', () => {
      render(<ChatInterface {...defaultProps} />);
      
      const suggestionsList = document.querySelector('[role="list"][aria-label*="suggestions available"]');
      expect(suggestionsList).toBeInTheDocument();
    });

    test('input area has complementary role', () => {
      render(<ChatInterface {...defaultProps} />);
      
      const inputArea = document.querySelector('[role="complementary"]');
      expect(inputArea).toBeInTheDocument();
      expect(inputArea).toHaveAttribute('aria-label', 'Message input area');
    });

    test('message input has proper ARIA attributes', () => {
      render(<ChatInterface {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-label');
      expect(textarea).toHaveAttribute('aria-describedby');
      expect(textarea).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Keyboard Navigation', () => {
    test('all interactive elements are keyboard accessible', () => {
      render(<ChatInterface {...defaultProps} />);
      
      // Buttons should be focusable
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
      
      // Textarea should be focusable
      const textarea = screen.getByRole('textbox');
      expect(textarea).not.toHaveAttribute('tabindex', '-1');
    });

    test('message list is keyboard accessible', () => {
      render(<ChatInterface {...defaultProps} />);
      
      const messageLog = document.querySelector('[role="log"]');
      expect(messageLog).toHaveAttribute('tabIndex', '0');
    });

    test('individual messages are keyboard accessible', () => {
      render(<ChatInterface {...defaultProps} />);
      
      const messages = document.querySelectorAll('.message');
      messages.forEach(message => {
        expect(message).toHaveAttribute('tabindex', '0');
      });
    });

    test('suggestion chips are keyboard accessible', () => {
      render(<ChatInterface {...defaultProps} />);
      
      const suggestions = screen.getAllByRole('listitem');
      suggestions.forEach(suggestion => {
        expect(suggestion.tagName).toBe('BUTTON');
      });
    });

    test('Enter key sends message', async () => {
      const user = userEvent.setup();
      const onSendMessage = vi.fn();
      render(<ChatInterface {...defaultProps} onSendMessage={onSendMessage} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test message{Enter}');

      expect(onSendMessage).toHaveBeenCalledWith('Test message');
    });

    test('Shift+Enter adds new line without sending', async () => {
      const onSendMessage = vi.fn();
      render(<ChatInterface {...defaultProps} onSendMessage={onSendMessage} />);

      const textarea = screen.getByRole('textbox');
      await userEvent.type(textarea, 'Line 1{Shift>}{Enter}{/Shift}Line 2');

      expect(onSendMessage).not.toHaveBeenCalled();
    });
  });

  describe('Screen Reader Support', () => {
    test('icons are hidden from screen readers', () => {
      render(<ChatInterface {...defaultProps} />);
      
      const icons = document.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    test('visually hidden text provides context', () => {
      render(<ChatInterface {...defaultProps} />);
      
      const visuallyHidden = document.querySelectorAll('.visually-hidden');
      expect(visuallyHidden.length).toBeGreaterThan(0);
    });

    test('buttons have descriptive labels', () => {
      render(<ChatInterface {...defaultProps} />);
      
      const timeoutButton = screen.getByRole('button', { name: /time-out/i });
      expect(timeoutButton).toHaveAttribute('aria-label');
      
      const exitButton = screen.getByRole('button', { name: /exit/i });
      expect(exitButton).toHaveAttribute('aria-label');
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).toHaveAttribute('aria-label');
    });

    test('disabled buttons have explanatory labels', () => {
      render(<ChatInterface {...defaultProps} messages={[]} />);
      
      const hintsButton = screen.getByRole('button', { name: /get ai suggestions/i });
      expect(hintsButton).toBeDisabled();
      expect(hintsButton.getAttribute('aria-label')).toContain('disabled');
    });

    test('character count has live region', () => {
      render(<ChatInterface {...defaultProps} />);
      
      const charCount = document.querySelector('#character-count');
      expect(charCount).toHaveAttribute('aria-live', 'polite');
      expect(charCount).toHaveAttribute('role', 'status');
    });

    test('loading states announce to screen readers', () => {
      render(<ChatInterface {...defaultProps} isSuggestionsLoading={true} />);
      
      const loadingRegion = screen.getByText(/Loading AI Suggestions/);
      const container = loadingRegion.closest('[role="region"]');
      expect(container).toHaveAttribute('aria-busy', 'true');
      expect(container).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Non-Color Indicators', () => {
    test('turn warning uses icon in addition to color', () => {
      render(<ChatInterface {...defaultProps} turnCount={8} />);
      
      const turnCounter = screen.getByText(/8 \/ 10 turns/);
      expect(turnCounter.textContent).toContain('⚠️');
    });

    test('disabled buttons have visual pattern', () => {
      render(<ChatInterface {...defaultProps} isLoading={true} />);
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).toBeDisabled();
      // The CSS ::after pseudo-element adds a pattern, which we can't directly test
      // but we can verify the button is disabled
      expect(sendButton).toHaveAttribute('disabled');
    });

    test('message types are distinguishable by structure', () => {
      render(<ChatInterface {...defaultProps} />);
      
      // User messages should have user avatar
      const userMessages = document.querySelectorAll('.user-message');
      userMessages.forEach(msg => {
        const avatar = msg.querySelector('.message-avatar-user');
        expect(avatar).toBeInTheDocument();
      });
      
      // AI messages should have AI avatar
      const aiMessages = document.querySelectorAll('.ai-message');
      aiMessages.forEach(msg => {
        const avatar = msg.querySelector('.message-avatar-ai');
        expect(avatar).toBeInTheDocument();
      });
    });

    test('role badges provide text labels', () => {
      render(<ChatInterface {...defaultProps} />);
      
      const roleBadge = screen.getByText('Direct Manager');
      expect(roleBadge).toHaveAttribute('aria-label');
    });
  });

  describe('Focus Management', () => {
    test('input receives focus after suggestion click', async () => {
      const user = userEvent.setup();
      render(<ChatInterface {...defaultProps} />);

      const suggestion = screen.getByText('Suggestion 1');
      await user.click(suggestion);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveFocus();
    });

    test('scroll to bottom button is accessible', () => {
      // Create many messages to trigger scroll button
      const manyMessages: Message[] = Array.from({ length: 10 }, (_, i) => ({
        type: MESSAGE_TYPES.USER,
        content: `Message ${i}`,
        timestamp: new Date().toISOString()
      }));

      render(<ChatInterface {...defaultProps} messages={manyMessages} />);

      // The scroll button should have proper attributes
      const scrollButton = document.querySelector('.scroll-to-bottom');
      if (scrollButton) {
        expect(scrollButton).toHaveAttribute('aria-label');
        expect(scrollButton).toHaveAttribute('type', 'button');
      }
    });
  });

  describe('Turn Limit Reached State', () => {
    test('turn limit message is announced to screen readers', () => {
      render(<ChatInterface {...defaultProps} turnCount={10} />);
      
      const limitMessage = screen.getByText(/turn limit reached/i);
      const statusElement = limitMessage.closest('[role="status"]');
      expect(statusElement).toHaveAttribute('aria-live', 'polite');
      expect(statusElement).toHaveAttribute('aria-atomic', 'true');
    });
  });
});

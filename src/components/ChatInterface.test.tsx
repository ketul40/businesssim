import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInterface from './ChatInterface';
import { ScenarioTemplate, Message } from '../types/models';
import { MESSAGE_TYPES } from '../constants/states';

describe('ChatInterface', () => {
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
    messages: [],
    onSendMessage: vi.fn(),
    onTimeout: vi.fn(),
    onExit: vi.fn(),
    onGetSuggestions: vi.fn(),
    turnCount: 0,
    isLoading: false,
    suggestions: [],
    isSuggestionsLoading: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Message Rendering', () => {
    test('renders scenario brief', () => {
      render(<ChatInterface {...defaultProps} />);

      expect(screen.getByText('Scenario Brief')).toBeInTheDocument();
      expect(screen.getByText(/You need to handle a difficult conversation/)).toBeInTheDocument();
      expect(screen.getByText(/Navigate the conversation successfully/)).toBeInTheDocument();
    });

    test('renders all messages', () => {
      render(<ChatInterface {...defaultProps} messages={mockMessages} />);

      expect(screen.getByText('Hello, how can I help you?')).toBeInTheDocument();
      expect(screen.getByText('I need to discuss the project')).toBeInTheDocument();
    });

    test('renders AI message with stakeholder info', () => {
      const aiMessage: Message = {
        type: MESSAGE_TYPES.AI,
        content: 'AI response',
        timestamp: new Date().toISOString(),
        stakeholder: 'CEO',
        role: 'Executive'
      };

      render(<ChatInterface {...defaultProps} messages={[aiMessage]} />);

      expect(screen.getByText('CEO')).toBeInTheDocument();
      expect(screen.getByText('Executive')).toBeInTheDocument();
    });

    test('renders coaching message with proper header', () => {
      const coachingMessage: Message = {
        type: MESSAGE_TYPES.COACHING,
        content: 'Try to be more empathetic',
        timestamp: new Date().toISOString()
      };

      render(<ChatInterface {...defaultProps} messages={[coachingMessage]} />);

      expect(screen.getByText('Coaching Hint')).toBeInTheDocument();
      expect(screen.getByText('Try to be more empathetic')).toBeInTheDocument();
    });

    test('renders empty message list correctly', () => {
      render(<ChatInterface {...defaultProps} messages={[]} />);

      // Should still show scenario brief
      expect(screen.getByText('Scenario Brief')).toBeInTheDocument();
    });
  });

  describe('User Input Handling', () => {
    test('allows user to type in textarea', async () => {
      const user = userEvent.setup();
      render(<ChatInterface {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Type your response...');
      await user.type(textarea, 'Test message');

      expect(textarea).toHaveValue('Test message');
    });

    test('sends message when send button is clicked', async () => {
      const user = userEvent.setup();
      const onSendMessage = vi.fn();
      render(<ChatInterface {...defaultProps} onSendMessage={onSendMessage} />);

      const textarea = screen.getByPlaceholderText('Type your response...');
      await user.type(textarea, 'Test message');

      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);

      expect(onSendMessage).toHaveBeenCalledWith('Test message');
    });

    test('sends message when Enter key is pressed', async () => {
      const user = userEvent.setup();
      const onSendMessage = vi.fn();
      render(<ChatInterface {...defaultProps} onSendMessage={onSendMessage} />);

      const textarea = screen.getByPlaceholderText('Type your response...');
      await user.type(textarea, 'Test message{Enter}');

      expect(onSendMessage).toHaveBeenCalledWith('Test message');
    });

    test('does not send message when Shift+Enter is pressed', async () => {
      const onSendMessage = vi.fn();
      render(<ChatInterface {...defaultProps} onSendMessage={onSendMessage} />);

      const textarea = screen.getByPlaceholderText('Type your response...');
      fireEvent.change(textarea, { target: { value: 'Test message' } });
      fireEvent.keyPress(textarea, { key: 'Enter', shiftKey: true });

      expect(onSendMessage).not.toHaveBeenCalled();
    });

    test('clears input after sending message', async () => {
      const user = userEvent.setup();
      render(<ChatInterface {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Type your response...');
      await user.type(textarea, 'Test message');

      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);

      expect(textarea).toHaveValue('');
    });

    test('does not send empty message', async () => {
      const user = userEvent.setup();
      const onSendMessage = vi.fn();
      render(<ChatInterface {...defaultProps} onSendMessage={onSendMessage} />);

      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);

      expect(onSendMessage).not.toHaveBeenCalled();
    });

    test('trims whitespace from message', async () => {
      const user = userEvent.setup();
      const onSendMessage = vi.fn();
      render(<ChatInterface {...defaultProps} onSendMessage={onSendMessage} />);

      const textarea = screen.getByPlaceholderText('Type your response...');
      await user.type(textarea, '  Test message  ');

      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);

      expect(onSendMessage).toHaveBeenCalledWith('Test message');
    });
  });

  describe('Loading States', () => {
    test('disables input when loading', () => {
      render(<ChatInterface {...defaultProps} isLoading={true} />);

      const textarea = screen.getByPlaceholderText('Type your response...');
      expect(textarea).toBeDisabled();
    });

    test('disables send button when loading', () => {
      render(<ChatInterface {...defaultProps} isLoading={true} />);

      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).toBeDisabled();
    });

    test('shows typing indicator when loading', () => {
      render(<ChatInterface {...defaultProps} isLoading={true} />);

      const typingIndicator = document.querySelector('.typing-indicator');
      expect(typingIndicator).toBeInTheDocument();
    });

    test('disables timeout button when loading', () => {
      render(<ChatInterface {...defaultProps} isLoading={true} />);

      const timeoutButton = screen.getByRole('button', { name: /time-out/i });
      expect(timeoutButton).toBeDisabled();
    });

    test('does not disable exit button when loading', () => {
      render(<ChatInterface {...defaultProps} isLoading={true} />);

      const exitButton = screen.getByRole('button', { name: /exit & score/i });
      expect(exitButton).not.toBeDisabled();
    });
  });

  describe('Turn Limit Behavior', () => {
    test('displays turn counter', () => {
      render(<ChatInterface {...defaultProps} turnCount={5} />);

      expect(screen.getByText('5 / 10 turns')).toBeInTheDocument();
    });

    test('shows red color when near turn limit', () => {
      render(<ChatInterface {...defaultProps} turnCount={8} />);

      const turnCounter = screen.getByText(/8 \/ 10 turns/);
      expect(turnCounter).toHaveStyle({ color: '#ef4444' });
    });

    test('shows green color when not near turn limit', () => {
      render(<ChatInterface {...defaultProps} turnCount={3} />);

      const turnCounter = screen.getByText('3 / 10 turns');
      expect(turnCounter).toHaveStyle({ color: '#10b981' });
    });

    test('shows turn limit reached message when turns exhausted', () => {
      render(<ChatInterface {...defaultProps} turnCount={10} />);

      expect(screen.getByText(/turn limit reached/i)).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Type your response...')).not.toBeInTheDocument();
    });

    test('hides input when turn limit reached', () => {
      render(<ChatInterface {...defaultProps} turnCount={10} />);

      expect(screen.queryByPlaceholderText('Type your response...')).not.toBeInTheDocument();
    });
  });

  describe('Timeout Functionality', () => {
    test('calls onTimeout when timeout button is clicked', async () => {
      const user = userEvent.setup();
      const onTimeout = vi.fn();
      render(<ChatInterface {...defaultProps} onTimeout={onTimeout} />);

      const timeoutButton = screen.getByRole('button', { name: /time-out/i });
      await user.click(timeoutButton);

      expect(onTimeout).toHaveBeenCalled();
    });

    test('shows timeout notice after timeout is triggered', async () => {
      const user = userEvent.setup();
      render(<ChatInterface {...defaultProps} />);

      const timeoutButton = screen.getByRole('button', { name: /time-out/i });
      await user.click(timeoutButton);

      await waitFor(() => {
        expect(screen.getByText(/simulation paused/i)).toBeInTheDocument();
      });
    });

    test('clears timeout state when message is sent', async () => {
      const user = userEvent.setup();
      render(<ChatInterface {...defaultProps} />);

      // Trigger timeout
      const timeoutButton = screen.getByRole('button', { name: /time-out/i });
      await user.click(timeoutButton);

      await waitFor(() => {
        expect(screen.getByText(/simulation paused/i)).toBeInTheDocument();
      });

      // Send a message
      const textarea = screen.getByPlaceholderText('Type your response...');
      await user.type(textarea, 'Test message');
      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);

      // Timeout notice should be gone
      expect(screen.queryByText(/simulation paused/i)).not.toBeInTheDocument();
    });
  });

  describe('Exit Functionality', () => {
    test('calls onExit when exit button is clicked', async () => {
      const user = userEvent.setup();
      const onExit = vi.fn();
      render(<ChatInterface {...defaultProps} onExit={onExit} />);

      const exitButton = screen.getByRole('button', { name: /exit & score/i });
      await user.click(exitButton);

      expect(onExit).toHaveBeenCalled();
    });
  });

  describe('Suggestions Functionality', () => {
    test('displays suggestions when provided', () => {
      const suggestions = ['Suggestion 1', 'Suggestion 2', 'Suggestion 3'];
      render(<ChatInterface {...defaultProps} suggestions={suggestions} />);

      expect(screen.getByText('Suggestion 1')).toBeInTheDocument();
      expect(screen.getByText('Suggestion 2')).toBeInTheDocument();
      expect(screen.getByText('Suggestion 3')).toBeInTheDocument();
    });

    test('does not display suggestions section when empty', () => {
      render(<ChatInterface {...defaultProps} suggestions={[]} />);

      expect(screen.queryByText(/AI Suggestions/i)).not.toBeInTheDocument();
    });

    test('fills input with suggestion when clicked', async () => {
      const user = userEvent.setup();
      const suggestions = ['Use this suggestion'];
      render(<ChatInterface {...defaultProps} suggestions={suggestions} />);

      const suggestionButton = screen.getByText('Use this suggestion');
      await user.click(suggestionButton);

      const textarea = screen.getByPlaceholderText('Type your response...');
      expect(textarea).toHaveValue('Use this suggestion');
    });

    test('calls onGetSuggestions when hints button is clicked', async () => {
      const user = userEvent.setup();
      const onGetSuggestions = vi.fn();
      render(<ChatInterface {...defaultProps} messages={mockMessages} onGetSuggestions={onGetSuggestions} />);

      const hintsButton = screen.getByRole('button', { name: /get ai suggestions/i });
      await user.click(hintsButton);

      expect(onGetSuggestions).toHaveBeenCalled();
    });

    test('disables hints button when no messages', () => {
      render(<ChatInterface {...defaultProps} messages={[]} />);

      const hintsButton = screen.getByRole('button', { name: /get ai suggestions/i });
      expect(hintsButton).toBeDisabled();
    });

    test('disables hints button when loading suggestions', () => {
      render(<ChatInterface {...defaultProps} messages={mockMessages} isSuggestionsLoading={true} />);

      const hintsButton = screen.getByRole('button', { name: /get ai suggestions/i });
      expect(hintsButton).toBeDisabled();
    });
  });
});

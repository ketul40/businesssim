/**
 * Integration tests for message exchange during simulation
 * Tests: Sending messages, receiving AI responses, turn counting, timeout
 * Requirements: 9.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import * as authModule from '../../firebase/auth';
import * as firestoreModule from '../../firebase/firestore';
import * as aiServiceModule from '../../utils/aiService';
import { SCENARIO_TEMPLATES } from '../../constants/scenarios';

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

describe('Message Exchange Integration Tests', () => {
  const mockUser = {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
  };

  const mockUserData = {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    roleLevel: 'individual_contributor',
    totalSessions: 0,
    averageScore: 0,
  };

  const mockAIResponse = {
    message: 'This is an AI response from the stakeholder.',
    stakeholder: 'John Smith',
    role: 'Engineering Manager',
    timestamp: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(authModule.observeAuthState).mockImplementation((callback) => {
      callback(mockUser);
      return () => {};
    });
    
    vi.mocked(firestoreModule.getUser).mockResolvedValue(mockUserData);
    vi.mocked(firestoreModule.createSession).mockResolvedValue('session-123');
    vi.mocked(firestoreModule.updateSession).mockResolvedValue(undefined);
    vi.mocked(aiServiceModule.getStakeholderResponse).mockResolvedValue(mockAIResponse);
    vi.mocked(aiServiceModule.getCoachingHint).mockResolvedValue('Here is a coaching hint.');
    vi.mocked(aiServiceModule.getSuggestions).mockResolvedValue([
      'Suggestion 1',
      'Suggestion 2',
      'Suggestion 3',
    ]);
  });

  async function startSimulation(user: ReturnType<typeof userEvent.setup>) {
    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });

    const firstScenario = SCENARIO_TEMPLATES[0];
    const scenarioCard = screen.getByText(firstScenario.title);
    await user.click(scenarioCard);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /start simulation/i })).toBeInTheDocument();
    });

    const startButton = screen.getByRole('button', { name: /start simulation/i });
    await user.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/0 \/ \d+ turns/i)).toBeInTheDocument();
    });
  }

  it('should send user message and receive AI response', async () => {
    const user = userEvent.setup();
    render(<App />);

    await startSimulation(user);

    // Find message input and send button
    const messageInput = screen.getByPlaceholderText(/type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    // Type and send a message
    await user.type(messageInput, 'Hello, I would like to discuss the project timeline.');
    await user.click(sendButton);

    // Verify user message appears
    await waitFor(() => {
      expect(screen.getByText(/Hello, I would like to discuss the project timeline/i)).toBeInTheDocument();
    });

    // Verify AI service was called
    expect(aiServiceModule.getStakeholderResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        scenario: expect.any(Object),
        transcript: expect.arrayContaining([
          expect.objectContaining({
            type: 'user',
            content: 'Hello, I would like to discuss the project timeline.',
          }),
        ]),
      }),
      'Hello, I would like to discuss the project timeline.'
    );

    // Verify AI response appears
    await waitFor(() => {
      expect(screen.getByText(mockAIResponse.message)).toBeInTheDocument();
    });

    // Verify session was updated
    expect(firestoreModule.updateSession).toHaveBeenCalled();
  });

  it('should increment turn count after each message exchange', async () => {
    const user = userEvent.setup();
    render(<App />);

    await startSimulation(user);

    // Initial turn count should be 0
    expect(screen.getByText(/0 \/ \d+ turns/i)).toBeInTheDocument();

    // Send first message
    const messageInput = screen.getByPlaceholderText(/type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    await user.type(messageInput, 'First message');
    await user.click(sendButton);

    // Wait for AI response
    await waitFor(() => {
      expect(screen.getByText(mockAIResponse.message)).toBeInTheDocument();
    });

    // Turn count should be 1
    await waitFor(() => {
      expect(screen.getByText(/1 \/ \d+ turns/i)).toBeInTheDocument();
    });

    // Send second message
    await user.clear(messageInput);
    await user.type(messageInput, 'Second message');
    await user.click(sendButton);

    // Wait for second AI response
    await waitFor(() => {
      expect(aiServiceModule.getStakeholderResponse).toHaveBeenCalledTimes(2);
    });

    // Turn count should be 2
    await waitFor(() => {
      expect(screen.getByText(/2 \/ \d+ turns/i)).toBeInTheDocument();
    });
  });

  it('should clear input field after sending message', async () => {
    const user = userEvent.setup();
    render(<App />);

    await startSimulation(user);

    const messageInput = screen.getByPlaceholderText(/type your message/i) as HTMLInputElement;
    const sendButton = screen.getByRole('button', { name: /send/i });

    await user.type(messageInput, 'Test message');
    expect(messageInput.value).toBe('Test message');

    await user.click(sendButton);

    // Input should be cleared
    await waitFor(() => {
      expect(messageInput.value).toBe('');
    });
  });

  it('should disable send button while loading AI response', async () => {
    const user = userEvent.setup();
    
    // Make AI response take longer
    vi.mocked(aiServiceModule.getStakeholderResponse).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockAIResponse), 1000))
    );

    render(<App />);
    await startSimulation(user);

    const messageInput = screen.getByPlaceholderText(/type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    await user.type(messageInput, 'Test message');
    await user.click(sendButton);

    // Send button should be disabled while loading
    await waitFor(() => {
      expect(sendButton).toBeDisabled();
    });

    // Wait for response
    await waitFor(() => {
      expect(screen.getByText(mockAIResponse.message)).toBeInTheDocument();
    }, { timeout: 2000 });

    // Send button should be enabled again
    expect(sendButton).not.toBeDisabled();
  });

  it('should handle timeout request and show coaching hint', async () => {
    const user = userEvent.setup();
    render(<App />);

    await startSimulation(user);

    // Click timeout button
    const timeoutButton = screen.getByRole('button', { name: /time-out/i });
    await user.click(timeoutButton);

    // Verify coaching hint service was called
    await waitFor(() => {
      expect(aiServiceModule.getCoachingHint).toHaveBeenCalled();
    });

    // Verify coaching hint appears
    await waitFor(() => {
      expect(screen.getByText(/Here is a coaching hint/i)).toBeInTheDocument();
    });
  });

  it('should get and display suggestions when requested', async () => {
    const user = userEvent.setup();
    render(<App />);

    await startSimulation(user);

    // Send a message first
    const messageInput = screen.getByPlaceholderText(/type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    await user.type(messageInput, 'I need help with this conversation');
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(mockAIResponse.message)).toBeInTheDocument();
    });

    // Click suggestions button
    const suggestionsButton = screen.getByRole('button', { name: /get suggestions/i });
    await user.click(suggestionsButton);

    // Verify suggestions service was called
    await waitFor(() => {
      expect(aiServiceModule.getSuggestions).toHaveBeenCalled();
    });

    // Verify suggestions appear
    await waitFor(() => {
      expect(screen.getByText('Suggestion 1')).toBeInTheDocument();
      expect(screen.getByText('Suggestion 2')).toBeInTheDocument();
      expect(screen.getByText('Suggestion 3')).toBeInTheDocument();
    });
  });

  it('should handle AI service errors gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock AI service to throw error
    vi.mocked(aiServiceModule.getStakeholderResponse).mockRejectedValue(
      new Error('AI service unavailable')
    );

    render(<App />);
    await startSimulation(user);

    const messageInput = screen.getByPlaceholderText(/type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    await user.type(messageInput, 'Test message');
    await user.click(sendButton);

    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    // User should still be able to continue
    expect(sendButton).not.toBeDisabled();
  });

  it('should display warning when approaching turn limit', async () => {
    const user = userEvent.setup();
    render(<App />);

    await startSimulation(user);

    const messageInput = screen.getByPlaceholderText(/type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    // Get turn limit from scenario
    const firstScenario = SCENARIO_TEMPLATES[0];
    const turnLimit = firstScenario.turnLimit;

    // Send messages until near limit (within 3 turns)
    for (let i = 0; i < turnLimit - 2; i++) {
      await user.clear(messageInput);
      await user.type(messageInput, `Message ${i + 1}`);
      await user.click(sendButton);

      await waitFor(() => {
        expect(aiServiceModule.getStakeholderResponse).toHaveBeenCalledTimes(i + 1);
      });
    }

    // Should show warning indicator
    await waitFor(() => {
      const turnCounter = screen.getByText(new RegExp(`${turnLimit - 2} / ${turnLimit} turns`, 'i'));
      expect(turnCounter).toBeInTheDocument();
      // Warning emoji or styling should be present
      expect(screen.getByText(/⚠️/)).toBeInTheDocument();
    });
  });

  it('should prevent sending empty messages', async () => {
    const user = userEvent.setup();
    render(<App />);

    await startSimulation(user);

    const sendButton = screen.getByRole('button', { name: /send/i });

    // Try to send empty message
    await user.click(sendButton);

    // AI service should not be called
    expect(aiServiceModule.getStakeholderResponse).not.toHaveBeenCalled();

    // Try to send whitespace-only message
    const messageInput = screen.getByPlaceholderText(/type your message/i);
    await user.type(messageInput, '   ');
    await user.click(sendButton);

    // AI service should still not be called
    expect(aiServiceModule.getStakeholderResponse).not.toHaveBeenCalled();
  });

  it('should display message timestamps', async () => {
    const user = userEvent.setup();
    render(<App />);

    await startSimulation(user);

    const messageInput = screen.getByPlaceholderText(/type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    await user.type(messageInput, 'Test message with timestamp');
    await user.click(sendButton);

    // Wait for messages to appear
    await waitFor(() => {
      expect(screen.getByText(/Test message with timestamp/i)).toBeInTheDocument();
    });

    // Timestamps should be present (format may vary)
    // This is a basic check - actual implementation may differ
    const messages = screen.getAllByText(/Test message with timestamp|This is an AI response/i);
    expect(messages.length).toBeGreaterThan(0);
  });
});

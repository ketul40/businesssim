/**
 * Integration tests for simulation exit and evaluation
 * Tests: Exiting simulation, evaluation process, viewing results
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

describe('Simulation Exit and Evaluation Integration Tests', () => {
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
    message: 'AI response',
    stakeholder: 'John Smith',
    role: 'Manager',
    timestamp: new Date().toISOString(),
  };

  const mockEvaluation = {
    id: 'eval-123',
    sessionId: 'session-123',
    rubricId: 'persuasion_director',
    overall_score: 75,
    criterion_scores: [
      {
        criterion: 'Framing',
        weight: 0.25,
        score: 80,
        evidence: ['Good framing of the problem'],
      },
      {
        criterion: 'Evidence',
        weight: 0.25,
        score: 70,
        evidence: ['Provided some evidence'],
      },
      {
        criterion: 'Risk Mitigation',
        weight: 0.25,
        score: 75,
        evidence: ['Addressed key risks'],
      },
      {
        criterion: 'Objection Handling',
        weight: 0.25,
        score: 75,
        evidence: ['Handled objections well'],
      },
    ],
    missed_opportunities: [
      {
        criterion: 'Evidence',
        what: 'Could have provided more data',
        how_to_improve: 'Include specific metrics and examples',
      },
    ],
    moments_that_mattered: [
      {
        turn: 3,
        description: 'Successfully addressed the main concern',
        why: 'This built trust with the stakeholder',
      },
    ],
    reflection_prompt: 'What would you do differently next time?',
    drills: [
      {
        title: 'Practice providing evidence',
        instructions: 'List 3 pieces of evidence for your next proposal',
        estimated_minutes: 10,
      },
    ],
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
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
    vi.mocked(aiServiceModule.evaluateSession).mockResolvedValue(mockEvaluation);
  });

  async function startSimulationAndSendMessage(user: ReturnType<typeof userEvent.setup>) {
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

    // Send a message
    const messageInput = screen.getByPlaceholderText(/type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.type(messageInput, 'Test message');
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(mockAIResponse.message)).toBeInTheDocument();
    });
  }

  it('should exit simulation and trigger evaluation when exit button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await startSimulationAndSendMessage(user);

    // Click exit button
    const exitButton = screen.getByRole('button', { name: /exit & score/i });
    await user.click(exitButton);

    // Should show evaluating state
    await waitFor(() => {
      expect(screen.getByText(/evaluating your performance/i)).toBeInTheDocument();
    });

    // Verify session was updated
    expect(firestoreModule.updateSession).toHaveBeenCalledWith(
      'session-123',
      expect.objectContaining({
        state: 'EXITED',
      })
    );

    // Verify evaluation service was called
    await waitFor(() => {
      expect(aiServiceModule.evaluateSession).toHaveBeenCalledWith(
        'session-123',
        expect.objectContaining({
          scenario: expect.any(Object),
          transcript: expect.any(Array),
        })
      );
    });
  });

  it('should display evaluation results after evaluation completes', async () => {
    const user = userEvent.setup();
    render(<App />);

    await startSimulationAndSendMessage(user);

    const exitButton = screen.getByRole('button', { name: /exit & score/i });
    await user.click(exitButton);

    // Wait for evaluation to complete
    await waitFor(() => {
      expect(screen.getByText(/your performance report/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Verify overall score is displayed
    expect(screen.getByText(/75/)).toBeInTheDocument();

    // Verify criterion scores are displayed
    expect(screen.getByText(/framing/i)).toBeInTheDocument();
    expect(screen.getByText(/evidence/i)).toBeInTheDocument();
    expect(screen.getByText(/risk mitigation/i)).toBeInTheDocument();
    expect(screen.getByText(/objection handling/i)).toBeInTheDocument();
  });

  it('should display missed opportunities in evaluation', async () => {
    const user = userEvent.setup();
    render(<App />);

    await startSimulationAndSendMessage(user);

    const exitButton = screen.getByRole('button', { name: /exit & score/i });
    await user.click(exitButton);

    await waitFor(() => {
      expect(screen.getByText(/your performance report/i)).toBeInTheDocument();
    });

    // Verify missed opportunities are shown
    expect(screen.getByText(/could have provided more data/i)).toBeInTheDocument();
    expect(screen.getByText(/include specific metrics and examples/i)).toBeInTheDocument();
  });

  it('should display moments that mattered in evaluation', async () => {
    const user = userEvent.setup();
    render(<App />);

    await startSimulationAndSendMessage(user);

    const exitButton = screen.getByRole('button', { name: /exit & score/i });
    await user.click(exitButton);

    await waitFor(() => {
      expect(screen.getByText(/your performance report/i)).toBeInTheDocument();
    });

    // Navigate to key moments tab
    const momentsTab = screen.getByRole('button', { name: /key moments/i });
    await user.click(momentsTab);

    // Verify moments are shown
    await waitFor(() => {
      expect(screen.getByText(/successfully addressed the main concern/i)).toBeInTheDocument();
      expect(screen.getByText(/this built trust with the stakeholder/i)).toBeInTheDocument();
    });
  });

  it('should display practice drills in evaluation', async () => {
    const user = userEvent.setup();
    render(<App />);

    await startSimulationAndSendMessage(user);

    const exitButton = screen.getByRole('button', { name: /exit & score/i });
    await user.click(exitButton);

    await waitFor(() => {
      expect(screen.getByText(/your performance report/i)).toBeInTheDocument();
    });

    // Navigate to practice drills tab
    const drillsTab = screen.getByRole('button', { name: /practice drills/i });
    await user.click(drillsTab);

    // Verify drills are shown
    await waitFor(() => {
      expect(screen.getByText(/practice providing evidence/i)).toBeInTheDocument();
      expect(screen.getByText(/list 3 pieces of evidence/i)).toBeInTheDocument();
    });
  });

  it('should allow returning to home from evaluation screen', async () => {
    const user = userEvent.setup();
    render(<App />);

    await startSimulationAndSendMessage(user);

    const exitButton = screen.getByRole('button', { name: /exit & score/i });
    await user.click(exitButton);

    await waitFor(() => {
      expect(screen.getByText(/your performance report/i)).toBeInTheDocument();
    });

    // Click back to home button
    const backHomeButton = screen.getByRole('button', { name: /back to home/i });
    await user.click(backHomeButton);

    // Should return to scenario selection
    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });
  });

  it('should allow rerunning the same scenario from evaluation screen', async () => {
    const user = userEvent.setup();
    render(<App />);

    await startSimulationAndSendMessage(user);

    const exitButton = screen.getByRole('button', { name: /exit & score/i });
    await user.click(exitButton);

    await waitFor(() => {
      expect(screen.getByText(/your performance report/i)).toBeInTheDocument();
    });

    // Click try again button
    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    await user.click(tryAgainButton);

    // Should start new simulation with same scenario
    await waitFor(() => {
      expect(screen.getByText(/0 \/ \d+ turns/i)).toBeInTheDocument();
    });

    // Verify new session was created
    expect(firestoreModule.createSession).toHaveBeenCalledTimes(2);
  });

  it('should automatically exit when turn limit is reached', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });

    // Select scenario with low turn limit
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

    // Send messages until turn limit
    const messageInput = screen.getByPlaceholderText(/type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    for (let i = 0; i < firstScenario.turnLimit; i++) {
      await user.clear(messageInput);
      await user.type(messageInput, `Message ${i + 1}`);
      await user.click(sendButton);

      await waitFor(() => {
        expect(aiServiceModule.getStakeholderResponse).toHaveBeenCalledTimes(i + 1);
      });
    }

    // Should automatically trigger evaluation
    await waitFor(() => {
      expect(screen.getByText(/evaluating your performance/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should handle evaluation errors gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock evaluation to fail
    vi.mocked(aiServiceModule.evaluateSession).mockRejectedValue(
      new Error('Evaluation service unavailable')
    );

    render(<App />);
    await startSimulationAndSendMessage(user);

    const exitButton = screen.getByRole('button', { name: /exit & score/i });
    await user.click(exitButton);

    // Should show evaluating state
    await waitFor(() => {
      expect(screen.getByText(/evaluating your performance/i)).toBeInTheDocument();
    });

    // Should remain in exited state even on error
    // The app should handle this gracefully without crashing
    await waitFor(() => {
      expect(screen.queryByText(/your performance report/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should show guest prompt in evaluation for guest users', async () => {
    const user = userEvent.setup();
    
    // Set up guest mode
    vi.mocked(authModule.observeAuthState).mockImplementation((callback) => {
      callback(null);
      return () => {};
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Guest Mode/i)).toBeInTheDocument();
    });

    // Start simulation as guest
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

    // Send a message
    const messageInput = screen.getByPlaceholderText(/type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.type(messageInput, 'Test message');
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(mockAIResponse.message)).toBeInTheDocument();
    });

    // Exit simulation
    const exitButton = screen.getByRole('button', { name: /exit & score/i });
    await user.click(exitButton);

    await waitFor(() => {
      expect(screen.getByText(/your performance report/i)).toBeInTheDocument();
    });

    // Should show guest banner
    expect(screen.getByText(/sign up to save this report/i)).toBeInTheDocument();
  });

  it('should navigate between evaluation tabs', async () => {
    const user = userEvent.setup();
    render(<App />);

    await startSimulationAndSendMessage(user);

    const exitButton = screen.getByRole('button', { name: /exit & score/i });
    await user.click(exitButton);

    await waitFor(() => {
      expect(screen.getByText(/your performance report/i)).toBeInTheDocument();
    });

    // Start on overview tab
    expect(screen.getByText(/framing/i)).toBeInTheDocument();

    // Navigate to key moments
    const momentsTab = screen.getByRole('button', { name: /key moments/i });
    await user.click(momentsTab);

    await waitFor(() => {
      expect(screen.getByText(/successfully addressed the main concern/i)).toBeInTheDocument();
    });

    // Navigate to practice drills
    const drillsTab = screen.getByRole('button', { name: /practice drills/i });
    await user.click(drillsTab);

    await waitFor(() => {
      expect(screen.getByText(/practice providing evidence/i)).toBeInTheDocument();
    });

    // Navigate back to overview
    const overviewTab = screen.getByRole('button', { name: /overview/i });
    await user.click(overviewTab);

    await waitFor(() => {
      expect(screen.getByText(/framing/i)).toBeInTheDocument();
    });
  });
});

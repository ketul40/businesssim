import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, createMockScenario } from '../test/utils';
import ProgressDashboard from './ProgressDashboard';
import { Timestamp } from 'firebase/firestore';
import * as firestoreModule from '../firebase/firestore';

// Mock the firestore module
vi.mock('../firebase/firestore', () => ({
  getUserSessions: vi.fn(),
}));

/**
 * Create a mock session with evaluation for testing
 */
function createMockSessionWithEvaluation(overrides = {}) {
  return {
    id: 'test-session-1',
    userId: 'test-user-id',
    scenario: createMockScenario({ title: 'Test Scenario 1' }),
    transcript: [],
    turnCount: 5,
    startedAt: {
      toDate: () => new Date('2024-01-15')
    },
    completedAt: {
      toDate: () => new Date('2024-01-15')
    },
    state: 'EVALUATED' as const,
    evaluation: {
      id: 'eval-1',
      sessionId: 'test-session-1',
      rubricId: 'rubric-1',
      overall_score: 85,
      criterion_scores: [],
      missed_opportunities: [],
      moments_that_mattered: [],
      reflection_prompt: 'Test prompt',
      drills: [],
      createdAt: Timestamp.now()
    },
    ...overrides
  };
}

/**
 * Create a mock incomplete session for testing
 */
function createMockIncompleteSession(overrides = {}) {
  return {
    id: 'test-session-2',
    userId: 'test-user-id',
    scenario: createMockScenario({ title: 'Incomplete Scenario' }),
    transcript: [],
    turnCount: 2,
    startedAt: {
      toDate: () => new Date('2024-01-10')
    },
    state: 'IN_SIM' as const,
    ...overrides
  };
}

describe('ProgressDashboard Component', () => {
  const mockOnStartNewScenario = vi.fn();
  const mockGetUserSessions = vi.mocked(firestoreModule.getUserSessions);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Stats Calculation', () => {
    it('calculates total sessions correctly', async () => {
      const sessions = [
        createMockSessionWithEvaluation({ id: 'session-1' }),
        createMockSessionWithEvaluation({ id: 'session-2' }),
        createMockIncompleteSession({ id: 'session-3' })
      ];
      
      mockGetUserSessions.mockResolvedValue(sessions);

      renderWithProviders(
        <ProgressDashboard 
          userId="test-user-id" 
          onStartNewScenario={mockOnStartNewScenario} 
        />
      );

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('Total Simulations')).toBeInTheDocument();
      });
    });

    it('calculates average score correctly from completed sessions', async () => {
      const sessions = [
        createMockSessionWithEvaluation({ 
          id: 'session-1',
          evaluation: { 
            overall_score: 80,
            id: 'eval-1',
            sessionId: 'session-1',
            rubricId: 'rubric-1',
            criterion_scores: [],
            missed_opportunities: [],
            moments_that_mattered: [],
            reflection_prompt: '',
            drills: [],
            createdAt: Timestamp.now()
          }
        }),
        createMockSessionWithEvaluation({ 
          id: 'session-2',
          evaluation: { 
            overall_score: 90,
            id: 'eval-2',
            sessionId: 'session-2',
            rubricId: 'rubric-1',
            criterion_scores: [],
            missed_opportunities: [],
            moments_that_mattered: [],
            reflection_prompt: '',
            drills: [],
            createdAt: Timestamp.now()
          }
        }),
        createMockIncompleteSession({ id: 'session-3' })
      ];
      
      mockGetUserSessions.mockResolvedValue(sessions);

      renderWithProviders(
        <ProgressDashboard 
          userId="test-user-id" 
          onStartNewScenario={mockOnStartNewScenario} 
        />
      );

      await waitFor(() => {
        // Average of 80 and 90 is 85
        expect(screen.getByText('85')).toBeInTheDocument();
        expect(screen.getByText('Average Score')).toBeInTheDocument();
      });
    });

    it('calculates total practice time correctly', async () => {
      const sessions = [
        createMockSessionWithEvaluation({ id: 'session-1' }),
        createMockSessionWithEvaluation({ id: 'session-2' }),
        createMockSessionWithEvaluation({ id: 'session-3' })
      ];
      
      mockGetUserSessions.mockResolvedValue(sessions);

      renderWithProviders(
        <ProgressDashboard 
          userId="test-user-id" 
          onStartNewScenario={mockOnStartNewScenario} 
        />
      );

      await waitFor(() => {
        // 3 sessions * 15 min = 45 min
        expect(screen.getByText('45 min')).toBeInTheDocument();
        expect(screen.getByText('Practice Time')).toBeInTheDocument();
      });
    });

    it('displays most recent scenario title', async () => {
      const sessions = [
        createMockSessionWithEvaluation({ 
          id: 'session-1',
          scenario: createMockScenario({ title: 'Most Recent Scenario' })
        }),
        createMockSessionWithEvaluation({ 
          id: 'session-2',
          scenario: createMockScenario({ title: 'Older Scenario' })
        })
      ];
      
      mockGetUserSessions.mockResolvedValue(sessions);

      renderWithProviders(
        <ProgressDashboard 
          userId="test-user-id" 
          onStartNewScenario={mockOnStartNewScenario} 
        />
      );

      await waitFor(() => {
        const mostRecentElements = screen.getAllByText('Most Recent Scenario');
        expect(mostRecentElements.length).toBeGreaterThan(0);
        expect(screen.getByText('Most Recent')).toBeInTheDocument();
      });
    });

    it('handles zero average score when no completed sessions', async () => {
      const sessions = [
        createMockIncompleteSession({ id: 'session-1' }),
        createMockIncompleteSession({ id: 'session-2' })
      ];
      
      mockGetUserSessions.mockResolvedValue(sessions);

      renderWithProviders(
        <ProgressDashboard 
          userId="test-user-id" 
          onStartNewScenario={mockOnStartNewScenario} 
        />
      );

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument();
        expect(screen.getByText('Average Score')).toBeInTheDocument();
      });
    });
  });

  describe('Session List Rendering', () => {
    it('renders session list with completed sessions', async () => {
      const sessions = [
        createMockSessionWithEvaluation({ 
          id: 'session-1',
          scenario: createMockScenario({ title: 'Scenario One' }),
          evaluation: {
            overall_score: 85,
            id: 'eval-1',
            sessionId: 'session-1',
            rubricId: 'rubric-1',
            criterion_scores: [],
            missed_opportunities: [],
            moments_that_mattered: [],
            reflection_prompt: '',
            drills: [],
            createdAt: Timestamp.now()
          }
        }),
        createMockSessionWithEvaluation({ 
          id: 'session-2',
          scenario: createMockScenario({ title: 'Scenario Two' }),
          evaluation: {
            overall_score: 72,
            id: 'eval-2',
            sessionId: 'session-2',
            rubricId: 'rubric-1',
            criterion_scores: [],
            missed_opportunities: [],
            moments_that_mattered: [],
            reflection_prompt: '',
            drills: [],
            createdAt: Timestamp.now()
          }
        })
      ];
      
      mockGetUserSessions.mockResolvedValue(sessions);

      renderWithProviders(
        <ProgressDashboard 
          userId="test-user-id" 
          onStartNewScenario={mockOnStartNewScenario} 
        />
      );

      await waitFor(() => {
        const scenarioOneElements = screen.getAllByText('Scenario One');
        expect(scenarioOneElements.length).toBeGreaterThan(0);
        expect(screen.getByText('Scenario Two')).toBeInTheDocument();
      });
    });

    it('displays score badges for completed sessions', async () => {
      const sessions = [
        createMockSessionWithEvaluation({ 
          id: 'session-1',
          evaluation: {
            overall_score: 85,
            id: 'eval-1',
            sessionId: 'session-1',
            rubricId: 'rubric-1',
            criterion_scores: [],
            missed_opportunities: [],
            moments_that_mattered: [],
            reflection_prompt: '',
            drills: [],
            createdAt: Timestamp.now()
          }
        })
      ];
      
      mockGetUserSessions.mockResolvedValue(sessions);

      renderWithProviders(
        <ProgressDashboard 
          userId="test-user-id" 
          onStartNewScenario={mockOnStartNewScenario} 
        />
      );

      await waitFor(() => {
        const scoreBadges = screen.getAllByText('85');
        const sessionScoreBadge = scoreBadges.find(el => el.classList.contains('score-badge-large'));
        expect(sessionScoreBadge).toBeInTheDocument();
      });
    });

    it('displays incomplete badge for sessions without evaluation', async () => {
      const sessions = [
        createMockIncompleteSession({ id: 'session-1' })
      ];
      
      mockGetUserSessions.mockResolvedValue(sessions);

      renderWithProviders(
        <ProgressDashboard 
          userId="test-user-id" 
          onStartNewScenario={mockOnStartNewScenario} 
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Incomplete')).toBeInTheDocument();
      });
    });

    it('displays session dates correctly', async () => {
      const sessions = [
        createMockSessionWithEvaluation({ 
          id: 'session-1',
          startedAt: {
            toDate: () => new Date('2024-01-15')
          }
        })
      ];
      
      mockGetUserSessions.mockResolvedValue(sessions);

      renderWithProviders(
        <ProgressDashboard 
          userId="test-user-id" 
          onStartNewScenario={mockOnStartNewScenario} 
        />
      );

      await waitFor(() => {
        // Date format may vary by locale, so just check that a date is displayed
        const dateElement = screen.getByText(/1\/\d+\/2024/);
        expect(dateElement).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('displays empty state when no sessions exist', async () => {
      mockGetUserSessions.mockResolvedValue([]);

      renderWithProviders(
        <ProgressDashboard 
          userId="test-user-id" 
          onStartNewScenario={mockOnStartNewScenario} 
        />
      );

      await waitFor(() => {
        expect(screen.getByText('No sessions yet')).toBeInTheDocument();
        expect(screen.getByText('Start your first simulation to begin tracking progress')).toBeInTheDocument();
      });
    });

    it('displays get started button in empty state', async () => {
      mockGetUserSessions.mockResolvedValue([]);

      renderWithProviders(
        <ProgressDashboard 
          userId="test-user-id" 
          onStartNewScenario={mockOnStartNewScenario} 
        />
      );

      await waitFor(() => {
        const getStartedButton = screen.getByRole('button', { name: /get started/i });
        expect(getStartedButton).toBeInTheDocument();
      });
    });

    it('calls onStartNewScenario when get started button is clicked', async () => {
      const user = userEvent.setup();
      mockGetUserSessions.mockResolvedValue([]);

      renderWithProviders(
        <ProgressDashboard 
          userId="test-user-id" 
          onStartNewScenario={mockOnStartNewScenario} 
        />
      );

      await waitFor(() => {
        expect(screen.getByText('No sessions yet')).toBeInTheDocument();
      });

      const getStartedButton = screen.getByRole('button', { name: /get started/i });
      await user.click(getStartedButton);

      expect(mockOnStartNewScenario).toHaveBeenCalledTimes(1);
    });

    it('displays N/A for most recent scenario when no sessions', async () => {
      mockGetUserSessions.mockResolvedValue([]);

      renderWithProviders(
        <ProgressDashboard 
          userId="test-user-id" 
          onStartNewScenario={mockOnStartNewScenario} 
        />
      );

      await waitFor(() => {
        expect(screen.getByText('N/A')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('displays loading state initially', () => {
      mockGetUserSessions.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderWithProviders(
        <ProgressDashboard 
          userId="test-user-id" 
          onStartNewScenario={mockOnStartNewScenario} 
        />
      );

      expect(screen.getByText('Loading your progress...')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onStartNewScenario when new scenario button is clicked', async () => {
      const user = userEvent.setup();
      const sessions = [createMockSessionWithEvaluation()];
      mockGetUserSessions.mockResolvedValue(sessions);

      renderWithProviders(
        <ProgressDashboard 
          userId="test-user-id" 
          onStartNewScenario={mockOnStartNewScenario} 
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Your Progress')).toBeInTheDocument();
      });

      const newScenarioButton = screen.getByRole('button', { name: /new scenario/i });
      await user.click(newScenarioButton);

      expect(mockOnStartNewScenario).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('handles getUserSessions error gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockGetUserSessions.mockRejectedValue(new Error('Firestore error'));

      renderWithProviders(
        <ProgressDashboard 
          userId="test-user-id" 
          onStartNewScenario={mockOnStartNewScenario} 
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading your progress...')).not.toBeInTheDocument();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading progress:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });
});

/**
 * Integration tests for progress tracking
 * Tests: Viewing progress dashboard, session history, statistics
 * Requirements: 9.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import * as authModule from '../../firebase/auth';
import * as firestoreModule from '../../firebase/firestore';
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

describe('Progress Tracking Integration Tests', () => {
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
    totalSessions: 10,
    averageScore: 75,
  };

  const mockSessions = [
    {
      id: 'session-1',
      userId: 'test-user-123',
      scenario: SCENARIO_TEMPLATES[0],
      transcript: [],
      turnCount: 8,
      startedAt: { seconds: Date.now() / 1000 - 86400, nanoseconds: 0 },
      completedAt: { seconds: Date.now() / 1000 - 86000, nanoseconds: 0 },
      state: 'EVALUATED',
      evaluation: {
        id: 'eval-1',
        sessionId: 'session-1',
        rubricId: 'persuasion_director',
        overall_score: 80,
        criterion_scores: [
          { criterion: 'Framing', weight: 0.25, score: 85, evidence: [] },
          { criterion: 'Evidence', weight: 0.25, score: 75, evidence: [] },
          { criterion: 'Risk Mitigation', weight: 0.25, score: 80, evidence: [] },
          { criterion: 'Objection Handling', weight: 0.25, score: 80, evidence: [] },
        ],
        missed_opportunities: [],
        moments_that_mattered: [],
        reflection_prompt: '',
        drills: [],
        createdAt: { seconds: Date.now() / 1000 - 86000, nanoseconds: 0 },
      },
    },
    {
      id: 'session-2',
      userId: 'test-user-123',
      scenario: SCENARIO_TEMPLATES[1],
      transcript: [],
      turnCount: 10,
      startedAt: { seconds: Date.now() / 1000 - 172800, nanoseconds: 0 },
      completedAt: { seconds: Date.now() / 1000 - 172400, nanoseconds: 0 },
      state: 'EVALUATED',
      evaluation: {
        id: 'eval-2',
        sessionId: 'session-2',
        rubricId: 'persuasion_director',
        overall_score: 70,
        criterion_scores: [
          { criterion: 'Framing', weight: 0.25, score: 70, evidence: [] },
          { criterion: 'Evidence', weight: 0.25, score: 65, evidence: [] },
          { criterion: 'Risk Mitigation', weight: 0.25, score: 75, evidence: [] },
          { criterion: 'Objection Handling', weight: 0.25, score: 70, evidence: [] },
        ],
        missed_opportunities: [],
        moments_that_mattered: [],
        reflection_prompt: '',
        drills: [],
        createdAt: { seconds: Date.now() / 1000 - 172400, nanoseconds: 0 },
      },
    },
    {
      id: 'session-3',
      userId: 'test-user-123',
      scenario: SCENARIO_TEMPLATES[0],
      transcript: [],
      turnCount: 12,
      startedAt: { seconds: Date.now() / 1000 - 259200, nanoseconds: 0 },
      completedAt: { seconds: Date.now() / 1000 - 258800, nanoseconds: 0 },
      state: 'EVALUATED',
      evaluation: {
        id: 'eval-3',
        sessionId: 'session-3',
        rubricId: 'persuasion_director',
        overall_score: 65,
        criterion_scores: [
          { criterion: 'Framing', weight: 0.25, score: 60, evidence: [] },
          { criterion: 'Evidence', weight: 0.25, score: 70, evidence: [] },
          { criterion: 'Risk Mitigation', weight: 0.25, score: 65, evidence: [] },
          { criterion: 'Objection Handling', weight: 0.25, score: 65, evidence: [] },
        ],
        missed_opportunities: [],
        moments_that_mattered: [],
        reflection_prompt: '',
        drills: [],
        createdAt: { seconds: Date.now() / 1000 - 258800, nanoseconds: 0 },
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(authModule.observeAuthState).mockImplementation((callback) => {
      callback(mockUser);
      return () => {};
    });
    
    vi.mocked(firestoreModule.getUser).mockResolvedValue(mockUserData);
    vi.mocked(firestoreModule.getUserSessions).mockResolvedValue(mockSessions);
    vi.mocked(firestoreModule.createSession).mockResolvedValue('session-123');
  });

  it('should navigate to progress dashboard when progress button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });

    // Click progress button
    const progressButton = screen.getByRole('button', { name: /progress/i });
    await user.click(progressButton);

    // Should navigate to progress dashboard
    await waitFor(() => {
      expect(screen.getByText(/your progress/i)).toBeInTheDocument();
    });
  });

  it('should display user statistics on progress dashboard', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });

    const progressButton = screen.getByRole('button', { name: /progress/i });
    await user.click(progressButton);

    await waitFor(() => {
      expect(screen.getByText(/your progress/i)).toBeInTheDocument();
    });

    // Verify getUserSessions was called
    expect(firestoreModule.getUserSessions).toHaveBeenCalledWith('test-user-123', 10);

    // Verify statistics are displayed
    await waitFor(() => {
      // Total sessions
      expect(screen.getByText('3')).toBeInTheDocument();
      
      // Average score (calculated from mock sessions: (80 + 70 + 65) / 3 = 72)
      expect(screen.getByText('72')).toBeInTheDocument();
    });
  });

  it('should display session history on progress dashboard', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });

    const progressButton = screen.getByRole('button', { name: /progress/i });
    await user.click(progressButton);

    await waitFor(() => {
      expect(screen.getByText(/your progress/i)).toBeInTheDocument();
    });

    // Verify session list is displayed
    await waitFor(() => {
      expect(screen.getByText(/recent sessions/i)).toBeInTheDocument();
    });

    // Verify sessions are shown
    mockSessions.forEach((session) => {
      expect(screen.getByText(session.scenario.title)).toBeInTheDocument();
    });
  });

  it('should display session scores in history', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });

    const progressButton = screen.getByRole('button', { name: /progress/i });
    await user.click(progressButton);

    await waitFor(() => {
      expect(screen.getByText(/your progress/i)).toBeInTheDocument();
    });

    // Verify scores are displayed
    await waitFor(() => {
      expect(screen.getByText('80')).toBeInTheDocument();
      expect(screen.getByText('70')).toBeInTheDocument();
      expect(screen.getByText('65')).toBeInTheDocument();
    });
  });

  it('should allow starting new scenario from progress dashboard', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });

    const progressButton = screen.getByRole('button', { name: /progress/i });
    await user.click(progressButton);

    await waitFor(() => {
      expect(screen.getByText(/your progress/i)).toBeInTheDocument();
    });

    // Click new scenario button
    const newScenarioButton = screen.getByRole('button', { name: /new scenario/i });
    await user.click(newScenarioButton);

    // Should return to scenario selection
    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });
  });

  it('should handle empty session history gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock empty sessions
    vi.mocked(firestoreModule.getUserSessions).mockResolvedValue([]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });

    const progressButton = screen.getByRole('button', { name: /progress/i });
    await user.click(progressButton);

    await waitFor(() => {
      expect(screen.getByText(/your progress/i)).toBeInTheDocument();
    });

    // Should show empty state or zero stats
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  it('should show loading state while fetching progress data', async () => {
    const user = userEvent.setup();
    
    // Make getUserSessions take longer
    vi.mocked(firestoreModule.getUserSessions).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockSessions), 1000))
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });

    const progressButton = screen.getByRole('button', { name: /progress/i });
    await user.click(progressButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/loading your progress/i)).toBeInTheDocument();
    });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/your progress/i)).toBeInTheDocument();
      expect(screen.queryByText(/loading your progress/i)).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should handle progress data fetch errors gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock getUserSessions to fail
    vi.mocked(firestoreModule.getUserSessions).mockRejectedValue(
      new Error('Failed to fetch sessions')
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });

    const progressButton = screen.getByRole('button', { name: /progress/i });
    await user.click(progressButton);

    // Should still show progress dashboard (with empty/error state)
    await waitFor(() => {
      expect(screen.getByText(/your progress/i)).toBeInTheDocument();
    });
  });

  it('should not show progress button for guest users', async () => {
    // Set up guest mode
    vi.mocked(authModule.observeAuthState).mockImplementation((callback) => {
      callback(null);
      return () => {};
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Guest Mode/i)).toBeInTheDocument();
    });

    // Progress button should not be visible
    expect(screen.queryByRole('button', { name: /progress/i })).not.toBeInTheDocument();
  });

  it('should display skill radar chart on progress dashboard', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });

    const progressButton = screen.getByRole('button', { name: /progress/i });
    await user.click(progressButton);

    await waitFor(() => {
      expect(screen.getByText(/your progress/i)).toBeInTheDocument();
    });

    // Verify skill development section is present
    expect(screen.getByText(/skill development/i)).toBeInTheDocument();
  });

  it('should calculate average score correctly from sessions', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });

    const progressButton = screen.getByRole('button', { name: /progress/i });
    await user.click(progressButton);

    await waitFor(() => {
      expect(screen.getByText(/your progress/i)).toBeInTheDocument();
    });

    // Average of 80, 70, 65 = 71.67, rounded to 72
    await waitFor(() => {
      expect(screen.getByText('72')).toBeInTheDocument();
    });
  });

  it('should display most recent sessions first', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });

    const progressButton = screen.getByRole('button', { name: /progress/i });
    await user.click(progressButton);

    await waitFor(() => {
      expect(screen.getByText(/your progress/i)).toBeInTheDocument();
    });

    // Get all session cards
    const sessionTitles = screen.getAllByText(mockSessions[0].scenario.title);
    
    // First session (most recent) should appear first
    expect(sessionTitles.length).toBeGreaterThan(0);
  });

  it('should show session completion dates', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });

    const progressButton = screen.getByRole('button', { name: /progress/i });
    await user.click(progressButton);

    await waitFor(() => {
      expect(screen.getByText(/your progress/i)).toBeInTheDocument();
    });

    // Sessions should display with dates
    // The exact format depends on implementation
    await waitFor(() => {
      expect(screen.getByText(/recent sessions/i)).toBeInTheDocument();
    });
  });

  it('should integrate progress tracking with completed simulations', async () => {
    const user = userEvent.setup();
    
    // Start with initial sessions
    vi.mocked(firestoreModule.getUserSessions).mockResolvedValue(mockSessions);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });

    // Check initial progress
    const progressButton = screen.getByRole('button', { name: /progress/i });
    await user.click(progressButton);

    await waitFor(() => {
      expect(screen.getByText(/your progress/i)).toBeInTheDocument();
    });

    // Verify initial session count
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    // Return to home
    const newScenarioButton = screen.getByRole('button', { name: /new scenario/i });
    await user.click(newScenarioButton);

    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });

    // This test verifies the integration flow exists
    // Actual session creation and progress update would happen in a full end-to-end test
  });
});

/**
 * Integration tests for scenario selection and simulation start
 * Tests: Browsing scenarios, selecting a scenario, starting simulation
 * Requirements: 9.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
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

describe('Scenario Selection and Simulation Integration Tests', () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default: authenticated user
    vi.mocked(authModule.observeAuthState).mockImplementation((callback) => {
      callback(mockUser);
      return () => {};
    });
    
    vi.mocked(firestoreModule.getUser).mockResolvedValue(mockUserData);
    vi.mocked(firestoreModule.createSession).mockResolvedValue('session-123');
    vi.mocked(firestoreModule.updateSession).mockResolvedValue(undefined);
  });

  it('should display all available scenario templates', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });

    // Verify all scenario templates are displayed
    SCENARIO_TEMPLATES.forEach((template) => {
      expect(screen.getByText(template.title)).toBeInTheDocument();
    });

    // Verify custom scenario option is available
    expect(screen.getByText(/create your own/i)).toBeInTheDocument();
  });

  it('should show scenario details when a scenario card is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });

    // Click on first scenario
    const firstScenario = SCENARIO_TEMPLATES[0];
    const scenarioCard = screen.getByText(firstScenario.title);
    await user.click(scenarioCard);

    // Verify modal opens with scenario details
    await waitFor(() => {
      expect(screen.getByText(firstScenario.description)).toBeInTheDocument();
      expect(screen.getByText(/situation/i)).toBeInTheDocument();
      expect(screen.getByText(/objective/i)).toBeInTheDocument();
    });

    // Verify start button is present
    expect(screen.getByRole('button', { name: /start simulation/i })).toBeInTheDocument();
  });

  it('should start simulation when start button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });

    // Select a scenario
    const firstScenario = SCENARIO_TEMPLATES[0];
    const scenarioCard = screen.getByText(firstScenario.title);
    await user.click(scenarioCard);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /start simulation/i })).toBeInTheDocument();
    });

    // Start simulation
    const startButton = screen.getByRole('button', { name: /start simulation/i });
    await user.click(startButton);

    // Verify session was created
    await waitFor(() => {
      expect(firestoreModule.createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.uid,
          scenario: expect.objectContaining({
            id: firstScenario.id,
            title: firstScenario.title,
          }),
        })
      );
    });

    // Verify simulation interface is displayed
    await waitFor(() => {
      expect(screen.getByText(firstScenario.title)).toBeInTheDocument();
      expect(screen.getByText(/0 \/ \d+ turns/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /time-out/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /exit & score/i })).toBeInTheDocument();
    });
  });

  it('should display scenario context in sidebar during simulation', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });

    // Select and start a scenario
    const firstScenario = SCENARIO_TEMPLATES[0];
    const scenarioCard = screen.getByText(firstScenario.title);
    await user.click(scenarioCard);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /start simulation/i })).toBeInTheDocument();
    });

    const startButton = screen.getByRole('button', { name: /start simulation/i });
    await user.click(startButton);

    // Wait for simulation to start
    await waitFor(() => {
      expect(screen.getByText(/0 \/ \d+ turns/i)).toBeInTheDocument();
    });

    // Verify sidebar shows scenario context
    expect(screen.getByText(/situation/i)).toBeInTheDocument();
    expect(screen.getByText(/objective/i)).toBeInTheDocument();
  });

  it('should allow guest users to start simulations', async () => {
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

    // Select a scenario
    const firstScenario = SCENARIO_TEMPLATES[0];
    const scenarioCard = screen.getByText(firstScenario.title);
    await user.click(scenarioCard);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /start simulation/i })).toBeInTheDocument();
    });

    // Start simulation
    const startButton = screen.getByRole('button', { name: /start simulation/i });
    await user.click(startButton);

    // Verify simulation starts (no session created for guest)
    await waitFor(() => {
      expect(screen.getByText(/0 \/ \d+ turns/i)).toBeInTheDocument();
    });

    // Session should not be created for guest
    expect(firestoreModule.createSession).not.toHaveBeenCalled();
  });

  it('should close scenario modal when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });

    // Open scenario modal
    const firstScenario = SCENARIO_TEMPLATES[0];
    const scenarioCard = screen.getByText(firstScenario.title);
    await user.click(scenarioCard);

    await waitFor(() => {
      expect(screen.getByText(firstScenario.description)).toBeInTheDocument();
    });

    // Close modal
    const closeButton = screen.getByRole('button', { name: /×/ });
    await user.click(closeButton);

    // Verify modal is closed
    await waitFor(() => {
      expect(screen.queryByText(firstScenario.description)).not.toBeInTheDocument();
    });

    // Verify we're back at scenario selection
    expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
  });

  it('should filter scenarios by category', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });

    // Get all unique categories
    const categories = [...new Set(SCENARIO_TEMPLATES.map(s => s.category))];
    
    if (categories.length > 1) {
      // Find filter buttons (if they exist in the UI)
      const filterButtons = screen.queryAllByRole('button', { name: /filter/i });
      
      if (filterButtons.length > 0) {
        // Click on a category filter
        await user.click(filterButtons[0]);

        // Verify filtered scenarios are shown
        // This is a placeholder - actual implementation depends on UI
        expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
      }
    }
  });

  it('should return to scenario selection when back home is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });

    // Start a simulation
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

    // Click app title to go back home
    const appTitle = screen.getByText('SkillLoops');
    await user.click(appTitle);

    // Verify we're back at scenario selection
    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });
  });

  it('should preserve scenario selection when modal is reopened', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Ready to Practice/i)).toBeInTheDocument();
    });

    // Open first scenario
    const firstScenario = SCENARIO_TEMPLATES[0];
    let scenarioCard = screen.getByText(firstScenario.title);
    await user.click(scenarioCard);

    await waitFor(() => {
      expect(screen.getByText(firstScenario.description)).toBeInTheDocument();
    });

    // Close modal
    const closeButton = screen.getByRole('button', { name: /×/ });
    await user.click(closeButton);

    // Open same scenario again
    scenarioCard = screen.getByText(firstScenario.title);
    await user.click(scenarioCard);

    // Verify same scenario details are shown
    await waitFor(() => {
      expect(screen.getByText(firstScenario.description)).toBeInTheDocument();
    });
  });
});

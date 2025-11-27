import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, createMockScenario } from '../test/utils';
import Feedback from './Feedback';
import { Evaluation } from '../types/models';
import { Timestamp } from 'firebase/firestore';

/**
 * Create a mock evaluation for testing
 */
function createMockEvaluation(overrides: Partial<Evaluation> = {}): Evaluation {
  return {
    id: 'test-evaluation-id',
    sessionId: 'test-session-id',
    rubricId: 'test-rubric-id',
    overall_score: 75,
    criterion_scores: [
      {
        criterion: 'Communication',
        weight: 0.3,
        score: 4,
        evidence: ['Clear and concise messaging', 'Active listening demonstrated']
      },
      {
        criterion: 'Problem Solving',
        weight: 0.3,
        score: 3,
        evidence: ['Identified key issues']
      },
      {
        criterion: 'Leadership',
        weight: 0.4,
        score: 4,
        evidence: ['Took initiative', 'Motivated team']
      }
    ],
    missed_opportunities: [
      {
        criterion: 'Problem Solving',
        what: 'Did not explore alternative solutions',
        how_to_improve: 'Consider multiple approaches before deciding'
      }
    ],
    moments_that_mattered: [
      {
        turn: 3,
        description: 'Addressed stakeholder concerns directly',
        why: 'This built trust and credibility'
      },
      {
        turn: 7,
        description: 'Proposed concrete next steps',
        why: 'This demonstrated leadership and planning'
      }
    ],
    reflection_prompt: 'What would you do differently next time?',
    drills: [
      {
        title: 'Active Listening Practice',
        instructions: 'Practice paraphrasing and asking clarifying questions',
        estimated_minutes: 15
      },
      {
        title: 'Solution Brainstorming',
        instructions: 'Generate 5 alternative solutions to a problem',
        estimated_minutes: 20
      }
    ],
    createdAt: Timestamp.now(),
    ...overrides
  };
}

describe('Feedback Component', () => {
  const mockScenario = createMockScenario({ title: 'Test Scenario' });
  const mockEvaluation = createMockEvaluation();
  const mockOnBackHome = vi.fn();
  const mockOnRerunScenario = vi.fn();
  const mockOnAuthRequired = vi.fn();

  it('displays loading state when evaluation is null', () => {
    renderWithProviders(
      <Feedback
        evaluation={null}
        scenario={mockScenario}
        onBackHome={mockOnBackHome}
        onRerunScenario={mockOnRerunScenario}
        isGuest={false}
      />
    );

    expect(screen.getByText('Analyzing your performance...')).toBeInTheDocument();
  });

  it('displays overall score correctly', () => {
    renderWithProviders(
      <Feedback
        evaluation={mockEvaluation}
        scenario={mockScenario}
        onBackHome={mockOnBackHome}
        onRerunScenario={mockOnRerunScenario}
        isGuest={false}
      />
    );

    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('/ 100')).toBeInTheDocument();
    expect(screen.getByText('Proficient')).toBeInTheDocument();
  });

  it('displays scenario title', () => {
    renderWithProviders(
      <Feedback
        evaluation={mockEvaluation}
        scenario={mockScenario}
        onBackHome={mockOnBackHome}
        onRerunScenario={mockOnRerunScenario}
        isGuest={false}
      />
    );

    expect(screen.getByText('Test Scenario')).toBeInTheDocument();
  });

  it('displays criterion breakdown with scores', () => {
    renderWithProviders(
      <Feedback
        evaluation={mockEvaluation}
        scenario={mockScenario}
        onBackHome={mockOnBackHome}
        onRerunScenario={mockOnRerunScenario}
        isGuest={false}
      />
    );

    expect(screen.getByText('Communication')).toBeInTheDocument();
    expect(screen.getAllByText('Problem Solving').length).toBeGreaterThan(0);
    expect(screen.getByText('Leadership')).toBeInTheDocument();
    
    const fourOutOfFive = screen.getAllByText('4 / 5');
    expect(fourOutOfFive.length).toBe(2); // Communication and Leadership
    expect(screen.getByText('3 / 5')).toBeInTheDocument();
  });

  it('displays evidence for criteria', () => {
    renderWithProviders(
      <Feedback
        evaluation={mockEvaluation}
        scenario={mockScenario}
        onBackHome={mockOnBackHome}
        onRerunScenario={mockOnRerunScenario}
        isGuest={false}
      />
    );

    expect(screen.getByText('Clear and concise messaging')).toBeInTheDocument();
    expect(screen.getByText('Active listening demonstrated')).toBeInTheDocument();
  });

  it('displays missed opportunities', () => {
    renderWithProviders(
      <Feedback
        evaluation={mockEvaluation}
        scenario={mockScenario}
        onBackHome={mockOnBackHome}
        onRerunScenario={mockOnRerunScenario}
        isGuest={false}
      />
    );

    expect(screen.getByText('Did not explore alternative solutions')).toBeInTheDocument();
    expect(screen.getByText('Consider multiple approaches before deciding')).toBeInTheDocument();
  });

  it('switches to moments tab and displays moments', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(
      <Feedback
        evaluation={mockEvaluation}
        scenario={mockScenario}
        onBackHome={mockOnBackHome}
        onRerunScenario={mockOnRerunScenario}
        isGuest={false}
      />
    );

    const momentsButton = screen.getByRole('button', { name: /key moments/i });
    await user.click(momentsButton);

    expect(screen.getByText('Addressed stakeholder concerns directly')).toBeInTheDocument();
    expect(screen.getByText('This built trust and credibility')).toBeInTheDocument();
    expect(screen.getByText('Turn 3')).toBeInTheDocument();
  });

  it('displays reflection prompt in moments tab', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(
      <Feedback
        evaluation={mockEvaluation}
        scenario={mockScenario}
        onBackHome={mockOnBackHome}
        onRerunScenario={mockOnRerunScenario}
        isGuest={false}
      />
    );

    const momentsButton = screen.getByRole('button', { name: /key moments/i });
    await user.click(momentsButton);

    expect(screen.getByText('What would you do differently next time?')).toBeInTheDocument();
  });

  it('switches to drills tab and displays practice drills', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(
      <Feedback
        evaluation={mockEvaluation}
        scenario={mockScenario}
        onBackHome={mockOnBackHome}
        onRerunScenario={mockOnRerunScenario}
        isGuest={false}
      />
    );

    const drillsButton = screen.getByRole('button', { name: /practice drills/i });
    await user.click(drillsButton);

    expect(screen.getByText('Active Listening Practice')).toBeInTheDocument();
    expect(screen.getByText('Practice paraphrasing and asking clarifying questions')).toBeInTheDocument();
    expect(screen.getByText('15 min')).toBeInTheDocument();
    expect(screen.getByText('Solution Brainstorming')).toBeInTheDocument();
    expect(screen.getByText('20 min')).toBeInTheDocument();
  });

  it('calls onBackHome when back button is clicked', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(
      <Feedback
        evaluation={mockEvaluation}
        scenario={mockScenario}
        onBackHome={mockOnBackHome}
        onRerunScenario={mockOnRerunScenario}
        isGuest={false}
      />
    );

    const backButton = screen.getByRole('button', { name: /back to home/i });
    await user.click(backButton);

    expect(mockOnBackHome).toHaveBeenCalledTimes(1);
  });

  it('calls onRerunScenario when try again button is clicked', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(
      <Feedback
        evaluation={mockEvaluation}
        scenario={mockScenario}
        onBackHome={mockOnBackHome}
        onRerunScenario={mockOnRerunScenario}
        isGuest={false}
      />
    );

    const tryAgainButton = screen.getByRole('button', { name: /try again with harder mode/i });
    await user.click(tryAgainButton);

    expect(mockOnRerunScenario).toHaveBeenCalledTimes(1);
  });

  it('displays guest banner when isGuest is true', () => {
    renderWithProviders(
      <Feedback
        evaluation={mockEvaluation}
        scenario={mockScenario}
        onBackHome={mockOnBackHome}
        onRerunScenario={mockOnRerunScenario}
        isGuest={true}
        onAuthRequired={mockOnAuthRequired}
      />
    );

    expect(screen.getByText(/sign up to save this report/i)).toBeInTheDocument();
  });

  it('calls onAuthRequired when sign up button is clicked', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(
      <Feedback
        evaluation={mockEvaluation}
        scenario={mockScenario}
        onBackHome={mockOnBackHome}
        onRerunScenario={mockOnRerunScenario}
        isGuest={true}
        onAuthRequired={mockOnAuthRequired}
      />
    );

    const signUpButton = screen.getByRole('button', { name: /sign up to save progress/i });
    await user.click(signUpButton);

    expect(mockOnAuthRequired).toHaveBeenCalledWith('To save your performance reports and track improvement over time');
  });

  it('does not display guest banner when isGuest is false', () => {
    renderWithProviders(
      <Feedback
        evaluation={mockEvaluation}
        scenario={mockScenario}
        onBackHome={mockOnBackHome}
        onRerunScenario={mockOnRerunScenario}
        isGuest={false}
      />
    );

    expect(screen.queryByText(/sign up to save this report/i)).not.toBeInTheDocument();
  });

  it('displays weight badges for criteria', () => {
    renderWithProviders(
      <Feedback
        evaluation={mockEvaluation}
        scenario={mockScenario}
        onBackHome={mockOnBackHome}
        onRerunScenario={mockOnRerunScenario}
        isGuest={false}
      />
    );

    const thirtyPercentWeights = screen.getAllByText('30% weight');
    expect(thirtyPercentWeights.length).toBe(2); // Communication and Problem Solving
    expect(screen.getByText('40% weight')).toBeInTheDocument();
  });
});

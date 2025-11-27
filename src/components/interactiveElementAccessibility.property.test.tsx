import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import fc from 'fast-check';
import ChatInterface from './ChatInterface';
import ScenarioSelect from './ScenarioSelect';
import Feedback from './Feedback';
import ProgressDashboard from './ProgressDashboard';
import { ScenarioTemplate, Message, Evaluation } from '../types/models';
import { SCENARIO_TEMPLATES } from '../constants/scenarios';

/**
 * Feature: app-optimization, Property 11: Interactive element accessibility
 * Validates: Requirements 6.1
 * 
 * For any interactive element (button, link, input), it should have an appropriate 
 * ARIA role and accessible name (via aria-label, aria-labelledby, or text content)
 */

describe('Property 11: Interactive element accessibility', () => {
  const mockScenario: ScenarioTemplate = SCENARIO_TEMPLATES[0];
  const mockMessages: Message[] = [
    {
      type: 'system',
      content: 'Welcome',
      timestamp: new Date().toISOString()
    }
  ];

  it('all interactive elements in ChatInterface have accessible names', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }),
        fc.boolean(),
        (turnCount, isLoading) => {
          const { container } = render(
            <ChatInterface
              scenario={mockScenario}
              messages={mockMessages}
              onSendMessage={() => {}}
              onTimeout={() => {}}
              onExit={() => {}}
              onGetSuggestions={() => {}}
              turnCount={turnCount}
              isLoading={isLoading}
              suggestions={[]}
              isSuggestionsLoading={false}
            />
          );

          // Get all interactive elements
          const buttons = container.querySelectorAll('button');
          const inputs = container.querySelectorAll('input, textarea');
          const links = container.querySelectorAll('a');

          // Check buttons have accessible names
          buttons.forEach((button) => {
            const hasTextContent = button.textContent && button.textContent.trim().length > 0;
            const hasAriaLabel = button.hasAttribute('aria-label');
            const hasAriaLabelledBy = button.hasAttribute('aria-labelledby');
            const hasTitle = button.hasAttribute('title');

            expect(
              hasTextContent || hasAriaLabel || hasAriaLabelledBy || hasTitle,
              `Button should have accessible name: ${button.outerHTML}`
            ).toBe(true);
          });

          // Check inputs have accessible names
          inputs.forEach((input) => {
            const hasAriaLabel = input.hasAttribute('aria-label');
            const hasAriaLabelledBy = input.hasAttribute('aria-labelledby');
            const hasPlaceholder = input.hasAttribute('placeholder');
            const hasAssociatedLabel = input.id && container.querySelector(`label[for="${input.id}"]`);

            expect(
              hasAriaLabel || hasAriaLabelledBy || hasAssociatedLabel || hasPlaceholder,
              `Input should have accessible name: ${input.outerHTML}`
            ).toBe(true);
          });

          // Check links have accessible names
          links.forEach((link) => {
            const hasTextContent = link.textContent && link.textContent.trim().length > 0;
            const hasAriaLabel = link.hasAttribute('aria-label');
            const hasAriaLabelledBy = link.hasAttribute('aria-labelledby');

            expect(
              hasTextContent || hasAriaLabel || hasAriaLabelledBy,
              `Link should have accessible name: ${link.outerHTML}`
            ).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('all interactive elements in ScenarioSelect have accessible names', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SCENARIO_TEMPLATES),
        (scenario) => {
          const { container } = render(
            <ScenarioSelect
              onSelectScenario={() => {}}
              isGuest={false}
            />
          );

          // Get all interactive elements
          const buttons = container.querySelectorAll('button');
          const inputs = container.querySelectorAll('input, textarea, select');

          // Check buttons
          buttons.forEach((button) => {
            const hasTextContent = button.textContent && button.textContent.trim().length > 0;
            const hasAriaLabel = button.hasAttribute('aria-label');
            const hasAriaLabelledBy = button.hasAttribute('aria-labelledby');
            const hasTitle = button.hasAttribute('title');

            expect(
              hasTextContent || hasAriaLabel || hasAriaLabelledBy || hasTitle,
              `Button should have accessible name: ${button.outerHTML}`
            ).toBe(true);
          });

          // Check inputs
          inputs.forEach((input) => {
            const hasAriaLabel = input.hasAttribute('aria-label');
            const hasAriaLabelledBy = input.hasAttribute('aria-labelledby');
            const hasPlaceholder = input.hasAttribute('placeholder');
            const hasAssociatedLabel = input.id && container.querySelector(`label[for="${input.id}"]`);

            expect(
              hasAriaLabel || hasAriaLabelledBy || hasAssociatedLabel || hasPlaceholder,
              `Input should have accessible name: ${input.outerHTML}`
            ).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('all interactive elements in Feedback have accessible names', () => {
    const mockEvaluation: Evaluation = {
      id: 'test-eval',
      sessionId: 'test-session',
      rubricId: 'test-rubric',
      overall_score: 75,
      criterion_scores: [
        {
          criterion: 'Framing',
          weight: 0.25,
          score: 80,
          evidence: ['Good framing']
        }
      ],
      missed_opportunities: [],
      moments_that_mattered: [],
      reflection_prompt: 'Reflect on your performance',
      drills: [],
      createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
    };

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        (score) => {
          const evaluation = { ...mockEvaluation, overall_score: score };
          
          const { container } = render(
            <Feedback
              evaluation={evaluation}
              scenario={mockScenario}
              onBackHome={() => {}}
              onRerunScenario={() => {}}
              isGuest={false}
            />
          );

          // Get all interactive elements
          const buttons = container.querySelectorAll('button');

          // Check buttons
          buttons.forEach((button) => {
            const hasTextContent = button.textContent && button.textContent.trim().length > 0;
            const hasAriaLabel = button.hasAttribute('aria-label');
            const hasAriaLabelledBy = button.hasAttribute('aria-labelledby');
            const hasTitle = button.hasAttribute('title');

            expect(
              hasTextContent || hasAriaLabel || hasAriaLabelledBy || hasTitle,
              `Button should have accessible name: ${button.outerHTML}`
            ).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('all interactive elements in ProgressDashboard have accessible names', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 20 }),
        (userId) => {
          const { container } = render(
            <ProgressDashboard
              userId={userId}
              onStartNewScenario={() => {}}
            />
          );

          // Get all interactive elements
          const buttons = container.querySelectorAll('button');

          // Check buttons
          buttons.forEach((button) => {
            const hasTextContent = button.textContent && button.textContent.trim().length > 0;
            const hasAriaLabel = button.hasAttribute('aria-label');
            const hasAriaLabelledBy = button.hasAttribute('aria-labelledby');
            const hasTitle = button.hasAttribute('title');

            expect(
              hasTextContent || hasAriaLabel || hasAriaLabelledBy || hasTitle,
              `Button should have accessible name: ${button.outerHTML}`
            ).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

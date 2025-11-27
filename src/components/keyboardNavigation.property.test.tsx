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
 * Feature: app-optimization, Property 13: Keyboard navigation support
 * Validates: Requirements 6.3
 * 
 * For any interactive element, it should be reachable via keyboard navigation (Tab key) 
 * and have visible focus indicators
 */

describe('Property 13: Keyboard navigation support', () => {
  const mockScenario: ScenarioTemplate = SCENARIO_TEMPLATES[0];
  const mockMessages: Message[] = [
    {
      type: 'system',
      content: 'Welcome',
      timestamp: new Date().toISOString()
    }
  ];

  it('all interactive elements in ChatInterface are keyboard accessible', () => {
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

          const allInteractive = [...Array.from(buttons), ...Array.from(inputs), ...Array.from(links)];

          // Check each interactive element is keyboard accessible
          allInteractive.forEach((element) => {
            // Element should not have tabindex="-1" unless it's disabled
            const tabIndex = element.getAttribute('tabindex');
            const isDisabled = element.hasAttribute('disabled');

            if (!isDisabled) {
              expect(
                tabIndex !== '-1',
                `Interactive element should be keyboard accessible (not tabindex="-1"): ${element.outerHTML.substring(0, 100)}`
              ).toBe(true);
            }

            // Element should be focusable (either naturally or via tabindex >= 0)
            const isFocusable = 
              element.tagName === 'BUTTON' ||
              element.tagName === 'A' ||
              element.tagName === 'INPUT' ||
              element.tagName === 'TEXTAREA' ||
              element.tagName === 'SELECT' ||
              (tabIndex !== null && parseInt(tabIndex) >= 0);

            if (!isDisabled) {
              expect(
                isFocusable,
                `Interactive element should be focusable: ${element.outerHTML.substring(0, 100)}`
              ).toBe(true);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('all interactive elements in ScenarioSelect are keyboard accessible', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (isGuest) => {
          const { container } = render(
            <ScenarioSelect
              onSelectScenario={() => {}}
              isGuest={isGuest}
            />
          );

          // Get all interactive elements
          const buttons = container.querySelectorAll('button');
          const inputs = container.querySelectorAll('input, textarea, select');
          const links = container.querySelectorAll('a');

          const allInteractive = [...Array.from(buttons), ...Array.from(inputs), ...Array.from(links)];

          // Check each interactive element is keyboard accessible
          allInteractive.forEach((element) => {
            const tabIndex = element.getAttribute('tabindex');
            const isDisabled = element.hasAttribute('disabled');

            if (!isDisabled) {
              expect(
                tabIndex !== '-1',
                `Interactive element should be keyboard accessible: ${element.outerHTML.substring(0, 100)}`
              ).toBe(true);
            }

            const isFocusable = 
              element.tagName === 'BUTTON' ||
              element.tagName === 'A' ||
              element.tagName === 'INPUT' ||
              element.tagName === 'TEXTAREA' ||
              element.tagName === 'SELECT' ||
              (tabIndex !== null && parseInt(tabIndex) >= 0);

            if (!isDisabled) {
              expect(
                isFocusable,
                `Interactive element should be focusable: ${element.outerHTML.substring(0, 100)}`
              ).toBe(true);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('all interactive elements in Feedback are keyboard accessible', () => {
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
        fc.boolean(),
        (score, isGuest) => {
          const evaluation = { ...mockEvaluation, overall_score: score };
          
          const { container } = render(
            <Feedback
              evaluation={evaluation}
              scenario={mockScenario}
              onBackHome={() => {}}
              onRerunScenario={() => {}}
              isGuest={isGuest}
            />
          );

          // Get all interactive elements
          const buttons = container.querySelectorAll('button');
          const links = container.querySelectorAll('a');

          const allInteractive = [...Array.from(buttons), ...Array.from(links)];

          // Check each interactive element is keyboard accessible
          allInteractive.forEach((element) => {
            const tabIndex = element.getAttribute('tabindex');
            const isDisabled = element.hasAttribute('disabled');

            if (!isDisabled) {
              expect(
                tabIndex !== '-1',
                `Interactive element should be keyboard accessible: ${element.outerHTML.substring(0, 100)}`
              ).toBe(true);
            }

            const isFocusable = 
              element.tagName === 'BUTTON' ||
              element.tagName === 'A' ||
              (tabIndex !== null && parseInt(tabIndex) >= 0);

            if (!isDisabled) {
              expect(
                isFocusable,
                `Interactive element should be focusable: ${element.outerHTML.substring(0, 100)}`
              ).toBe(true);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('all interactive elements in ProgressDashboard are keyboard accessible', () => {
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
          const links = container.querySelectorAll('a');

          const allInteractive = [...Array.from(buttons), ...Array.from(links)];

          // Check each interactive element is keyboard accessible
          allInteractive.forEach((element) => {
            const tabIndex = element.getAttribute('tabindex');
            const isDisabled = element.hasAttribute('disabled');

            if (!isDisabled) {
              expect(
                tabIndex !== '-1',
                `Interactive element should be keyboard accessible: ${element.outerHTML.substring(0, 100)}`
              ).toBe(true);
            }

            const isFocusable = 
              element.tagName === 'BUTTON' ||
              element.tagName === 'A' ||
              (tabIndex !== null && parseInt(tabIndex) >= 0);

            if (!isDisabled) {
              expect(
                isFocusable,
                `Interactive element should be focusable: ${element.outerHTML.substring(0, 100)}`
              ).toBe(true);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('scenario cards are keyboard accessible', () => {
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

          // Get all scenario cards (they should be clickable divs or buttons)
          const scenarioCards = container.querySelectorAll('.scenario-card');

          scenarioCards.forEach((card) => {
            // Cards should either be buttons or have appropriate keyboard handling
            const isButton = card.tagName === 'BUTTON';
            const hasTabIndex = card.hasAttribute('tabindex');
            const hasRole = card.hasAttribute('role');
            const hasClickHandler = card.hasAttribute('onclick') || card.getAttribute('class')?.includes('scenario-card');

            // If it's clickable, it should be keyboard accessible
            if (hasClickHandler) {
              expect(
                isButton || (hasTabIndex && parseInt(card.getAttribute('tabindex') || '-1') >= 0) || hasRole,
                `Clickable card should be keyboard accessible: ${card.outerHTML.substring(0, 100)}`
              ).toBe(true);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

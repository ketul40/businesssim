import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import fc from 'fast-check';
import ScenarioModal from './ScenarioModal';
import { ScenarioTemplate, Stakeholder } from '../types/models';
import { SCENARIO_TEMPLATES, CUSTOM_SCENARIO_TEMPLATE } from '../constants/scenarios';

/**
 * Feature: app-optimization, Property 12: Form label associations
 * Validates: Requirements 6.2
 * 
 * For any form input element, it should have an associated label element with a matching 
 * htmlFor attribute or be wrapped in a label
 */

describe('Property 12: Form label associations', () => {
  const mockScenario: ScenarioTemplate = SCENARIO_TEMPLATES[0];
  
  const mockCustomScenario: ScenarioTemplate = {
    ...CUSTOM_SCENARIO_TEMPLATE,
    id: 'custom',
    title: 'Test Scenario',
    category: 'Custom',
    difficulty: 'Medium',
    rubricId: 'persuasion_director',
    description: 'Test description',
    situation: 'Test situation',
    objective: 'Test objective',
    turnLimit: 12,
    stakeholders: [
      {
        role: 'Test Role',
        name: 'Test Name',
        relationshipType: 'stakeholder',
        personality: 'Test personality',
        concerns: [],
        motivations: []
      }
    ],
    constraints: []
  } as ScenarioTemplate;

  it('all form inputs in custom scenario form have associated labels', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 10, maxLength: 200 }),
        fc.string({ minLength: 10, maxLength: 200 }),
        fc.integer({ min: 5, max: 20 }),
        (title, situation, objective, turnLimit) => {
          const customScenario = {
            ...mockCustomScenario,
            title,
            situation,
            objective,
            turnLimit
          };

          const { container } = render(
            <ScenarioModal
              selectedTemplate={null}
              showCustomForm={true}
              customScenario={customScenario}
              onClose={() => {}}
              onStartScenario={() => {}}
              onCustomSubmit={() => {}}
              onCustomScenarioChange={() => {}}
              onAddStakeholder={() => {}}
              onUpdateStakeholder={() => {}}
              onRemoveStakeholder={() => {}}
            />
          );

          // Get all form inputs (input, textarea, select)
          const inputs = container.querySelectorAll('input:not([type="submit"]):not([type="button"])');
          const textareas = container.querySelectorAll('textarea');
          const selects = container.querySelectorAll('select');

          const allFormElements = [...Array.from(inputs), ...Array.from(textareas), ...Array.from(selects)];

          // Check each form element has a label association
          allFormElements.forEach((element) => {
            const hasId = element.hasAttribute('id');
            const hasAriaLabel = element.hasAttribute('aria-label');
            const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');
            
            let hasAssociatedLabel = false;
            if (hasId) {
              const id = element.getAttribute('id');
              hasAssociatedLabel = container.querySelector(`label[for="${id}"]`) !== null;
            }

            // Check if wrapped in a label
            const isWrappedInLabel = element.closest('label') !== null;

            expect(
              hasAssociatedLabel || isWrappedInLabel || hasAriaLabel || hasAriaLabelledBy,
              `Form element should have an associated label: ${element.outerHTML.substring(0, 100)}`
            ).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('all stakeholder form inputs have associated labels', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 30 }),
            role: fc.string({ minLength: 1, maxLength: 30 }),
            relationshipType: fc.constantFrom('stakeholder', 'direct_report', 'peer'),
            personality: fc.string({ minLength: 0, maxLength: 100 }),
            concerns: fc.array(fc.string()),
            motivations: fc.array(fc.string())
          }),
          { minLength: 1, maxLength: 3 }
        ),
        (stakeholders) => {
          const customScenario = {
            ...mockCustomScenario,
            stakeholders: stakeholders as Stakeholder[]
          };

          const { container } = render(
            <ScenarioModal
              selectedTemplate={null}
              showCustomForm={true}
              customScenario={customScenario}
              onClose={() => {}}
              onStartScenario={() => {}}
              onCustomSubmit={() => {}}
              onCustomScenarioChange={() => {}}
              onAddStakeholder={() => {}}
              onUpdateStakeholder={() => {}}
              onRemoveStakeholder={() => {}}
            />
          );

          // Get all form inputs within stakeholder sections
          const stakeholderSections = container.querySelectorAll('.stakeholder-form-group');
          
          stakeholderSections.forEach((section) => {
            const inputs = section.querySelectorAll('input:not([type="submit"]):not([type="button"])');
            const selects = section.querySelectorAll('select');
            
            const formElements = [...Array.from(inputs), ...Array.from(selects)];

            formElements.forEach((element) => {
              const hasId = element.hasAttribute('id');
              const hasAriaLabel = element.hasAttribute('aria-label');
              const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');
              
              let hasAssociatedLabel = false;
              if (hasId) {
                const id = element.getAttribute('id');
                hasAssociatedLabel = container.querySelector(`label[for="${id}"]`) !== null;
              }

              const isWrappedInLabel = element.closest('label') !== null;

              expect(
                hasAssociatedLabel || isWrappedInLabel || hasAriaLabel || hasAriaLabelledBy,
                `Stakeholder form element should have an associated label: ${element.outerHTML.substring(0, 100)}`
              ).toBe(true);
            });
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('form inputs maintain label associations across different scenarios', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SCENARIO_TEMPLATES),
        (scenario) => {
          // Test with scenario details modal (no form inputs expected)
          const { container: detailsContainer } = render(
            <ScenarioModal
              selectedTemplate={scenario}
              showCustomForm={false}
              customScenario={mockCustomScenario}
              onClose={() => {}}
              onStartScenario={() => {}}
              onCustomSubmit={() => {}}
              onCustomScenarioChange={() => {}}
              onAddStakeholder={() => {}}
              onUpdateStakeholder={() => {}}
              onRemoveStakeholder={() => {}}
            />
          );

          // Scenario details modal shouldn't have form inputs
          const detailsInputs = detailsContainer.querySelectorAll('input:not([type="submit"]):not([type="button"]), textarea, select');
          
          // If there are any form inputs in details view, they should have labels
          detailsInputs.forEach((element) => {
            const hasId = element.hasAttribute('id');
            const hasAriaLabel = element.hasAttribute('aria-label');
            const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');
            
            let hasAssociatedLabel = false;
            if (hasId) {
              const id = element.getAttribute('id');
              hasAssociatedLabel = detailsContainer.querySelector(`label[for="${id}"]`) !== null;
            }

            const isWrappedInLabel = element.closest('label') !== null;

            expect(
              hasAssociatedLabel || isWrappedInLabel || hasAriaLabel || hasAriaLabelledBy,
              `Form element should have an associated label: ${element.outerHTML.substring(0, 100)}`
            ).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

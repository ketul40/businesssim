import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScenarioSelect from './ScenarioSelect';
import { SCENARIO_TEMPLATES } from '../constants/scenarios';

describe('ScenarioSelect', () => {
  const defaultProps = {
    onSelectScenario: vi.fn(),
    isGuest: false,
    onAuthRequired: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Scenario Filtering and Display', () => {
    test('renders all scenario templates', () => {
      render(<ScenarioSelect {...defaultProps} />);

      SCENARIO_TEMPLATES.forEach(template => {
        expect(screen.getByText(template.title)).toBeInTheDocument();
      });
    });

    test('renders custom scenario card', () => {
      render(<ScenarioSelect {...defaultProps} />);

      expect(screen.getByText('Create Custom')).toBeInTheDocument();
      expect(screen.getByText('Build your own workplace scenario')).toBeInTheDocument();
    });

    test('displays scenario difficulty badges', () => {
      render(<ScenarioSelect {...defaultProps} />);

      const easyScenarios = SCENARIO_TEMPLATES.filter(t => t.difficulty === 'Easy');
      const mediumScenarios = SCENARIO_TEMPLATES.filter(t => t.difficulty === 'Medium');
      const hardScenarios = SCENARIO_TEMPLATES.filter(t => t.difficulty === 'Hard');

      expect(screen.getAllByText('Easy')).toHaveLength(easyScenarios.length);
      expect(screen.getAllByText('Medium')).toHaveLength(mediumScenarios.length);
      expect(screen.getAllByText('Hard')).toHaveLength(hardScenarios.length);
    });

    test('displays turn limits for each scenario', () => {
      render(<ScenarioSelect {...defaultProps} />);

      // Check that turn limits are displayed (some may be duplicates)
      const uniqueTurnLimits = [...new Set(SCENARIO_TEMPLATES.map(t => t.turnLimit))];
      uniqueTurnLimits.forEach(turnLimit => {
        const elements = screen.getAllByText(`🎯 ${turnLimit} turns`);
        expect(elements.length).toBeGreaterThan(0);
      });
    });

    test('displays stakeholder counts correctly', () => {
      render(<ScenarioSelect {...defaultProps} />);

      const scenarioWithOneStakeholder = SCENARIO_TEMPLATES.find(t => t.stakeholders.length === 1);
      if (scenarioWithOneStakeholder) {
        const stakeholderType = scenarioWithOneStakeholder.stakeholders[0].relationshipType;
        const expectedText = stakeholderType === 'stakeholder' ? '1 stakeholder' :
                           stakeholderType === 'direct_report' ? '1 direct report' :
                           '1 peer';
        const elements = screen.getAllByText(new RegExp(expectedText));
        expect(elements.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Scenario Selection', () => {
    test('opens modal when scenario card is clicked', async () => {
      const user = userEvent.setup();
      render(<ScenarioSelect {...defaultProps} />);

      const firstScenario = SCENARIO_TEMPLATES[0];
      const scenarioCard = screen.getByText(firstScenario.title);
      await user.click(scenarioCard);

      // Modal should show detailed information
      expect(screen.getByText('Situation')).toBeInTheDocument();
      expect(screen.getByText('Your Objective')).toBeInTheDocument();
      expect(screen.getByText('Stakeholders')).toBeInTheDocument();
      expect(screen.getByText('Constraints')).toBeInTheDocument();
    });

    test('displays scenario details in modal', async () => {
      const user = userEvent.setup();
      render(<ScenarioSelect {...defaultProps} />);

      const firstScenario = SCENARIO_TEMPLATES[0];
      const scenarioCard = screen.getByText(firstScenario.title);
      await user.click(scenarioCard);

      expect(screen.getByText(firstScenario.situation)).toBeInTheDocument();
      expect(screen.getByText(firstScenario.objective)).toBeInTheDocument();
    });

    test('displays stakeholder information in modal', async () => {
      const user = userEvent.setup();
      render(<ScenarioSelect {...defaultProps} />);

      const scenarioWithStakeholders = SCENARIO_TEMPLATES.find(t => t.stakeholders.length > 0);
      if (scenarioWithStakeholders) {
        const scenarioCard = screen.getByText(scenarioWithStakeholders.title);
        await user.click(scenarioCard);

        scenarioWithStakeholders.stakeholders.forEach(stakeholder => {
          expect(screen.getByText(stakeholder.name)).toBeInTheDocument();
          expect(screen.getByText(new RegExp(stakeholder.role))).toBeInTheDocument();
        });
      }
    });

    test('displays constraints in modal', async () => {
      const user = userEvent.setup();
      render(<ScenarioSelect {...defaultProps} />);

      const firstScenario = SCENARIO_TEMPLATES[0];
      const scenarioCard = screen.getByText(firstScenario.title);
      await user.click(scenarioCard);

      firstScenario.constraints.forEach(constraint => {
        expect(screen.getByText(constraint)).toBeInTheDocument();
      });
    });

    test('closes modal when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<ScenarioSelect {...defaultProps} />);

      const firstScenario = SCENARIO_TEMPLATES[0];
      const scenarioCard = screen.getByText(firstScenario.title);
      await user.click(scenarioCard);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Situation')).not.toBeInTheDocument();
      });
    });

    test('closes modal when clicking overlay', async () => {
      const user = userEvent.setup();
      render(<ScenarioSelect {...defaultProps} />);

      const firstScenario = SCENARIO_TEMPLATES[0];
      const scenarioCard = screen.getByText(firstScenario.title);
      await user.click(scenarioCard);

      const overlay = document.querySelector('.scenario-modal-overlay');
      if (overlay) {
        await user.click(overlay);
      }

      await waitFor(() => {
        expect(screen.queryByText('Situation')).not.toBeInTheDocument();
      });
    });

    test('calls onSelectScenario when start button is clicked', async () => {
      const user = userEvent.setup();
      const onSelectScenario = vi.fn();
      render(<ScenarioSelect {...defaultProps} onSelectScenario={onSelectScenario} />);

      const firstScenario = SCENARIO_TEMPLATES[0];
      const scenarioCard = screen.getByText(firstScenario.title);
      await user.click(scenarioCard);

      const startButton = screen.getByRole('button', { name: /start simulation/i });
      await user.click(startButton);

      expect(onSelectScenario).toHaveBeenCalledWith(firstScenario);
    });
  });

  describe('Modal Interactions', () => {
    test('does not close modal when clicking inside modal content', async () => {
      const user = userEvent.setup();
      render(<ScenarioSelect {...defaultProps} />);

      const firstScenario = SCENARIO_TEMPLATES[0];
      const scenarioCard = screen.getByText(firstScenario.title);
      await user.click(scenarioCard);

      const modalContent = document.querySelector('.scenario-modal-content');
      if (modalContent) {
        await user.click(modalContent);
      }

      // Modal should still be open
      expect(screen.getByText('Situation')).toBeInTheDocument();
    });

    test('closes modal when X button is clicked', async () => {
      const user = userEvent.setup();
      render(<ScenarioSelect {...defaultProps} />);

      const firstScenario = SCENARIO_TEMPLATES[0];
      const scenarioCard = screen.getByText(firstScenario.title);
      await user.click(scenarioCard);

      const closeButton = document.querySelector('.scenario-modal-close');
      if (closeButton) {
        await user.click(closeButton);
      }

      await waitFor(() => {
        expect(screen.queryByText('Situation')).not.toBeInTheDocument();
      });
    });
  });

  describe('Custom Scenario Creation', () => {
    test('opens custom form when create custom card is clicked', async () => {
      const user = userEvent.setup();
      render(<ScenarioSelect {...defaultProps} />);

      const customCard = screen.getByText('Create Custom');
      await user.click(customCard);

      await waitFor(() => {
        expect(screen.getByText('Create Custom Scenario')).toBeInTheDocument();
        expect(screen.getByLabelText(/scenario title/i)).toBeInTheDocument();
      });
    });

    test('requires authentication for guests', async () => {
      const user = userEvent.setup();
      const onAuthRequired = vi.fn();
      render(<ScenarioSelect {...defaultProps} isGuest={true} onAuthRequired={onAuthRequired} />);

      const customCard = screen.getByText('Create Custom');
      await user.click(customCard);

      expect(onAuthRequired).toHaveBeenCalledWith('To create custom scenarios, you need to have an account');
      expect(screen.queryByText('Create Custom Scenario')).not.toBeInTheDocument();
    });

    test('allows filling in custom scenario fields', async () => {
      const user = userEvent.setup();
      render(<ScenarioSelect {...defaultProps} />);

      const customCard = screen.getByText('Create Custom');
      await user.click(customCard);

      const titleInput = await screen.findByLabelText(/scenario title/i);
      await user.type(titleInput, 'My Custom Scenario');
      expect(titleInput).toHaveValue('My Custom Scenario');

      const situationInput = screen.getByLabelText(/situation/i);
      await user.type(situationInput, 'This is the situation');
      expect(situationInput).toHaveValue('This is the situation');

      const objectiveInput = screen.getByLabelText(/your objective/i);
      await user.type(objectiveInput, 'This is the objective');
      expect(objectiveInput).toHaveValue('This is the objective');
    });

    test('allows adding stakeholders', async () => {
      const user = userEvent.setup();
      render(<ScenarioSelect {...defaultProps} />);

      const customCard = screen.getByText('Create Custom');
      await user.click(customCard);

      const addButton = screen.getByRole('button', { name: /add person/i });
      await user.click(addButton);

      expect(screen.getByText('Person 1')).toBeInTheDocument();
    });

    test('allows filling in stakeholder details', async () => {
      const user = userEvent.setup();
      render(<ScenarioSelect {...defaultProps} />);

      const customCard = screen.getByText('Create Custom');
      await user.click(customCard);

      await screen.findByLabelText(/scenario title/i);

      const addButton = screen.getByRole('button', { name: /add person/i });
      await user.click(addButton);

      await waitFor(() => {
        const nameInputs = screen.getAllByLabelText(/name/i);
        expect(nameInputs.length).toBeGreaterThan(0);
      });

      const nameInputs = screen.getAllByLabelText(/name/i);
      const stakeholderNameInput = nameInputs.find(input => 
        input.getAttribute('placeholder')?.includes('Sarah Johnson')
      );
      if (stakeholderNameInput) {
        await user.type(stakeholderNameInput, 'John Doe');
        expect(stakeholderNameInput).toHaveValue('John Doe');
      }

      const roleInputs = screen.getAllByLabelText(/role/i);
      const stakeholderRoleInput = roleInputs.find(input => 
        input.getAttribute('placeholder')?.includes('Senior Engineer')
      );
      if (stakeholderRoleInput) {
        await user.type(stakeholderRoleInput, 'Manager');
        expect(stakeholderRoleInput).toHaveValue('Manager');
      }
    });

    test('allows removing stakeholders', async () => {
      const user = userEvent.setup();
      render(<ScenarioSelect {...defaultProps} />);

      const customCard = screen.getByText('Create Custom');
      await user.click(customCard);

      const addButton = screen.getByRole('button', { name: /add person/i });
      await user.click(addButton);

      expect(screen.getByText('Person 1')).toBeInTheDocument();

      const removeButton = screen.getByRole('button', { name: /remove/i });
      await user.click(removeButton);

      expect(screen.queryByText('Person 1')).not.toBeInTheDocument();
    });

    test('shows error when trying to submit without stakeholders', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      render(<ScenarioSelect {...defaultProps} />);

      const customCard = screen.getByText('Create Custom');
      await user.click(customCard);

      const titleInput = await screen.findByLabelText(/scenario title/i);
      await user.type(titleInput, 'My Custom Scenario');

      const situationInput = screen.getByLabelText(/situation/i);
      await user.type(situationInput, 'Situation');

      const objectiveInput = screen.getByLabelText(/your objective/i);
      await user.type(objectiveInput, 'Objective');

      const submitButton = screen.getByRole('button', { name: /start simulation/i });
      await user.click(submitButton);

      expect(alertSpy).toHaveBeenCalledWith('Please add at least one person to interact with');
      alertSpy.mockRestore();
    });

    test('disables submit button when no stakeholders', async () => {
      const user = userEvent.setup();
      render(<ScenarioSelect {...defaultProps} />);

      const customCard = screen.getByText('Create Custom');
      await user.click(customCard);

      const submitButton = screen.getByRole('button', { name: /start simulation/i });
      expect(submitButton).toBeDisabled();
    });

    test('calls onSelectScenario with custom scenario when submitted', async () => {
      const user = userEvent.setup();
      const onSelectScenario = vi.fn();
      render(<ScenarioSelect {...defaultProps} onSelectScenario={onSelectScenario} />);

      const customCard = screen.getByText('Create Custom');
      await user.click(customCard);

      const titleInput = await screen.findByLabelText(/scenario title/i);
      await user.type(titleInput, 'My Custom Scenario');

      const situationInput = screen.getByLabelText(/situation/i);
      await user.type(situationInput, 'Situation');

      const objectiveInput = screen.getByLabelText(/your objective/i);
      await user.type(objectiveInput, 'Objective');

      const addButton = screen.getByRole('button', { name: /add person/i });
      await user.click(addButton);

      await waitFor(() => {
        const nameInputs = screen.getAllByLabelText(/name/i);
        expect(nameInputs.length).toBeGreaterThan(0);
      });

      const nameInputs = screen.getAllByLabelText(/name/i);
      const stakeholderNameInput = nameInputs.find(input => 
        input.getAttribute('placeholder')?.includes('Sarah Johnson')
      );
      if (stakeholderNameInput) {
        await user.type(stakeholderNameInput, 'John Doe');
      }

      const roleInputs = screen.getAllByLabelText(/role/i);
      const stakeholderRoleInput = roleInputs.find(input => 
        input.getAttribute('placeholder')?.includes('Senior Engineer')
      );
      if (stakeholderRoleInput) {
        await user.type(stakeholderRoleInput, 'Manager');
      }

      const submitButton = screen.getByRole('button', { name: /start simulation/i });
      await user.click(submitButton);

      expect(onSelectScenario).toHaveBeenCalled();
      const calledWith = onSelectScenario.mock.calls[0][0];
      expect(calledWith.title).toBe('My Custom Scenario');
      expect(calledWith.situation).toBe('Situation');
      expect(calledWith.objective).toBe('Objective');
      expect(calledWith.stakeholders).toHaveLength(1);
    });

    test('closes custom form when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<ScenarioSelect {...defaultProps} />);

      const customCard = screen.getByText('Create Custom');
      await user.click(customCard);

      expect(screen.getByText('Create Custom Scenario')).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Create Custom Scenario')).not.toBeInTheDocument();
      });
    });
  });
});

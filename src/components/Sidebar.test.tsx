import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from './Sidebar';
import { SIDEBAR_TABS } from '../constants/states';
import type { ScenarioTemplate } from '../types/models';

// Mock rubrics
vi.mock('../constants/rubrics', () => ({
  RUBRICS: {
    PERSUASION_DIRECTOR: {
      id: 'persuasion_director',
      name: 'Persuasion to a Director',
      criteria: [
        {
          name: 'Test Criterion',
          weight: 0.5,
          description: 'Test description',
          anchors: {
            1: 'Poor',
            3: 'Average',
            5: 'Excellent'
          }
        }
      ]
    }
  }
}));

describe('Sidebar', () => {
  const mockScenario: ScenarioTemplate = {
    id: 'test-scenario',
    title: 'Test Scenario',
    category: 'Test',
    difficulty: 'Medium',
    rubricId: 'persuasion_director',
    description: 'Test description',
    situation: 'Test situation',
    objective: 'Test objective',
    turnLimit: 10,
    stakeholders: [
      {
        role: 'Director',
        name: 'Jane Smith',
        relationshipType: 'stakeholder',
        personality: 'Analytical and detail-oriented',
        concerns: ['Budget constraints', 'Timeline'],
        motivations: ['Team success', 'Innovation']
      }
    ],
    constraints: ['Limited budget', 'Tight deadline']
  };

  const mockOnTabChange = vi.fn();
  const mockOnNotesChange = vi.fn();
  const mockOnFileUpload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Tab Switching', () => {
    it('should render all three tabs', () => {
      render(
        <Sidebar
          scenario={mockScenario}
          activeTab={SIDEBAR_TABS.CONTEXT}
          onTabChange={mockOnTabChange}
          notes=""
          onNotesChange={mockOnNotesChange}
        />
      );

      expect(screen.getByRole('tab', { name: /context tab/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /rubric tab/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /notes tab/i })).toBeInTheDocument();
    });

    it('should highlight active tab', () => {
      render(
        <Sidebar
          scenario={mockScenario}
          activeTab={SIDEBAR_TABS.CONTEXT}
          onTabChange={mockOnTabChange}
          notes=""
          onNotesChange={mockOnNotesChange}
        />
      );

      const contextTab = screen.getByRole('tab', { name: /context tab/i });
      expect(contextTab).toHaveClass('active');
    });

    it('should call onTabChange when tab is clicked', () => {
      render(
        <Sidebar
          scenario={mockScenario}
          activeTab={SIDEBAR_TABS.CONTEXT}
          onTabChange={mockOnTabChange}
          notes=""
          onNotesChange={mockOnNotesChange}
        />
      );

      const rubricTab = screen.getByRole('tab', { name: /rubric tab/i });
      fireEvent.click(rubricTab);

      expect(mockOnTabChange).toHaveBeenCalledWith(SIDEBAR_TABS.RUBRIC);
    });

    it('should switch between tabs correctly', () => {
      const { rerender } = render(
        <Sidebar
          scenario={mockScenario}
          activeTab={SIDEBAR_TABS.CONTEXT}
          onTabChange={mockOnTabChange}
          notes=""
          onNotesChange={mockOnNotesChange}
        />
      );

      expect(screen.getByText('Scenario Context')).toBeInTheDocument();

      rerender(
        <Sidebar
          scenario={mockScenario}
          activeTab={SIDEBAR_TABS.RUBRIC}
          onTabChange={mockOnTabChange}
          notes=""
          onNotesChange={mockOnNotesChange}
        />
      );

      expect(screen.getByText('Persuasion to a Director')).toBeInTheDocument();

      rerender(
        <Sidebar
          scenario={mockScenario}
          activeTab={SIDEBAR_TABS.NOTES}
          onTabChange={mockOnTabChange}
          notes=""
          onNotesChange={mockOnNotesChange}
        />
      );

      expect(screen.getByText('Your Notes')).toBeInTheDocument();
    });
  });

  describe('Context Tab', () => {
    it('should display stakeholder information', () => {
      render(
        <Sidebar
          scenario={mockScenario}
          activeTab={SIDEBAR_TABS.CONTEXT}
          onTabChange={mockOnTabChange}
          notes=""
          onNotesChange={mockOnNotesChange}
        />
      );

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Director')).toBeInTheDocument();
      expect(screen.getByText('Analytical and detail-oriented')).toBeInTheDocument();
      expect(screen.getByText('Budget constraints')).toBeInTheDocument();
      expect(screen.getByText('Team success')).toBeInTheDocument();
    });

    it('should display constraints', () => {
      render(
        <Sidebar
          scenario={mockScenario}
          activeTab={SIDEBAR_TABS.CONTEXT}
          onTabChange={mockOnTabChange}
          notes=""
          onNotesChange={mockOnNotesChange}
        />
      );

      expect(screen.getByText('Limited budget')).toBeInTheDocument();
      expect(screen.getByText('Tight deadline')).toBeInTheDocument();
    });

    it('should handle file upload', () => {
      render(
        <Sidebar
          scenario={mockScenario}
          activeTab={SIDEBAR_TABS.CONTEXT}
          onTabChange={mockOnTabChange}
          notes=""
          onNotesChange={mockOnNotesChange}
          onFileUpload={mockOnFileUpload}
        />
      );

      const fileInput = screen.getByLabelText(/upload context files/i);
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(mockOnFileUpload).toHaveBeenCalledWith(file);
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    it('should allow removing uploaded files', () => {
      render(
        <Sidebar
          scenario={mockScenario}
          activeTab={SIDEBAR_TABS.CONTEXT}
          onTabChange={mockOnTabChange}
          notes=""
          onNotesChange={mockOnNotesChange}
          onFileUpload={mockOnFileUpload}
        />
      );

      const fileInput = screen.getByLabelText(/upload context files/i);
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

      fireEvent.change(fileInput, { target: { files: [file] } });
      expect(screen.getByText('test.pdf')).toBeInTheDocument();

      const removeButton = screen.getByLabelText(/remove test\.pdf/i);
      fireEvent.click(removeButton);

      expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
    });
  });

  describe('Rubric Tab', () => {
    it('should display rubric name and criteria', () => {
      render(
        <Sidebar
          scenario={mockScenario}
          activeTab={SIDEBAR_TABS.RUBRIC}
          onTabChange={mockOnTabChange}
          notes=""
          onNotesChange={mockOnNotesChange}
        />
      );

      expect(screen.getByText('Persuasion to a Director')).toBeInTheDocument();
      expect(screen.getByText('Test Criterion')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument(); // weight * 100
    });

    it('should display criterion anchors', () => {
      render(
        <Sidebar
          scenario={mockScenario}
          activeTab={SIDEBAR_TABS.RUBRIC}
          onTabChange={mockOnTabChange}
          notes=""
          onNotesChange={mockOnNotesChange}
        />
      );

      expect(screen.getByText('Poor')).toBeInTheDocument();
      expect(screen.getByText('Average')).toBeInTheDocument();
      expect(screen.getByText('Excellent')).toBeInTheDocument();
    });
  });

  describe('Notes Tab', () => {
    it('should display notes textarea', () => {
      render(
        <Sidebar
          scenario={mockScenario}
          activeTab={SIDEBAR_TABS.NOTES}
          onTabChange={mockOnTabChange}
          notes=""
          onNotesChange={mockOnNotesChange}
        />
      );

      const textarea = screen.getByPlaceholderText(/take notes during the simulation/i);
      expect(textarea).toBeInTheDocument();
    });

    it('should call onNotesChange when notes are updated', () => {
      render(
        <Sidebar
          scenario={mockScenario}
          activeTab={SIDEBAR_TABS.NOTES}
          onTabChange={mockOnTabChange}
          notes=""
          onNotesChange={mockOnNotesChange}
        />
      );

      const textarea = screen.getByPlaceholderText(/take notes during the simulation/i);
      fireEvent.change(textarea, { target: { value: 'My test notes' } });

      expect(mockOnNotesChange).toHaveBeenCalledWith('My test notes');
    });

    it('should display existing notes', () => {
      render(
        <Sidebar
          scenario={mockScenario}
          activeTab={SIDEBAR_TABS.NOTES}
          onTabChange={mockOnTabChange}
          notes="Existing notes content"
          onNotesChange={mockOnNotesChange}
        />
      );

      const textarea = screen.getByPlaceholderText(/take notes during the simulation/i) as HTMLTextAreaElement;
      expect(textarea.value).toBe('Existing notes content');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for tabs', () => {
      render(
        <Sidebar
          scenario={mockScenario}
          activeTab={SIDEBAR_TABS.CONTEXT}
          onTabChange={mockOnTabChange}
          notes=""
          onNotesChange={mockOnNotesChange}
        />
      );

      const contextTab = screen.getByRole('tab', { name: /context tab/i });
      expect(contextTab).toHaveAttribute('aria-selected', 'true');
      expect(contextTab).toHaveAttribute('aria-controls', 'sidebar-content');

      const rubricTab = screen.getByRole('tab', { name: /rubric tab/i });
      expect(rubricTab).toHaveAttribute('aria-selected', 'false');
    });

    it('should have proper tablist role', () => {
      render(
        <Sidebar
          scenario={mockScenario}
          activeTab={SIDEBAR_TABS.CONTEXT}
          onTabChange={mockOnTabChange}
          notes=""
          onNotesChange={mockOnNotesChange}
        />
      );

      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });
  });
});

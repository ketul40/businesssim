import { useState, memo, useCallback, FormEvent } from 'react';
import { SCENARIO_TEMPLATES } from '../constants/scenarios.ts';
import { ScenarioTemplate, Stakeholder } from '../types/models';
import { ScenarioSelectProps } from '../types/props';
import ScenarioCard from './ScenarioCard';
import ScenarioModal from './ScenarioModal';

const ScenarioSelect = memo(function ScenarioSelect({ 
  onSelectScenario, 
  isGuest, 
  onAuthRequired 
}: ScenarioSelectProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ScenarioTemplate | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customScenario, setCustomScenario] = useState<ScenarioTemplate>({
    id: 'custom',
    title: '',
    category: 'Custom',
    difficulty: 'Medium',
    rubricId: 'persuasion_director',
    description: '',
    situation: '',
    objective: '',
    turnLimit: 12,
    stakeholders: [],
    constraints: []
  });

  const handleTemplateSelect = useCallback((template: ScenarioTemplate) => {
    setSelectedTemplate(template);
    setShowCustomForm(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedTemplate(null);
    setShowCustomForm(false);
  }, []);

  const handleStartScenario = useCallback(() => {
    if (selectedTemplate) {
      onSelectScenario(selectedTemplate);
    }
  }, [selectedTemplate, onSelectScenario]);

  const handleCreateCustom = useCallback(() => {
    if (isGuest && onAuthRequired) {
      onAuthRequired('To create custom scenarios, you need to have an account');
      return;
    }
    
    setShowCustomForm(true);
    setSelectedTemplate(null);
    setCustomScenario({
      id: 'custom',
      title: '',
      category: 'Custom',
      difficulty: 'Medium',
      rubricId: 'persuasion_director',
      description: '',
      situation: '',
      objective: '',
      turnLimit: 12,
      stakeholders: [],
      constraints: []
    });
  }, [isGuest, onAuthRequired]);

  const addStakeholder = useCallback(() => {
    setCustomScenario(prev => ({
      ...prev,
      stakeholders: [
        ...prev.stakeholders,
        { 
          name: '', 
          role: '', 
          relationshipType: 'stakeholder' as const, 
          personality: '', 
          concerns: [], 
          motivations: [] 
        }
      ]
    }));
  }, []);

  const updateStakeholder = useCallback((index: number, field: keyof Stakeholder, value: string) => {
    setCustomScenario(prev => {
      const updatedStakeholders = [...prev.stakeholders];
      const currentStakeholder = updatedStakeholders[index];
      updatedStakeholders[index] = {
        ...currentStakeholder,
        [field]: value
      } as Stakeholder;
      return { ...prev, stakeholders: updatedStakeholders };
    });
  }, []);

  const removeStakeholder = useCallback((index: number) => {
    setCustomScenario(prev => ({
      ...prev,
      stakeholders: prev.stakeholders.filter((_, i) => i !== index)
    }));
  }, []);

  const handleCustomSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (customScenario.stakeholders.length === 0) {
      alert('Please add at least one person to interact with');
      return;
    }
    
    onSelectScenario(customScenario);
  }, [customScenario, onSelectScenario]);

  const handleCustomScenarioChange = useCallback((updates: Partial<ScenarioTemplate>) => {
    setCustomScenario(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <div className="scenario-select">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Master Workplace Communication Through AI-Powered Simulations</h1>
          <p className="hero-subtitle">
            Navigate tough conversations, pitch ideas to skeptical stakeholders, and handle difficult team situations—all in a safe environment where you can practice, learn, and grow without the pressure.
          </p>
          <div className="hero-features">
            <div className="hero-feature">
              <h3>Realistic AI Conversations</h3>
              <p>Practice with AI that responds naturally and challenges you—just like real stakeholders would</p>
            </div>
            <div className="hero-feature">
              <h3>Learn From Every Interaction</h3>
              <p>Get detailed feedback on what worked, what didn't, and exactly how to improve</p>
            </div>
            <div className="hero-feature">
              <h3>See Your Growth</h3>
              <p>Watch your communication skills improve as you tackle more scenarios and challenges</p>
            </div>
          </div>
        </div>
      </div>

      <div className="scenario-header">
        <h1>Ready to Practice?</h1>
        <p>Pick a scenario below to start your simulation, or build your own custom challenge</p>
      </div>

      <div className="scenario-templates">
        {SCENARIO_TEMPLATES.map((template: ScenarioTemplate) => (
          <ScenarioCard
            key={template.id}
            template={template}
            onClick={() => handleTemplateSelect(template)}
          />
        ))}

        <ScenarioCard
          isCustomCard
          onClick={handleCreateCustom}
        />
      </div>

      <ScenarioModal
        selectedTemplate={selectedTemplate}
        showCustomForm={showCustomForm}
        customScenario={customScenario}
        onClose={handleCloseModal}
        onStartScenario={handleStartScenario}
        onCustomSubmit={handleCustomSubmit}
        onCustomScenarioChange={handleCustomScenarioChange}
        onAddStakeholder={addStakeholder}
        onUpdateStakeholder={updateStakeholder}
        onRemoveStakeholder={removeStakeholder}
      />
    </div>
  );
});

export default ScenarioSelect;

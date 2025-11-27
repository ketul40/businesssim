import { memo, FormEvent } from 'react';
import { Play, Plus, Target, TrendingUp, Users, X } from 'lucide-react';
import { ScenarioTemplate, Stakeholder } from '../types/models';

interface ScenarioModalProps {
  selectedTemplate: ScenarioTemplate | null;
  showCustomForm: boolean;
  customScenario: ScenarioTemplate;
  onClose: () => void;
  onStartScenario: () => void;
  onCustomSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCustomScenarioChange: (updates: Partial<ScenarioTemplate>) => void;
  onAddStakeholder: () => void;
  onUpdateStakeholder: (index: number, field: keyof Stakeholder, value: string) => void;
  onRemoveStakeholder: (index: number) => void;
}

const ScenarioModal = memo(function ScenarioModal({
  selectedTemplate,
  showCustomForm,
  customScenario,
  onClose,
  onStartScenario,
  onCustomSubmit,
  onCustomScenarioChange,
  onAddStakeholder,
  onUpdateStakeholder,
  onRemoveStakeholder
}: ScenarioModalProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Persuasion':
        return <Target className="icon" />;
      case 'Reporting':
        return <TrendingUp className="icon" />;
      case 'Negotiation':
        return <Users className="icon" />;
      default:
        return <Play className="icon" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return '#10b981';
      case 'Medium':
        return '#f59e0b';
      case 'Hard':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getRelationshipText = (stakeholders: ScenarioTemplate['stakeholders']) => {
    if (!stakeholders || stakeholders.length === 0) return '👥 No participants';
    
    const counts = {
      stakeholder: 0,
      direct_report: 0,
      peer: 0
    };
    
    stakeholders.forEach(s => {
      if (s.relationshipType) {
        counts[s.relationshipType]++;
      }
    });
    
    const parts = [];
    if (counts.stakeholder > 0) {
      parts.push(`${counts.stakeholder} stakeholder${counts.stakeholder > 1 ? 's' : ''}`);
    }
    if (counts.direct_report > 0) {
      parts.push(`${counts.direct_report} direct report${counts.direct_report > 1 ? 's' : ''}`);
    }
    if (counts.peer > 0) {
      parts.push(`${counts.peer} peer${counts.peer > 1 ? 's' : ''}`);
    }
    
    return `👥 ${parts.join(', ')}`;
  };

  // Scenario Details Modal
  if (selectedTemplate && !showCustomForm) {
    return (
      <div className="scenario-modal-overlay" onClick={onClose}>
        <div className="scenario-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="scenario-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
          
          <div className="scenario-modal-header">
            <div className="scenario-modal-icon">
              {getCategoryIcon(selectedTemplate.category)}
            </div>
            <div>
              <h2>{selectedTemplate.title}</h2>
              <div className="scenario-modal-badges">
                <span
                  className="difficulty-badge"
                  style={{ backgroundColor: getDifficultyColor(selectedTemplate.difficulty) }}
                >
                  {selectedTemplate.difficulty}
                </span>
                <span className="meta-badge">🎯 {selectedTemplate.turnLimit} turns</span>
                <span className="meta-badge">{getRelationshipText(selectedTemplate.stakeholders)}</span>
              </div>
            </div>
          </div>

          <div className="scenario-modal-body">
            <div className="detail-section">
              <h4>Situation</h4>
              <p>{selectedTemplate.situation}</p>
            </div>
            <div className="detail-section">
              <h4>Your Objective</h4>
              <p>{selectedTemplate.objective}</p>
            </div>
            <div className="detail-section">
              <h4>Stakeholders</h4>
              {selectedTemplate.stakeholders.map((stakeholder, idx) => (
                <div key={idx} className="stakeholder-info">
                  <strong>{stakeholder.name}</strong> - {stakeholder.role}
                  <p className="stakeholder-personality">{stakeholder.personality}</p>
                </div>
              ))}
            </div>
            <div className="detail-section">
              <h4>Constraints</h4>
              <ul>
                {selectedTemplate.constraints.map((constraint, idx) => (
                  <li key={idx}>{constraint}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="scenario-modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary btn-large" onClick={onStartScenario}>
              <Play size={20} />
              Start Simulation
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Custom Scenario Form Modal
  if (showCustomForm) {
    return (
      <div className="scenario-modal-overlay" onClick={onClose}>
        <div className="scenario-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="scenario-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
          
          <div className="scenario-modal-header">
            <div className="scenario-modal-icon">
              <Plus size={32} />
            </div>
            <div>
              <h2>Create Custom Scenario</h2>
              <p style={{ opacity: 0.8, fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Build your own workplace scenario
              </p>
            </div>
          </div>

          <div className="scenario-modal-body">
            <form onSubmit={onCustomSubmit} id="custom-scenario-form">
              <div className="form-group">
                <label htmlFor="scenario-title">Scenario Title *</label>
                <input
                  id="scenario-title"
                  type="text"
                  required
                  value={customScenario.title}
                  onChange={(e) => onCustomScenarioChange({ title: e.target.value })}
                  placeholder="E.g., Quarterly Planning with VP"
                />
              </div>
              <div className="form-group">
                <label htmlFor="scenario-situation">Situation *</label>
                <textarea
                  id="scenario-situation"
                  required
                  value={customScenario.situation}
                  onChange={(e) => onCustomScenarioChange({ situation: e.target.value })}
                  placeholder="Describe the context and background..."
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label htmlFor="scenario-objective">Your Objective *</label>
                <textarea
                  id="scenario-objective"
                  required
                  value={customScenario.objective}
                  onChange={(e) => onCustomScenarioChange({ objective: e.target.value })}
                  placeholder="What are you trying to achieve?"
                  rows={2}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="scenario-turn-limit">Turn Limit</label>
                  <input
                    id="scenario-turn-limit"
                    type="number"
                    min="5"
                    max="20"
                    value={customScenario.turnLimit}
                    onChange={(e) => onCustomScenarioChange({ turnLimit: parseInt(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="scenario-rubric">Rubric</label>
                  <select
                    id="scenario-rubric"
                    value={customScenario.rubricId}
                    onChange={(e) => onCustomScenarioChange({ rubricId: e.target.value })}
                  >
                    <option value="persuasion_director">Persuasion</option>
                    <option value="monthly_business_review">Business Review</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Who will you interact with? *</label>
                <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '0.75rem' }}>
                  Add the people you'll be talking to in this scenario
                </p>
                
                {customScenario.stakeholders.map((stakeholder, index) => (
                  <div key={index} className="stakeholder-form-group">
                    <div className="stakeholder-form-header">
                      <h4>Person {index + 1}</h4>
                      <button
                        type="button"
                        className="btn btn-ghost btn-small"
                        onClick={() => onRemoveStakeholder(index)}
                      >
                        <X size={16} />
                        Remove
                      </button>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor={`stakeholder-name-${index}`}>Name *</label>
                        <input
                          id={`stakeholder-name-${index}`}
                          type="text"
                          required
                          value={stakeholder.name}
                          onChange={(e) => onUpdateStakeholder(index, 'name', e.target.value)}
                          placeholder="E.g., Sarah Johnson"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`stakeholder-role-${index}`}>Role *</label>
                        <input
                          id={`stakeholder-role-${index}`}
                          type="text"
                          required
                          value={stakeholder.role}
                          onChange={(e) => onUpdateStakeholder(index, 'role', e.target.value)}
                          placeholder="E.g., Senior Engineer"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor={`stakeholder-relationship-${index}`}>Relationship Type *</label>
                      <select
                        id={`stakeholder-relationship-${index}`}
                        required
                        value={stakeholder.relationshipType}
                        onChange={(e) => onUpdateStakeholder(index, 'relationshipType', e.target.value)}
                      >
                        <option value="stakeholder">Stakeholder (Manager, Director, VP, etc.)</option>
                        <option value="direct_report">Direct Report (Team Member)</option>
                        <option value="peer">Peer (Colleague at same level)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor={`stakeholder-personality-${index}`}>Personality (Optional)</label>
                      <input
                        id={`stakeholder-personality-${index}`}
                        type="text"
                        value={stakeholder.personality}
                        onChange={(e) => onUpdateStakeholder(index, 'personality', e.target.value)}
                        placeholder="E.g., Analytical, detail-oriented, values data"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={onAddStakeholder}
                  style={{ marginTop: '0.5rem' }}
                >
                  <Plus size={16} />
                  Add Person
                </button>
                
                {customScenario.stakeholders.length === 0 && (
                  <p style={{ fontSize: '0.875rem', color: '#ef4444', marginTop: '0.5rem' }}>
                    You must add at least one person to interact with
                  </p>
                )}
              </div>
            </form>
          </div>

          <div className="scenario-modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              form="custom-scenario-form" 
              className="btn btn-primary btn-large"
              disabled={customScenario.stakeholders.length === 0}
            >
              <Play size={20} />
              Start Simulation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
});

export default ScenarioModal;

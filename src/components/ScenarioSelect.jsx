import { useState, memo } from 'react';
import { SCENARIO_TEMPLATES, CUSTOM_SCENARIO_TEMPLATE } from '../constants/scenarios';
import { Play, Plus, Target, TrendingUp, Users, X } from 'lucide-react';

const ScenarioSelect = memo(function ScenarioSelect({ onSelectScenario, isGuest, onAuthRequired }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customScenario, setCustomScenario] = useState({ ...CUSTOM_SCENARIO_TEMPLATE });

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setShowCustomForm(false);
  };

  const handleCloseModal = () => {
    setSelectedTemplate(null);
    setShowCustomForm(false);
  };

  const handleStartScenario = () => {
    if (selectedTemplate) {
      onSelectScenario(selectedTemplate);
    }
  };

  const handleCreateCustom = () => {
    // Check if user is a guest and require authentication
    if (isGuest && onAuthRequired) {
      onAuthRequired('To create custom scenarios, you need to have an account');
      return;
    }
    
    setShowCustomForm(true);
    setSelectedTemplate(null);
    setCustomScenario({ ...CUSTOM_SCENARIO_TEMPLATE, stakeholders: [] });
  };

  const addStakeholder = () => {
    setCustomScenario({
      ...customScenario,
      stakeholders: [
        ...customScenario.stakeholders,
        { name: '', role: '', relationshipType: 'stakeholder', personality: '', concerns: [], motivations: [] }
      ]
    });
  };

  const updateStakeholder = (index, field, value) => {
    const updatedStakeholders = [...customScenario.stakeholders];
    updatedStakeholders[index][field] = value;
    setCustomScenario({ ...customScenario, stakeholders: updatedStakeholders });
  };

  const removeStakeholder = (index) => {
    const updatedStakeholders = customScenario.stakeholders.filter((_, i) => i !== index);
    setCustomScenario({ ...customScenario, stakeholders: updatedStakeholders });
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    
    // Validate at least one stakeholder
    if (customScenario.stakeholders.length === 0) {
      alert('Please add at least one person to interact with');
      return;
    }
    
    onSelectScenario(customScenario);
  };

  const getCategoryIcon = (category) => {
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

  const getDifficultyColor = (difficulty) => {
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

  const getRelationshipText = (stakeholders) => {
    if (!stakeholders || stakeholders.length === 0) return '👥 No participants';
    
    // Count each type
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
    
    // Build text based on what's present
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

  return (
    <div className="scenario-select">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Simulate Workplace Communication Through AI-Powered Simulations</h1>
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
        {SCENARIO_TEMPLATES.map((template) => (
          <div
            key={template.id}
            className="scenario-card"
            onClick={() => handleTemplateSelect(template)}
          >
            <div className="scenario-card-header">
              {getCategoryIcon(template.category)}
              <span
                className="difficulty-badge"
                style={{ backgroundColor: getDifficultyColor(template.difficulty) }}
              >
                {template.difficulty}
              </span>
            </div>
            <h3>{template.title}</h3>
            <p className="scenario-description">{template.description}</p>
            <div className="scenario-meta">
              <span>🎯 {template.turnLimit} turns</span>
              <span>{getRelationshipText(template.stakeholders)}</span>
            </div>
          </div>
        ))}

        <div className="scenario-card custom-card" onClick={handleCreateCustom}>
          <Plus className="icon-large" />
          <h3>Create Custom</h3>
          <p className="scenario-description">Build your own workplace scenario</p>
        </div>
      </div>

      {/* Scenario Details Modal */}
      {selectedTemplate && !showCustomForm && (
        <div className="scenario-modal-overlay" onClick={handleCloseModal}>
          <div className="scenario-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="scenario-modal-close" onClick={handleCloseModal}>
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
              <button className="btn btn-secondary" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="btn btn-primary btn-large" onClick={handleStartScenario}>
                <Play size={20} />
                Start Simulation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Scenario Form Modal */}
      {showCustomForm && (
        <div className="scenario-modal-overlay" onClick={handleCloseModal}>
          <div className="scenario-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="scenario-modal-close" onClick={handleCloseModal}>
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
              <form onSubmit={handleCustomSubmit} id="custom-scenario-form">
                <div className="form-group">
                  <label>Scenario Title *</label>
                  <input
                    type="text"
                    required
                    value={customScenario.title}
                    onChange={(e) => setCustomScenario({ ...customScenario, title: e.target.value })}
                    placeholder="E.g., Quarterly Planning with VP"
                  />
                </div>
                <div className="form-group">
                  <label>Situation *</label>
                  <textarea
                    required
                    value={customScenario.situation}
                    onChange={(e) => setCustomScenario({ ...customScenario, situation: e.target.value })}
                    placeholder="Describe the context and background..."
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>Your Objective *</label>
                  <textarea
                    required
                    value={customScenario.objective}
                    onChange={(e) => setCustomScenario({ ...customScenario, objective: e.target.value })}
                    placeholder="What are you trying to achieve?"
                    rows={2}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Turn Limit</label>
                    <input
                      type="number"
                      min="5"
                      max="20"
                      value={customScenario.turnLimit}
                      onChange={(e) => setCustomScenario({ ...customScenario, turnLimit: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Rubric</label>
                    <select
                      value={customScenario.rubricId}
                      onChange={(e) => setCustomScenario({ ...customScenario, rubricId: e.target.value })}
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
                          onClick={() => removeStakeholder(index)}
                        >
                          <X size={16} />
                          Remove
                        </button>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>Name *</label>
                          <input
                            type="text"
                            required
                            value={stakeholder.name}
                            onChange={(e) => updateStakeholder(index, 'name', e.target.value)}
                            placeholder="E.g., Sarah Johnson"
                          />
                        </div>
                        <div className="form-group">
                          <label>Role *</label>
                          <input
                            type="text"
                            required
                            value={stakeholder.role}
                            onChange={(e) => updateStakeholder(index, 'role', e.target.value)}
                            placeholder="E.g., Senior Engineer"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Relationship Type *</label>
                        <select
                          required
                          value={stakeholder.relationshipType}
                          onChange={(e) => updateStakeholder(index, 'relationshipType', e.target.value)}
                        >
                          <option value="stakeholder">Stakeholder (Manager, Director, VP, etc.)</option>
                          <option value="direct_report">Direct Report (Team Member)</option>
                          <option value="peer">Peer (Colleague at same level)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Personality (Optional)</label>
                        <input
                          type="text"
                          value={stakeholder.personality}
                          onChange={(e) => updateStakeholder(index, 'personality', e.target.value)}
                          placeholder="E.g., Analytical, detail-oriented, values data"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn btn-secondary btn-small"
                    onClick={addStakeholder}
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
              <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
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
      )}
    </div>
  );
});

export default ScenarioSelect;

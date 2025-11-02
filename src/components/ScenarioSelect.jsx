import { useState } from 'react';
import { SCENARIO_TEMPLATES, CUSTOM_SCENARIO_TEMPLATE } from '../constants/scenarios';
import { Play, Plus, Target, TrendingUp, Users } from 'lucide-react';

export default function ScenarioSelect({ onSelectScenario, isGuest, onAuthRequired }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customScenario, setCustomScenario] = useState({ ...CUSTOM_SCENARIO_TEMPLATE });

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
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
    setCustomScenario({ ...CUSTOM_SCENARIO_TEMPLATE });
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
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

  return (
    <div className="scenario-select">
      <div className="scenario-header">
        <h1>Choose Your Scenario</h1>
        <p>Select a workplace situation to practice, or create your own custom scenario</p>
        {isGuest && (
          <div className="guest-info-banner">
            👋 Welcome! You can try all pre-written scenarios without an account. 
            Sign up to save your progress and create custom scenarios.
          </div>
        )}
      </div>

      <div className="scenario-templates">
        {SCENARIO_TEMPLATES.map((template) => (
          <div
            key={template.id}
            className={`scenario-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
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
              <span>👥 {template.stakeholders.length} stakeholder{template.stakeholders.length > 1 ? 's' : ''}</span>
            </div>
          </div>
        ))}

        <div className="scenario-card custom-card" onClick={handleCreateCustom}>
          <Plus className="icon-large" />
          <h3>Create Custom</h3>
          <p className="scenario-description">Build your own workplace scenario</p>
        </div>
      </div>

      {selectedTemplate && !showCustomForm && (
        <div className="scenario-details">
          <h2>{selectedTemplate.title}</h2>
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
          <button className="btn btn-primary btn-large" onClick={handleStartScenario}>
            <Play size={20} />
            Start Simulation
          </button>
        </div>
      )}

      {showCustomForm && (
        <div className="scenario-details custom-form">
          <h2>Create Custom Scenario</h2>
          <form onSubmit={handleCustomSubmit}>
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
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowCustomForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Play size={20} />
                Start Simulation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}


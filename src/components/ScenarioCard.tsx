import { memo } from 'react';
import { Play, Plus, Target, TrendingUp, Users } from 'lucide-react';
import { ScenarioTemplate } from '../types/models';

interface ScenarioCardProps {
  template?: ScenarioTemplate;
  isCustomCard?: boolean;
  onClick: () => void;
}

const ScenarioCard = memo(function ScenarioCard({ 
  template, 
  isCustomCard = false, 
  onClick 
}: ScenarioCardProps) {
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

  if (isCustomCard) {
    return (
      <div 
        className="scenario-card custom-card" 
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        aria-label="Create custom scenario"
      >
        <Plus className="icon-large" />
        <h3>Create Custom</h3>
        <p className="scenario-description">Build your own workplace scenario</p>
      </div>
    );
  }

  if (!template) {
    return null;
  }

  return (
    <div
      className="scenario-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={template ? `Select scenario: ${template.title}` : 'Create custom scenario'}
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
  );
});

export default ScenarioCard;

import { useState, memo } from 'react';
import { Home, TrendingUp } from 'lucide-react';
import { getScoreLabel } from '../constants/rubrics';
import { FeedbackProps } from '../types/props';
import { OverallScoreCard } from './OverallScoreCard';
import { CriteriaScores } from './CriteriaScores';
import { MissedOpportunities } from './MissedOpportunities';
import { MomentsThatMattered } from './MomentsThatMattered';
import { PracticeDrills } from './PracticeDrills';

type FeedbackSection = 'overview' | 'moments' | 'drills';

const Feedback = memo(function Feedback({ 
  evaluation, 
  scenario, 
  onBackHome, 
  onRerunScenario, 
  isGuest, 
  onAuthRequired 
}: FeedbackProps) {
  const [activeSection, setActiveSection] = useState<FeedbackSection>('overview');
  
  if (!evaluation) {
    return (
      <div className="feedback-loading">
        <div className="spinner"></div>
        <p>Analyzing your performance...</p>
      </div>
    );
  }

  const scoreLabel = getScoreLabel(evaluation.overall_score);

  return (
    <div className="feedback-container">
      <div className="feedback-header">
        <h1>Your Performance Report</h1>
        <p className="scenario-title">{scenario.title}</p>
        {isGuest && (
          <div className="guest-feedback-banner">
            <p>📊 Great job! Sign up to save this report and track your progress over time.</p>
            <button 
              className="btn btn-primary btn-small"
              onClick={() => onAuthRequired && onAuthRequired('To save your performance reports and track improvement over time')}
            >
              Sign Up to Save Progress
            </button>
          </div>
        )}
      </div>

      <div className="feedback-nav">
        <button
          className={`nav-btn ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSection('overview')}
        >
          Overview
        </button>
        <button
          className={`nav-btn ${activeSection === 'moments' ? 'active' : ''}`}
          onClick={() => setActiveSection('moments')}
        >
          Key Moments
        </button>
        <button
          className={`nav-btn ${activeSection === 'drills' ? 'active' : ''}`}
          onClick={() => setActiveSection('drills')}
        >
          Practice Drills
        </button>
      </div>

      <div className="feedback-content">
        {activeSection === 'overview' && (
          <>
            <OverallScoreCard 
              score={evaluation.overall_score} 
              scoreLabel={scoreLabel} 
            />
            <CriteriaScores criterionScores={evaluation.criterion_scores} />
            <MissedOpportunities opportunities={evaluation.missed_opportunities} />
          </>
        )}

        {activeSection === 'moments' && (
          <MomentsThatMattered 
            moments={evaluation.moments_that_mattered} 
            reflectionPrompt={evaluation.reflection_prompt}
          />
        )}

        {activeSection === 'drills' && (
          <PracticeDrills drills={evaluation.drills} />
        )}
      </div>

      <div className="feedback-actions">
        <button className="btn btn-secondary" onClick={onBackHome}>
          <Home size={18} />
          Back to Home
        </button>
        <button className="btn btn-primary" onClick={onRerunScenario}>
          <TrendingUp size={18} />
          Try Again with Harder Mode
        </button>
      </div>
    </div>
  );
});

export default Feedback;

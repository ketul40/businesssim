import { useState } from 'react';
import { TrendingUp, Award, AlertTriangle, Target, ArrowRight, Home } from 'lucide-react';
import { getScoreLabel } from '../constants/rubrics';

export default function Feedback({ evaluation, scenario, onBackHome, onRerunScenario }) {
  const [activeSection, setActiveSection] = useState('overview');
  
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
            <div className="overall-score-card">
              <div className="score-display">
                <div className="score-circle" style={{ borderColor: scoreLabel.color }}>
                  <span className="score-value">{evaluation.overall_score}</span>
                  <span className="score-max">/ 100</span>
                </div>
                <div className="score-label">
                  <h2 style={{ color: scoreLabel.color }}>{scoreLabel.label}</h2>
                  <p>Overall Performance</p>
                </div>
              </div>
            </div>

            <div className="criteria-scores">
              <h3>Breakdown by Criterion</h3>
              {evaluation.criterion_scores.map((criterion, idx) => {
                const percentage = (criterion.score / 5) * 100;
                return (
                  <div key={idx} className="criterion-score-card">
                    <div className="criterion-score-header">
                      <div>
                        <h4>{criterion.criterion}</h4>
                        <span className="weight-badge">{Math.round(criterion.weight * 100)}% weight</span>
                      </div>
                      <span className="score-badge">{criterion.score} / 5</span>
                    </div>
                    <div className="score-bar">
                      <div
                        className="score-fill"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444'
                        }}
                      ></div>
                    </div>
                    {criterion.evidence && criterion.evidence.length > 0 && (
                      <div className="evidence-list">
                        <strong>Evidence:</strong>
                        <ul>
                          {criterion.evidence.map((evidence, i) => (
                            <li key={i}>{evidence}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="missed-opportunities">
              <h3>
                <AlertTriangle size={20} />
                Areas for Improvement
              </h3>
              {evaluation.missed_opportunities.map((opportunity, idx) => (
                <div key={idx} className="opportunity-card">
                  <h4>{opportunity.criterion}</h4>
                  <p className="what-missed">{opportunity.what}</p>
                  <div className="how-to-improve">
                    <strong>How to improve:</strong>
                    <p>{opportunity.how_to_improve}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeSection === 'moments' && (
          <div className="moments-section">
            <h3>
              <Award size={20} />
              Moments That Mattered
            </h3>
            <p className="section-description">
              These were pivotal moments in your simulation that significantly impacted your performance.
            </p>
            {evaluation.moments_that_mattered.map((moment, idx) => (
              <div key={idx} className="moment-card">
                <div className="moment-header">
                  <span className="turn-badge">Turn {moment.turn}</span>
                  <h4>{moment.description}</h4>
                </div>
                <p className="moment-why">{moment.why}</p>
              </div>
            ))}

            <div className="reflection-section">
              <h3>
                <Target size={20} />
                Reflection Prompt
              </h3>
              <div className="reflection-card">
                <p className="reflection-question">{evaluation.reflection_prompt}</p>
                <textarea
                  placeholder="Take a moment to reflect..."
                  rows={6}
                  className="reflection-textarea"
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'drills' && (
          <div className="drills-section">
            <h3>
              <TrendingUp size={20} />
              Recommended Practice Drills
            </h3>
            <p className="section-description">
              These targeted exercises will help you strengthen specific skills for next time.
            </p>
            {evaluation.drills.map((drill, idx) => (
              <div key={idx} className="drill-card">
                <div className="drill-header">
                  <h4>{drill.title}</h4>
                  <span className="time-badge">{drill.estimated_minutes} min</span>
                </div>
                <p className="drill-instructions">{drill.instructions}</p>
                <button className="btn btn-secondary btn-small">
                  <ArrowRight size={16} />
                  Start Drill
                </button>
              </div>
            ))}
          </div>
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
}


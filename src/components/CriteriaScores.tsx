import { memo } from 'react';
import { CriterionScore } from '../types/models';

interface CriteriaScoresProps {
  criterionScores: CriterionScore[];
}

export const CriteriaScores = memo(function CriteriaScores({ 
  criterionScores 
}: CriteriaScoresProps) {
  return (
    <div className="criteria-scores">
      <h3>Breakdown by Criterion</h3>
      {criterionScores.map((criterion, idx) => {
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
  );
});

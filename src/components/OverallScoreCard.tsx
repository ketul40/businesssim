import { memo } from 'react';

interface ScoreLabel {
  min: number;
  max: number;
  label: string;
  color: string;
}

interface OverallScoreCardProps {
  score: number;
  scoreLabel: ScoreLabel;
}

export const OverallScoreCard = memo(function OverallScoreCard({ 
  score, 
  scoreLabel 
}: OverallScoreCardProps) {
  return (
    <div className="overall-score-card">
      <div className="score-display">
        <div className="score-circle" style={{ borderColor: scoreLabel.color }}>
          <span className="score-value">{score}</span>
          <span className="score-max">/ 100</span>
        </div>
        <div className="score-label">
          <h2 style={{ color: scoreLabel.color }}>{scoreLabel.label}</h2>
          <p>Overall Performance</p>
        </div>
      </div>
    </div>
  );
});

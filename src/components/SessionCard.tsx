import { memo } from 'react';
import { ArrowRight } from 'lucide-react';
import { SessionWithEvaluation } from '../types/props';

export interface SessionCardProps {
  session: SessionWithEvaluation;
  onViewDetails?: (sessionId: string) => void;
}

const SessionCard = memo(function SessionCard({ session, onViewDetails }: SessionCardProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#3b82f6';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const handleClick = () => {
    if (onViewDetails) {
      onViewDetails(session.id);
    }
  };

  return (
    <div className="session-card">
      <div className="session-info">
        <h4>{session.scenario?.title || 'Unknown Scenario'}</h4>
        <p className="session-date">
          {session.startedAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
        </p>
      </div>
      {session.evaluation ? (
        <div className="session-score">
          <span
            className="score-badge-large"
            style={{ backgroundColor: getScoreColor(session.evaluation.overall_score) }}
          >
            {session.evaluation.overall_score}
          </span>
        </div>
      ) : (
        <span className="incomplete-badge">Incomplete</span>
      )}
      <button className="btn btn-ghost btn-small" onClick={handleClick}>
        <ArrowRight size={16} />
      </button>
    </div>
  );
});

export default SessionCard;

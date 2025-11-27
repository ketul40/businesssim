import { memo } from 'react';
import { Target } from 'lucide-react';
import SessionCard from './SessionCard';
import { SessionWithEvaluation } from '../types/props';

export interface SessionListProps {
  sessions: SessionWithEvaluation[];
  onStartNewScenario: () => void;
  onViewSessionDetails?: (sessionId: string) => void;
}

const SessionList = memo(function SessionList({ 
  sessions, 
  onStartNewScenario,
  onViewSessionDetails 
}: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div className="empty-state">
        <Target size={48} />
        <h3>No sessions yet</h3>
        <p>Start your first simulation to begin tracking progress</p>
        <button className="btn btn-primary" onClick={onStartNewScenario}>
          Get Started
        </button>
      </div>
    );
  }

  return (
    <div className="session-list">
      {sessions.map((session, idx) => (
        <SessionCard 
          key={session.id || idx} 
          session={session}
          onViewDetails={onViewSessionDetails}
        />
      ))}
    </div>
  );
});

export default SessionList;

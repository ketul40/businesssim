import { useState, useEffect, memo, useCallback } from 'react';
import { Target } from 'lucide-react';
import { getUserSessions } from '../firebase/firestore';
import { ProgressDashboardProps, SessionWithEvaluation } from '../types/props';
import StatsGrid, { DashboardStats } from './StatsGrid';
import SessionList from './SessionList';

const ProgressDashboard = memo(function ProgressDashboard({ 
  userId, 
  onStartNewScenario 
}: ProgressDashboardProps) {
  const [sessions, setSessions] = useState<SessionWithEvaluation[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSessions: 0,
    averageScore: 0,
    totalTime: 0,
    topScenario: null
  });
  const [loading, setLoading] = useState(true);

  const loadUserProgress = useCallback(async () => {
    try {
      if (userId) {
        const userSessions = await getUserSessions(userId, 10);
        setSessions(userSessions);
        
        // Calculate stats
        const completedSessions = userSessions.filter((s: SessionWithEvaluation) => s.evaluation);
        const avgScore = completedSessions.length > 0
          ? completedSessions.reduce((sum: number, s: SessionWithEvaluation) => 
              sum + (s.evaluation?.overall_score || 0), 0) / completedSessions.length
          : 0;
        
        setStats({
          totalSessions: userSessions.length,
          averageScore: Math.round(avgScore),
          totalTime: userSessions.length * 15, // Estimate 15 min per session
          topScenario: completedSessions[0]?.scenario?.title || null
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading progress:', error);
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUserProgress();
  }, [loadUserProgress]);

  const handleViewSessionDetails = useCallback((sessionId: string) => {
    // Placeholder for future implementation
    console.log('View session details:', sessionId);
  }, []);

  if (loading) {
    return (
      <div className="progress-loading">
        <div className="spinner"></div>
        <p>Loading your progress...</p>
      </div>
    );
  }

  return (
    <div className="progress-dashboard">
      <div className="dashboard-header">
        <h1>Your Progress</h1>
        <button className="btn btn-primary" onClick={onStartNewScenario}>
          <Target size={18} />
          New Scenario
        </button>
      </div>

      <StatsGrid stats={stats} />

      <div className="skill-radar-section">
        <h2>Skill Development</h2>
        <div className="skill-radar-placeholder">
          <div className="radar-chart">
            {/* Placeholder for skill radar */}
            <svg width="300" height="300" viewBox="0 0 300 300">
              <circle cx="150" cy="150" r="120" fill="none" stroke="rgba(100, 108, 255, 0.1)" strokeWidth="1" />
              <circle cx="150" cy="150" r="90" fill="none" stroke="rgba(100, 108, 255, 0.1)" strokeWidth="1" />
              <circle cx="150" cy="150" r="60" fill="none" stroke="rgba(100, 108, 255, 0.1)" strokeWidth="1" />
              <circle cx="150" cy="150" r="30" fill="none" stroke="rgba(100, 108, 255, 0.1)" strokeWidth="1" />
              <line x1="150" y1="150" x2="150" y2="30" stroke="rgba(100, 108, 255, 0.2)" strokeWidth="1" />
              <line x1="150" y1="150" x2="250" y2="150" stroke="rgba(100, 108, 255, 0.2)" strokeWidth="1" />
              <line x1="150" y1="150" x2="150" y2="270" stroke="rgba(100, 108, 255, 0.2)" strokeWidth="1" />
              <line x1="150" y1="150" x2="50" y2="150" stroke="rgba(100, 108, 255, 0.2)" strokeWidth="1" />
              <polygon
                points="150,70 210,150 150,200 90,150"
                fill="rgba(100, 108, 255, 0.3)"
                stroke="#646cff"
                strokeWidth="2"
              />
            </svg>
            <div className="radar-labels">
              <span className="radar-label top">Framing</span>
              <span className="radar-label right">Evidence</span>
              <span className="radar-label bottom">Risk</span>
              <span className="radar-label left">Objections</span>
            </div>
          </div>
          <p className="radar-note">Track your performance across key criteria over time</p>
        </div>
      </div>

      <div className="session-history">
        <h2>Recent Sessions</h2>
        <SessionList 
          sessions={sessions}
          onStartNewScenario={onStartNewScenario}
          onViewSessionDetails={handleViewSessionDetails}
        />
      </div>
    </div>
  );
});

export default ProgressDashboard;

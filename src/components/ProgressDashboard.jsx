import { useState, useEffect } from 'react';
import { TrendingUp, Award, Clock, Target, ArrowRight } from 'lucide-react';
import { getUserSessions } from '../firebase/firestore';

export default function ProgressDashboard({ userId, onStartNewScenario }) {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    averageScore: 0,
    totalTime: 0,
    topScenario: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProgress();
  }, [userId]);

  const loadUserProgress = async () => {
    try {
      if (userId) {
        const userSessions = await getUserSessions(userId, 10);
        setSessions(userSessions);
        
        // Calculate stats
        const completedSessions = userSessions.filter(s => s.evaluation);
        const avgScore = completedSessions.length > 0
          ? completedSessions.reduce((sum, s) => sum + (s.evaluation?.overall_score || 0), 0) / completedSessions.length
          : 0;
        
        setStats({
          totalSessions: userSessions.length,
          averageScore: Math.round(avgScore),
          totalTime: userSessions.length * 15, // Estimate 15 min per session
          topScenario: completedSessions[0]?.scenario?.title || 'N/A'
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading progress:', error);
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#3b82f6';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

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

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
            <Target size={24} style={{ color: '#3b82f6' }} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalSessions}</h3>
            <p>Total Simulations</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <Award size={24} style={{ color: '#10b981' }} />
          </div>
          <div className="stat-content">
            <h3>{stats.averageScore}</h3>
            <p>Average Score</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
            <Clock size={24} style={{ color: '#f59e0b' }} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalTime} min</h3>
            <p>Practice Time</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
            <TrendingUp size={24} style={{ color: '#8b5cf6' }} />
          </div>
          <div className="stat-content">
            <h3 className="truncate">{stats.topScenario}</h3>
            <p>Most Recent</p>
          </div>
        </div>
      </div>

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
        {sessions.length === 0 ? (
          <div className="empty-state">
            <Target size={48} />
            <h3>No sessions yet</h3>
            <p>Start your first simulation to begin tracking progress</p>
            <button className="btn btn-primary" onClick={onStartNewScenario}>
              Get Started
            </button>
          </div>
        ) : (
          <div className="session-list">
            {sessions.map((session, idx) => (
              <div key={session.id || idx} className="session-card">
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
                <button className="btn btn-ghost btn-small">
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


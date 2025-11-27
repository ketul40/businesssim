import { memo } from 'react';
import { TrendingUp, Award, Clock, Target } from 'lucide-react';
import StatCard from './StatCard';

export interface DashboardStats {
  totalSessions: number;
  averageScore: number;
  totalTime: number;
  topScenario: string | null;
}

export interface StatsGridProps {
  stats: DashboardStats;
}

const StatsGrid = memo(function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="stats-grid">
      <StatCard
        icon={<Target size={24} />}
        iconColor="#3b82f6"
        iconBgColor="rgba(59, 130, 246, 0.1)"
        value={stats.totalSessions}
        label="Total Simulations"
      />
      <StatCard
        icon={<Award size={24} />}
        iconColor="#10b981"
        iconBgColor="rgba(16, 185, 129, 0.1)"
        value={stats.averageScore}
        label="Average Score"
      />
      <StatCard
        icon={<Clock size={24} />}
        iconColor="#f59e0b"
        iconBgColor="rgba(245, 158, 11, 0.1)"
        value={`${stats.totalTime} min`}
        label="Practice Time"
      />
      <StatCard
        icon={<TrendingUp size={24} />}
        iconColor="#8b5cf6"
        iconBgColor="rgba(139, 92, 246, 0.1)"
        value={<span className="truncate">{stats.topScenario || 'N/A'}</span>}
        label="Most Recent"
      />
    </div>
  );
});

export default StatsGrid;

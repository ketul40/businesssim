import { memo, ReactNode } from 'react';

export interface StatCardProps {
  icon: ReactNode;
  iconColor: string;
  iconBgColor: string;
  value: string | number;
  label: string;
}

const StatCard = memo(function StatCard({ 
  icon, 
  iconColor, 
  iconBgColor, 
  value, 
  label 
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: iconBgColor }}>
        <div style={{ color: iconColor }}>{icon}</div>
      </div>
      <div className="stat-content">
        <h3>{value}</h3>
        <p>{label}</p>
      </div>
    </div>
  );
});

export default StatCard;

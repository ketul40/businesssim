import { memo } from 'react';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { PracticeDrill } from '../types/models';

interface PracticeDrillsProps {
  drills: PracticeDrill[];
}

export const PracticeDrills = memo(function PracticeDrills({ 
  drills 
}: PracticeDrillsProps) {
  return (
    <div className="drills-section">
      <h3>
        <TrendingUp size={20} />
        Recommended Practice Drills
      </h3>
      <p className="section-description">
        These targeted exercises will help you strengthen specific skills for next time.
      </p>
      {drills.map((drill, idx) => (
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
  );
});

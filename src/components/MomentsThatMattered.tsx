import { memo } from 'react';
import { Award, Target } from 'lucide-react';
import { MomentThatMattered } from '../types/models';

interface MomentsThatMatteredProps {
  moments: MomentThatMattered[];
  reflectionPrompt: string;
}

export const MomentsThatMattered = memo(function MomentsThatMattered({ 
  moments, 
  reflectionPrompt 
}: MomentsThatMatteredProps) {
  return (
    <div className="moments-section">
      <h3>
        <Award size={20} />
        Moments That Mattered
      </h3>
      <p className="section-description">
        These were pivotal moments in your simulation that significantly impacted your performance.
      </p>
      {moments.map((moment, idx) => (
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
          <p className="reflection-question">{reflectionPrompt}</p>
          <textarea
            placeholder="Take a moment to reflect..."
            rows={6}
            className="reflection-textarea"
          />
        </div>
      </div>
    </div>
  );
});

import { memo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { MissedOpportunity } from '../types/models';

interface MissedOpportunitiesProps {
  opportunities: MissedOpportunity[];
}

export const MissedOpportunities = memo(function MissedOpportunities({ 
  opportunities 
}: MissedOpportunitiesProps) {
  return (
    <div className="missed-opportunities">
      <h3>
        <AlertTriangle size={20} />
        Areas for Improvement
      </h3>
      {opportunities.map((opportunity, idx) => (
        <div key={idx} className="opportunity-card">
          <h4>{opportunity.criterion}</h4>
          <p className="what-missed">{opportunity.what}</p>
          <div className="how-to-improve">
            <strong>How to improve:</strong>
            <p>{opportunity.how_to_improve}</p>
          </div>
        </div>
      ))}
    </div>
  );
});

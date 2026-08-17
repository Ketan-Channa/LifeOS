import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { TaskRiskPrediction } from '../../../../shared/types/lifeos.types';

interface TaskRiskBadgeProps {
  prediction?: TaskRiskPrediction | null;
}

export const TaskRiskBadge: React.FC<TaskRiskBadgeProps> = ({ prediction }) => {
  if (!prediction || !prediction.available) return null;

  const category = prediction.riskCategory || prediction.riskLevel || 'LOW';
  const prob = prediction.riskProbability !== undefined ? prediction.riskProbability : ((prediction.riskScore || 0) / 100);
  const percent = Math.round(prob * 100);

  if (category === 'HIGH') {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-1">
        <AlertTriangle size={11} /> HIGH RISK {percent}%
      </span>
    );
  }

  if (category === 'MEDIUM') {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1">
        <AlertTriangle size={11} /> MED RISK {percent}%
      </span>
    );
  }

  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
      <CheckCircle2 size={11} /> LOW RISK
    </span>
  );
};

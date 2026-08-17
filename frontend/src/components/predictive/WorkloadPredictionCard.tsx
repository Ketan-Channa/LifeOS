import React from 'react';
import { Clock, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import { WorkloadPrediction } from '../../../../shared/types/lifeos.types';

interface WorkloadPredictionCardProps {
  prediction?: WorkloadPrediction | null;
}

export const WorkloadPredictionCard: React.FC<WorkloadPredictionCardProps> = ({ prediction }) => {
  if (!prediction || !prediction.available) return null;

  const { workloadRisk, riskProbability, scheduledHours, capacityHours, historicalCapacity, suggestedAction } = prediction;
  const prob = riskProbability !== undefined ? riskProbability : ((prediction.capacityUsagePercentage || 50) / 100);
  const percent = Math.round(prob * 100);
  const isHigh = workloadRisk === 'HIGH';

  return (
    <div className={`p-5 rounded-3xl border space-y-3 font-mono text-xs ${
      isHigh ? 'bg-amber-950/20 border-amber-500/30' : 'bg-slate-900/80 border-slate-800'
    }`}>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-slate-100">
          <Clock size={16} className="text-amber-400" />
          <span>PREDICTIVE WORKLOAD (TOMORROW)</span>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
          isHigh ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300'
        }`}>
          {workloadRisk} WORKLOAD ({percent}%)
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase">SCHEDULED DURATION</span>
          <span className="text-base font-bold text-amber-400 font-sans">
            {scheduledHours} hours
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block uppercase">HISTORICAL CAPACITY</span>
          <span className="text-base font-bold text-indigo-400 font-sans">
            {historicalCapacity || capacityHours || 6.0} hours
          </span>
        </div>
      </div>

      {/* Suggested Action */}
      {suggestedAction && (
        <p className="text-[11px] text-slate-300 font-sans leading-relaxed pt-1 border-t border-slate-800/80">
          💡 <strong>Suggested Intervention:</strong> {suggestedAction}
        </p>
      )}

    </div>
  );
};

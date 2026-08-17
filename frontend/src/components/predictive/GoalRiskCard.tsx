import React from 'react';
import { Target, TrendingUp, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import { GoalRiskPrediction } from '../../../../shared/types/lifeos.types';

interface GoalRiskCardProps {
  prediction?: GoalRiskPrediction | null;
}

export const GoalRiskCard: React.FC<GoalRiskCardProps> = ({ prediction }) => {
  if (!prediction || !prediction.available) return null;

  const { completionProbability, riskLevel, requiredDailyProgress, historicalVelocity, recommendation } = prediction;
  const percent = Math.round(completionProbability * 100);

  const isHighRisk = riskLevel === 'HIGH';

  return (
    <div className={`p-4 rounded-2xl border space-y-3 font-mono text-xs ${
      isHighRisk ? 'bg-rose-950/20 border-rose-500/30' : 'bg-cyan-950/20 border-cyan-500/30'
    }`}>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-cyan-400" />
          <span className="font-bold text-slate-100">ML GOAL COMPLETION RISK</span>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
          isHighRisk ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        }`}>
          {percent}% PREDICTED SUCCESS ({riskLevel} RISK)
        </span>
      </div>

      {/* Required Velocity Comparison */}
      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase">REQUIRED DAILY PROGRESS</span>
          <span className="text-sm font-bold text-amber-400 font-sans">
            {requiredDailyProgress}% / day
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block uppercase">HISTORICAL VELOCITY</span>
          <span className="text-sm font-bold text-indigo-400 font-sans">
            +{historicalVelocity}% / day
          </span>
        </div>
      </div>

      {/* Recommendation */}
      {recommendation && (
        <p className="text-[11px] text-slate-300 font-sans leading-relaxed pt-1 border-t border-slate-800/80">
          💡 <strong>ML Insight:</strong> {recommendation}
        </p>
      )}

    </div>
  );
};

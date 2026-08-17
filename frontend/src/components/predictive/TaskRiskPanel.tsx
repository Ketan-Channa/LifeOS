import React from 'react';
import { Cpu, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { TaskRiskPrediction } from '../../../../shared/types/lifeos.types';

interface TaskRiskPanelProps {
  prediction?: TaskRiskPrediction | null;
}

export const TaskRiskPanel: React.FC<TaskRiskPanelProps> = ({ prediction }) => {
  if (!prediction || !prediction.available) {
    return (
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs font-mono space-y-1">
        <span className="text-slate-400 font-bold flex items-center gap-1">
          <Cpu size={14} /> ML PREDICTIVE INTELLIGENCE
        </span>
        <p className="text-[11px] text-slate-500 font-sans">
          {prediction?.reason || 'Prediction unavailable. Keep using LifeOS to collect activity history.'}
        </p>
      </div>
    );
  }

  const { riskCategory, riskScore, topFactors, modelVersion } = prediction;
  const riskPercent = riskScore || Math.round((prediction.riskProbability || 0) * 100);
  const postponePercent = Math.round((prediction.postponementProbability || 0) * 100);
  const category = riskCategory || prediction.riskLevel || 'LOW';

  const isHigh = category === 'HIGH';

  return (
    <div className={`p-4 rounded-2xl border space-y-3 text-xs font-mono ${
      isHigh ? 'bg-rose-950/20 border-rose-500/30' : 'bg-slate-900/80 border-slate-800'
    }`}>
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-200">
          <Cpu size={15} className="text-indigo-400" />
          <span>PREDICTIVE ML INTELLIGENCE</span>
        </div>
        <span className="text-[10px] text-slate-500">{modelVersion || 'v1.0'}</span>
      </div>

      {/* Probability Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase">DEADLINE RISK</span>
          <span className={`text-base font-bold font-sans ${isHigh ? 'text-rose-400' : 'text-emerald-400'}`}>
            {category} ({riskPercent}%)
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block uppercase">POSTPONEMENT PROBABILITY</span>
          <span className="text-base font-bold text-amber-400 font-sans">
            {postponePercent}%
          </span>
        </div>
      </div>

      {/* Top Factors */}
      {topFactors && topFactors.length > 0 && (
        <div className="space-y-1 pt-1 border-t border-slate-800/80 font-sans text-xs">
          <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase">
            Top Contributing ML Factors:
          </span>
          <ul className="space-y-1">
            {topFactors.map((factor, idx) => (
              <li key={idx} className="text-slate-300 flex items-start gap-1.5">
                <span className="text-rose-400 font-bold">•</span>
                <span>{typeof factor === 'string' ? factor : `${factor.factor} (${factor.impact})`}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
};

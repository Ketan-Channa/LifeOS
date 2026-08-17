import React from 'react';
import { BrainCircuit, Sparkles, TrendingUp, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BehavioralPattern } from '../../../../shared/types/lifeos.types';

interface BehavioralPatternCardProps {
  pattern: BehavioralPattern;
}

export const BehavioralPatternCard: React.FC<BehavioralPatternCardProps> = ({ pattern }) => {
  const pType = pattern.type || pattern.id || 'PATTERN';
  const pTitle = pattern.title || pattern.name || 'Behavioral Pattern';
  const pConfLabel = pattern.confidenceLabel || (pattern.confidenceScore && pattern.confidenceScore >= 0.8 ? 'STRONG' : 'MODERATE');
  const pConfScore = pattern.confidence !== undefined ? pattern.confidence : (pattern.confidenceScore || 0.85);

  const getIcon = (typeStr: string) => {
    switch (typeStr) {
      case 'PRODUCTIVE_TIME':
      case 'PRODUCTIVE_DAY':
        return <Clock className="text-cyan-400" size={20} />;
      case 'ESTIMATION_ERROR':
        return <TrendingUp className="text-amber-400" size={20} />;
      case 'POSTPONEMENT_PATTERN':
      case 'WORKLOAD_PATTERN':
        return <AlertTriangle className="text-rose-400" size={20} />;
      default:
        return <BrainCircuit className="text-indigo-400" size={20} />;
    }
  };

  const getConfidenceBadge = (label: string, score: number) => {
    const pct = Math.round(score * 100);
    switch (label) {
      case 'STRONG':
        return { text: `STRONG (${pct}%)`, style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'MODERATE':
        return { text: `MODERATE (${pct}%)`, style: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
      default:
        return { text: `INITIAL (${pct}%)`, style: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' };
    }
  };

  const confInfo = getConfidenceBadge(pConfLabel, pConfScore);

  return (
    <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-3 hover:border-indigo-500/40 transition-all font-sans select-none">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
            {getIcon(pType)}
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">{pType}</span>
            <h4 className="text-sm font-bold text-slate-100">{pTitle}</h4>
          </div>
        </div>

        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border shrink-0 ${confInfo.style}`}>
          {confInfo.text}
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">{pattern.description}</p>

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
        <span>{pattern.dataPoints || 30} records analyzed</span>
        <span className="text-cyan-400 font-semibold">{(pattern.period || 'last_30_days').replace(/_/g, ' ')}</span>
      </div>
    </div>
  );
};

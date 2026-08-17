import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Cpu, Sparkles, Activity, ArrowRight } from 'lucide-react';
import { BehavioralPattern } from '../../../../shared/types/lifeos.types';

interface IntelligencePanelProps {
  patterns?: BehavioralPattern[];
}

export const IntelligencePanel: React.FC<IntelligencePanelProps> = ({ patterns = [] }) => {
  const hasPatterns = patterns.length > 0;

  return (
    <div className="glass-card p-6 rounded-3xl space-y-4 border border-purple-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <BrainCircuit size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              LifeOS Intelligence
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Deterministic behavioral telemetry and pattern recognition</p>
          </div>
        </div>

        <Link
          to="/analytics"
          className="px-3 py-1.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
        >
          View Full Analytics <ArrowRight size={13} />
        </Link>
      </div>

      {!hasPatterns ? (
        <div className="p-6 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-purple-300 font-bold">
            <Cpu size={16} className="text-purple-400 animate-pulse" />
            <span>🧠 LIFEOS PATTERN RECOGNITION ENGINE</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-normal">
            LifeOS is analyzing your daily activity. Complete tasks, log timers, and update milestones to generate behavioral pattern insights.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {patterns.slice(0, 3).map((pat, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-300">{pat.title}</span>
                <span className="text-[10px] font-mono text-cyan-400 font-semibold">{pat.confidenceLabel}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{pat.description}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                <span>Metric: {pat.metric}</span>
                <span>{pat.dataPoints} records analyzed</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

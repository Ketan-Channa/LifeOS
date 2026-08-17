import React from 'react';
import { BarChart3, Info } from 'lucide-react';

interface AnalyticsEmptyStateProps {
  title?: string;
  message?: string;
  minRequirement?: string;
}

export const AnalyticsEmptyState: React.FC<AnalyticsEmptyStateProps> = ({
  title = "Not enough historical data yet.",
  message = "Continue using LifeOS to unlock data-driven behavioral intelligence.",
  minRequirement
}) => {
  return (
    <div className="p-10 text-center rounded-3xl glass-card border border-slate-800 space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
        <BarChart3 size={24} />
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-200">{title}</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">{message}</p>
      </div>

      {minRequirement && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300">
          <Info size={13} /> {minRequirement}
        </div>
      )}
    </div>
  );
};

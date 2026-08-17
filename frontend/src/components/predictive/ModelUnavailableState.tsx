import React from 'react';
import { Cpu, AlertCircle } from 'lucide-react';

interface ModelUnavailableStateProps {
  title?: string;
  message?: string;
}

export const ModelUnavailableState: React.FC<ModelUnavailableStateProps> = ({
  title = "Predictive ML Model Unavailable",
  message = "Keep using LifeOS to build enough task, goal, and schedule history for machine learning risk models."
}) => {
  return (
    <div className="p-6 rounded-3xl glass-card border border-slate-800 text-center space-y-3 font-mono text-xs">
      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
        <Cpu size={24} />
      </div>

      <h4 className="font-bold text-slate-200 text-sm font-sans">{title}</h4>
      <p className="text-slate-400 max-w-md mx-auto font-sans leading-relaxed text-xs">
        {message}
      </p>

      <span className="inline-block px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-500 font-bold">
        Minimum requirement: 50+ completed tasks & 20+ goal progress records
      </span>
    </div>
  );
};

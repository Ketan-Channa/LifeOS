import React from 'react';
import { CheckCircle2, Clock, PlayCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import { AgentStepItem } from '../../../../shared/types/lifeos.types';

interface AgentStepTimelineProps {
  steps: AgentStepItem[];
  currentStepNum?: number;
}

export const AgentStepTimeline: React.FC<AgentStepTimelineProps> = ({ steps, currentStepNum }) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="space-y-3 font-sans select-none">
      <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
        EXECUTION TIMELINE ({steps.length} STEPS)
      </h4>

      <div className="space-y-2 relative pl-3 border-l-2 border-slate-800">
        {steps.map((step) => {
          const isDone = step.status === 'COMPLETED';
          const isCurrent = step.stepNumber === currentStepNum || step.status === 'RUNNING';
          const isApproval = step.stepType === 'USER_APPROVAL' || step.requiresApproval;

          return (
            <div
              key={step.stepNumber}
              className={`p-3.5 rounded-2xl border text-xs transition-all relative ${
                isCurrent
                  ? 'bg-purple-950/40 border-purple-500/40 text-purple-200 shadow-md'
                  : isDone
                  ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                  : 'bg-slate-950/40 border-slate-900 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-white">
                    {step.stepNumber}
                  </span>

                  <span className="font-bold text-slate-200 uppercase">{step.stepType}</span>

                  {step.toolName && (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 text-[10px]">
                      {step.toolName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 font-bold">
                  {isDone ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={13} /> COMPLETED
                    </span>
                  ) : isCurrent ? (
                    <span className="text-purple-400 flex items-center gap-1 animate-pulse">
                      <PlayCircle size={13} /> IN PROGRESS
                    </span>
                  ) : (
                    <span className="text-slate-600 flex items-center gap-1">
                      <Clock size={13} /> PENDING
                    </span>
                  )}
                </div>
              </div>

              <p className="font-sans text-xs text-slate-200 pl-7">{step.description}</p>

              {isApproval && !isDone && (
                <div className="mt-2 pl-7 flex items-center gap-1.5 text-amber-300 font-mono text-[11px]">
                  <ShieldAlert size={14} className="text-amber-400" />
                  <span>Awaiting user confirmation card...</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import { Sparkles, CheckCircle2, ShieldAlert, Award, Clock, ArrowRight, Layers, HelpCircle, FileText, Check } from 'lucide-react';
import { CandidatePlanData } from '../../../../shared/types/lifeos.types';

interface AIPlanComparisonProps {
  plans: CandidatePlanData[];
  selectedPlanId: string;
  onSelectPlan: (planId: string) => void;
}

export const AIPlanComparison: React.FC<AIPlanComparisonProps> = ({
  plans,
  selectedPlanId,
  onSelectPlan
}) => {
  if (!plans || plans.length === 0) return null;

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (score >= 80) return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    if (score >= 70) return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  };

  return (
    <div className="space-y-5 select-none font-sans">
      
      {/* Side-by-Side Candidate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 items-stretch">
        {plans.map((plan) => {
          const isSelected = plan.planId === selectedPlanId;
          return (
            <div
              key={plan.planId}
              onClick={() => onSelectPlan(plan.planId)}
              className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 relative ${
                isSelected
                  ? 'bg-gradient-to-b from-purple-950/50 to-slate-900 border-purple-500 shadow-lg shadow-purple-950/50 ring-2 ring-purple-500/40'
                  : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700 opacity-80 hover:opacity-100'
              }`}
            >
              
              {/* Card Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-purple-600 border-purple-400 text-white' : 'border-slate-700'
                  }`}>
                    {isSelected && <Check size={12} />}
                  </div>

                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-extrabold ${getScoreBadgeColor(plan.overallScore)}`}>
                    SCORE {plan.overallScore}/100
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-white leading-snug">
                    {plan.planName}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{plan.strategyKey.replace(/_/g, ' ')}</p>
                </div>
              </div>

              {/* Score Component Breakdown Bars */}
              <div className="space-y-1.5 font-mono text-[10px] bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                <div className="flex justify-between text-slate-300">
                  <span>Deadline Fit</span>
                  <span className="text-emerald-400 font-bold">{plan.scoreBreakdown.deadlineHandling}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${plan.scoreBreakdown.deadlineHandling}%` }} />
                </div>

                <div className="flex justify-between text-slate-300 pt-0.5">
                  <span>Priority Fit</span>
                  <span className="text-purple-300 font-bold">{plan.scoreBreakdown.priorityHandling}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${plan.scoreBreakdown.priorityHandling}%` }} />
                </div>

                <div className="flex justify-between text-slate-300 pt-0.5">
                  <span>Schedule Fit</span>
                  <span className="text-cyan-300 font-bold">{plan.scoreBreakdown.scheduleFit}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${plan.scoreBreakdown.scheduleFit}%` }} />
                </div>
              </div>

              {/* Workload Telemetry */}
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1 text-[11px] font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>Workload:</span>
                  <strong className="text-white font-bold">{plan.totalScheduledHours}h</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Free Time:</span>
                  <strong className="text-emerald-400 font-bold">{plan.freeHoursRemaining}h</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Breaks:</span>
                  <strong className="text-purple-300 font-bold">{plan.breakCount} blocks</strong>
                </div>
              </div>

              {/* Strengths & Trade-Off */}
              <div className="space-y-1.5 text-[10px] leading-tight">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  <strong className="font-bold">Strength:</strong> {plan.strength}
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  <strong className="font-bold">Trade-off:</strong> {plan.tradeOff}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Selected Plan Details & Timeline Preview */}
      {(() => {
        const activePlan = plans.find(p => p.planId === selectedPlanId) || plans[0];
        return (
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-4">
            
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div>
                <span className="text-[10px] text-purple-300 font-bold uppercase font-mono tracking-wider">
                  SELECTED TIMELINE PREVIEW — {activePlan.planName}
                </span>
                <p className="text-xs text-slate-300 mt-0.5 font-sans leading-relaxed">{activePlan.aiExplanation}</p>
              </div>

              <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-500/30">
                {activePlan.scheduledItemsCount} Activities Scheduled
              </span>
            </div>

            {/* Why This Plan? */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono block">WHY THIS PLAN?</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {activePlan.whyThisPlanReasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-300 text-xs">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Unscheduled Items Warning if any */}
            {activePlan.unscheduledItemsCount > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-1">
                <span className="font-bold uppercase font-mono flex items-center gap-1.5">
                  <ShieldAlert size={14} /> UNSCHEDULED ITEMS ({activePlan.unscheduledItemsCount})
                </span>
                {activePlan.unscheduledItems.map((unsched, idx) => (
                  <div key={idx} className="text-[11px] text-amber-200">
                    • <strong>{unsched.item.title}</strong> ({unsched.item.durationMinutes}m): {unsched.reason}
                  </div>
                ))}
              </div>
            )}

            {/* Timeline Blocks List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
              {activePlan.scheduleBlocks.map((block, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-sans ${
                    block.isBreak
                      ? 'bg-purple-950/20 border-purple-500/20 text-purple-300'
                      : block.isFixed
                      ? 'bg-amber-950/20 border-amber-500/20 text-amber-200'
                      : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-cyan-400 font-bold shrink-0 text-xs">
                      {block.startTime} - {block.endTime}
                    </span>
                    <span className="font-bold truncate text-xs">{block.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({block.durationMinutes}m)</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold">
                      {block.category}
                    </span>
                    {!block.isBreak && (
                      <span className={`px-2 py-0.5 rounded-full border font-bold ${
                        block.priority === 'URGENT' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                        block.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {block.priority}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        );
      })()}

    </div>
  );
};

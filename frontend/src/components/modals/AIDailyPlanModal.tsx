import React, { useState, useEffect } from 'react';
import { Sparkles, X, Clock, CheckCircle2, AlertTriangle, Layers, Calendar, Check, Zap, Target } from 'lucide-react';
import { getAIDailyPlan } from '../../services/ai.api';
import { createScheduleEvent } from '../../services/schedule.api';
import { AIDailyPlan, EventType, AIPlanItem } from '../../../../shared/types/lifeos.types';

interface AIDailyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  date: string;
}

export const AIDailyPlanModal: React.FC<AIDailyPlanModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  date
}) => {
  const [plan, setPlan] = useState<AIDailyPlan | null>(null);
  const [selectedItemIndices, setSelectedItemIndices] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState('');

  const fetchPlan = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getAIDailyPlan(date);
      setPlan(data);
      if (data && data.scheduleItems) {
        setSelectedItemIndices(data.scheduleItems.map((_, idx) => idx));
      }
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI daily plan.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPlan();
    }
  }, [isOpen, date]);

  if (!isOpen) return null;

  const toggleSelectItem = (idx: number) => {
    if (selectedItemIndices.includes(idx)) {
      setSelectedItemIndices(selectedItemIndices.filter(i => i !== idx));
    } else {
      setSelectedItemIndices([...selectedItemIndices, idx]);
    }
  };

  const mapCategoryToEventType = (cat: string): EventType => {
    const upper = (cat || '').toUpperCase();
    if (upper.includes('WORK') || upper.includes('JOB') || upper.includes('CAREER')) return 'WORK';
    if (upper.includes('CLASS') || upper.includes('ACADEMIC') || upper.includes('COLLEGE') || upper.includes('STUDY')) return 'CLASS';
    if (upper.includes('HEALTH') || upper.includes('FITNESS') || upper.includes('EXERCISE')) return 'EXERCISE';
    if (upper.includes('MEETING')) return 'MEETING';
    if (upper.includes('PERSONAL')) return 'PERSONAL';
    return 'TASK';
  };

  const handleApplyPlan = async () => {
    if (!plan || !plan.scheduleItems) return;
    const itemsToApply = plan.scheduleItems.filter((_, idx) => selectedItemIndices.includes(idx));

    if (itemsToApply.length === 0) {
      setError('Please select at least one schedule item to apply.');
      return;
    }

    try {
      setIsApplying(true);
      setError('');
      for (const item of itemsToApply) {
        const startIso = `${date}T${item.startTime}:00`;
        const endIso = `${date}T${item.endTime}:00`;

        const eventType = mapCategoryToEventType(item.category);

        await createScheduleEvent({
          title: item.title,
          type: eventType,
          priority: item.priority as any,
          startTime: startIso,
          endTime: endIso,
          linkedTaskId: item.relatedTaskId,
          linkedGoalId: item.relatedGoalId
        });
      }

      setIsApplying(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to apply AI plan to database schedule.');
      setIsApplying(false);
    }
  };

  const getPriorityBadge = (prio: string) => {
    switch (prio) {
      case 'URGENT': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'HIGH': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'MEDIUM': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto select-none">
      <div className="w-full max-w-xl glass-card rounded-3xl border border-purple-500/30 p-6 space-y-5 bg-slate-950/95 text-slate-100 shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                ✨ AI SUGGESTED DAILY PLAN
              </h3>
              <p className="text-xs text-slate-400 font-mono">Conflict-free AI scheduled windows for {date}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle size={15} /> {error}
          </div>
        )}

        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-xs font-mono text-slate-400">Evaluating existing schedule conflicts & task priorities...</p>
          </div>
        ) : !plan || !plan.scheduleItems || plan.scheduleItems.length === 0 ? (
          <div className="p-8 text-center space-y-2 text-slate-400 font-mono text-xs">
            <p>No pending tasks available to generate a daily plan.</p>
            <p className="text-slate-500">Create pending tasks or deadlines to unlock AI scheduling.</p>
          </div>
        ) : (
          <div className="space-y-4 font-mono text-xs">
            
            {/* Reasoning & Workload Summary */}
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-purple-300 font-bold uppercase">AI REASONING TELEMETRY</span>
                <span className="text-[10px] text-indigo-400 font-mono font-bold">GEMINI 1.5 INTELLIGENCE</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans text-xs">{plan.reasoning}</p>
              
              <div className="flex items-center justify-between pt-2 border-t border-purple-500/20 text-[11px]">
                <span className="text-slate-400">Planned Workload: <strong className="text-white font-bold">{plan.totalScheduledHours} hrs</strong></span>
                <span className="text-slate-400">Free Time Window: <strong className="text-emerald-400 font-bold">{plan.freeHoursRemaining} hrs</strong></span>
              </div>
            </div>

            {/* Proposed Schedule Timeline */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                <span>PROPOSED SCHEDULE BLOCKS ({selectedItemIndices.length}/{plan.scheduleItems.length} SELECTED)</span>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedItemIndices.length === plan.scheduleItems.length) {
                      setSelectedItemIndices([]);
                    } else {
                      setSelectedItemIndices(plan.scheduleItems.map((_, idx) => idx));
                    }
                  }}
                  className="text-purple-400 hover:underline"
                >
                  {selectedItemIndices.length === plan.scheduleItems.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {plan.scheduleItems.map((item, idx) => {
                const isSelected = selectedItemIndices.includes(idx);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleSelectItem(idx)}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer space-y-1.5 font-sans ${
                      isSelected
                        ? 'bg-slate-900/90 border-purple-500/40 shadow-lg'
                        : 'bg-slate-950/40 border-slate-800 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          isSelected ? 'bg-purple-600 border-purple-500 text-white' : 'border-slate-700'
                        }`}>
                          {isSelected && <Check size={13} />}
                        </div>
                        <span className="font-bold text-sm text-slate-100 truncate">{item.title}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getPriorityBadge(item.priority)}`}>
                          {item.priority}
                        </span>
                        <span className="text-cyan-400 font-bold">
                          {item.startTime} - {item.endTime} ({item.durationMinutes}m)
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 pl-7 leading-relaxed">{item.reason}</p>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                Discard
              </button>

              <button
                type="button"
                onClick={handleApplyPlan}
                disabled={isApplying || selectedItemIndices.length === 0}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-white transition-all shadow-lg shadow-purple-600/30 flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 size={16} /> {isApplying ? 'Applying Selected Plan...' : `Apply ${selectedItemIndices.length} Item(s)`}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

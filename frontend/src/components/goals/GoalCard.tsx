import React from 'react';
import { Target, Calendar, CheckCircle2, ListTodo, AlertTriangle, Flame, Clock } from 'lucide-react';
import { GoalItem } from '../../../../shared/types/lifeos.types';

interface GoalCardProps {
  goal: GoalItem;
  onClick: (goal: GoalItem) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onClick }) => {
  const milestonesTotal = goal.milestones ? goal.milestones.length : 0;
  const milestonesCompleted = goal.milestones ? goal.milestones.filter(m => m.completed).length : 0;
  const tasksCount = goal.tasks ? goal.tasks.length : 0;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'PAUSED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'ARCHIVED':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    }
  };

  const getRiskBadge = (risk?: string) => {
    switch (risk) {
      case 'HIGH':
        return { text: 'HIGH RISK', style: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'MEDIUM':
        return { text: 'MODERATE RISK', style: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      default:
        return { text: 'ON TRACK', style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    }
  };

  const riskInfo = getRiskBadge(goal.riskEstimate);

  return (
    <div
      onClick={() => onClick(goal)}
      className={`glass-card p-5 rounded-3xl border transition-all duration-200 cursor-pointer space-y-4 ${
        goal.isOverdue
          ? 'border-rose-500/40 hover:border-rose-500/70 bg-rose-950/10'
          : 'border-slate-800 hover:border-indigo-500/40'
      }`}
    >
      {/* Top Bar */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-300">
              {goal.category}
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getPriorityBadge(goal.priority)}`}>
              {goal.priority}
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getStatusBadge(goal.status)}`}>
              {goal.status}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">
            {goal.title}
          </h3>
        </div>

        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border shrink-0 ${riskInfo.style}`}>
          {riskInfo.text}
        </span>
      </div>

      {goal.description && (
        <p className="text-slate-400 text-xs line-clamp-2">{goal.description}</p>
      )}

      {/* Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-slate-400 text-[11px] font-semibold">PROGRESS</span>
          <span className="font-bold text-white text-sm">{goal.progress}%</span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              goal.progress >= 100
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : goal.isOverdue
                ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                : 'bg-gradient-to-r from-indigo-500 to-purple-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, goal.progress))}%` }}
          />
        </div>
      </div>

      {/* Footer Info Grid */}
      <div className="grid grid-cols-3 gap-2 text-[11px] font-mono pt-2 border-t border-slate-800/80 text-slate-400">
        <div className="flex items-center gap-1.5">
          <Calendar size={13} className={goal.isOverdue ? 'text-rose-400' : 'text-indigo-400'} />
          <span className={goal.isOverdue ? 'text-rose-300 font-bold' : ''}>
            {goal.targetDate
              ? goal.isOverdue
                ? `${Math.abs(goal.daysRemaining || 0)}d overdue`
                : `${goal.daysRemaining}d left`
              : 'No Target'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-emerald-400" />
          <span>
            {milestonesCompleted}/{milestonesTotal} M.Stones
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <ListTodo size={13} className="text-purple-400" />
          <span>{tasksCount} Tasks</span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, CheckCircle2, Clock, Target, MoreVertical, Play, Pause, Archive } from 'lucide-react';
import { HabitItem } from '../../../../shared/types/lifeos.types';

interface HabitCardProps {
  habit: HabitItem;
  onLog: (habitId: string, status: string) => void;
  onPause?: (habitId: string) => void;
  onResume?: (habitId: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onLog,
  onPause,
  onResume
}) => {
  const isCompleted = habit.completedToday || habit.todayLog?.status === 'COMPLETED';
  const isPartial = habit.todayLog?.status === 'PARTIAL';
  const isMissed = habit.todayLog?.status === 'MISSED';

  const categoryColor = (cat: string) => {
    switch (cat) {
      case 'Health':
      case 'Fitness':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Learning':
      case 'Study':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'Career':
      case 'Work':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className={`glass-card rounded-3xl border p-5 space-y-4 transition-all duration-300 hover:scale-[1.01] ${
      isCompleted
        ? 'border-emerald-500/40 bg-emerald-950/10'
        : habit.isActive
        ? 'border-slate-800 hover:border-slate-700'
        : 'border-slate-800/60 opacity-60'
    }`}>
      
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${categoryColor(habit.category)}`}>
              {habit.category}
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">
              {habit.frequency}
            </span>
          </div>

          <Link to={`/habits/${habit.id}`} className="font-bold text-slate-100 hover:text-amber-400 transition-colors text-base block font-sans">
            {habit.name}
          </Link>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onLog(habit.id, isCompleted ? 'MISSED' : 'COMPLETED')}
          className={`p-2.5 rounded-2xl border font-mono text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
            isCompleted
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
          }`}
        >
          <CheckCircle2 size={16} />
          <span>{isCompleted ? 'Done' : 'Complete'}</span>
        </button>
      </div>

      {/* Target & Preferred Time */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1 border-t border-slate-800/80">
        <span>Target: <strong className="text-slate-200">{habit.targetValue} {habit.targetUnit}</strong></span>
        {habit.preferredTime && (
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-amber-400" /> {habit.preferredTime}
          </span>
        )}
      </div>

      {/* Streaks & Consistency Row */}
      <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 font-mono text-xs">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Current Streak</span>
          <span className="text-amber-400 font-extrabold flex items-center gap-1 text-sm font-sans">
            <Flame size={15} /> {habit.currentStreak} days
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Best Streak</span>
          <span className="text-slate-300 font-bold text-sm font-sans">
            {habit.longestStreak} days
          </span>
        </div>
      </div>

      {/* Goal Association Footer */}
      {habit.goal && (
        <div className="text-[11px] font-mono text-cyan-300 flex items-center gap-1.5 pt-1">
          <Target size={12} />
          <span className="truncate">Linked Goal: <strong>{habit.goal.title}</strong></span>
        </div>
      )}

    </div>
  );
};

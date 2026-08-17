import React from 'react';
import { RotateCcw, CheckCircle2, Circle, Flame } from 'lucide-react';
import { HabitItem } from '../../../../shared/types/lifeos.types';

interface HabitOverviewProps {
  habits: HabitItem[];
  onLogHabit: (id: string) => void;
}

export const HabitOverview: React.FC<HabitOverviewProps> = ({ habits, onLogHabit }) => {
  return (
    <div className="glass-card p-6 rounded-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <RotateCcw className="text-cyan-400" size={18} /> TODAY'S HABITS
        </h3>
        <span className="text-[11px] font-mono text-cyan-400 font-semibold">{habits.length} Habits</span>
      </div>

      {habits.length === 0 ? (
        <div className="p-6 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400">
          No habits tracked yet.
        </div>
      ) : (
        <div className="space-y-2.5">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onLogHabit(habit.id)}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {habit.completedToday ? (
                    <CheckCircle2 size={22} className="text-cyan-400" />
                  ) : (
                    <Circle size={22} className="text-slate-500" />
                  )}
                </button>
                <div>
                  <h4 className={`font-semibold text-slate-900 dark:text-slate-100 ${habit.completedToday ? 'line-through text-slate-500' : ''}`}>
                    {habit.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono">{habit.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold">
                <Flame size={14} />
                <span>{habit.currentStreak}d</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

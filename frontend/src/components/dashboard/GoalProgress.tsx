import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Flag } from 'lucide-react';
import { GoalItem } from '../../../../shared/types/lifeos.types';

interface GoalProgressProps {
  goals: GoalItem[];
}

export const GoalProgress: React.FC<GoalProgressProps> = ({ goals }) => {
  return (
    <div className="glass-card p-6 rounded-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Target className="text-cyan-400" size={18} /> GOAL PROGRESS
        </h3>
        <Link to="/goals" className="text-[11px] font-mono text-cyan-400 font-semibold hover:underline">
          {goals.length} Active ↗
        </Link>
      </div>

      {goals.length === 0 ? (
        <div className="p-6 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400">
          No active goals created yet.
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => {
            const milestoneCount = goal.milestones?.length || 0;
            const completedMilestones = goal.milestones?.filter((m) => m.completed).length || 0;
            const targetDateStr = goal.targetDate ? new Date(goal.targetDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Ongoing';

            return (
              <Link
                key={goal.id}
                to="/goals"
                className="block p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/30 transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{goal.title}</h4>
                  <span className="font-mono text-cyan-400 font-bold ml-2">{goal.progress}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Flag size={12} className="text-cyan-400" /> {completedMilestones}/{milestoneCount} Milestones
                  </span>
                  <span>Target: {targetDateStr}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

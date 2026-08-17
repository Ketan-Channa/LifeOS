import React from 'react';
import { Target, TrendingUp, AlertTriangle, Sparkles, CheckCircle2, Flame, Award } from 'lucide-react';
import { GoalStats } from '../../../../shared/types/lifeos.types';

interface GoalIntelligenceCardProps {
  stats: GoalStats | null;
}

export const GoalIntelligenceCard: React.FC<GoalIntelligenceCardProps> = ({ stats }) => {
  const hasEnoughData = stats && stats.totalGoals > 0;
  const mTotal = stats?.milestonesTotal || 0;
  const mCompleted = stats?.milestonesCompleted || 0;
  const milestonePercent = mTotal > 0 ? Math.round((mCompleted / mTotal) * 100) : 0;

  return (
    <div className="glass-card p-6 rounded-3xl space-y-4 border border-cyan-500/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Target size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              LIFEOS GOAL INTELLIGENCE
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Progress velocity, milestone ratio, and deterministic risk modeling</p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono font-bold flex items-center gap-1">
          <Sparkles size={12} /> STATISTICAL ENGINE
        </span>
      </div>

      {!hasEnoughData ? (
        <div className="p-6 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
          <Target size={32} className="text-slate-600 mx-auto animate-pulse" />
          <h4 className="text-xs font-bold text-slate-300">Create goals and milestones to unlock goal intelligence.</h4>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            LifeOS computes milestone completion ratios, goal velocity, and deadline risk models as you complete milestones.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Avg Goal Progress</span>
              <p className="text-lg font-bold text-cyan-400">{stats?.averageGoalProgress || stats?.averageProgress || 0}%</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Goal Velocity</span>
              <p className="text-lg font-bold text-indigo-400">+{stats?.goalVelocity || stats?.averageVelocity || 0}% / day</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Milestones Done</span>
              <p className="text-lg font-bold text-emerald-400">
                {mCompleted} / {mTotal} ({milestonePercent}%)
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Overdue Risk</span>
              <p className={`text-lg font-bold ${stats?.overdueGoals && stats.overdueGoals > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                {stats?.overdueGoals || 0} Goals
              </p>
            </div>
          </div>

          {/* Statistical Callouts */}
          <div className="space-y-2 text-xs">
            {stats?.goalVelocity !== undefined && stats.goalVelocity > 0 && (
              <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-center gap-3 text-slate-300">
                <TrendingUp size={16} className="text-cyan-400 shrink-0" />
                <span>
                  Your active goal progress velocity is <strong className="text-cyan-300">+{stats.goalVelocity}% per day</strong> across active targets.
                </span>
              </div>
            )}

            {stats?.mostActiveCategory && (
              <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex items-center gap-3 text-slate-300">
                <Award size={16} className="text-indigo-400 shrink-0" />
                <span>
                  Your <strong className="text-indigo-300">{stats.mostActiveCategory}</strong> goals have received the highest milestone focus and activity.
                </span>
              </div>
            )}

            {stats?.overdueGoals && stats.overdueGoals > 0 ? (
              <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/20 flex items-center gap-3 text-slate-300">
                <AlertTriangle size={16} className="text-rose-400 shrink-0" />
                <span>
                  <strong className="text-rose-300">{stats.overdueGoals} goal(s)</strong> have passed their target dates and require immediate priority attention.
                </span>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

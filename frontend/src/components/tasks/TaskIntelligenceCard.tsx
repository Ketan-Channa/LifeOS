import React from 'react';
import { BrainCircuit, TrendingUp, AlertCircle, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { TaskStats } from '../../../../shared/types/lifeos.types';

interface TaskIntelligenceCardProps {
  stats: TaskStats | null;
}

export const TaskIntelligenceCard: React.FC<TaskIntelligenceCardProps> = ({ stats }) => {
  const hasEnoughData = stats && stats.totalTasks > 0;

  return (
    <div className="glass-card p-6 rounded-3xl space-y-4 border border-indigo-500/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <BrainCircuit size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              LIFEOS TASK INTELLIGENCE
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Deterministic workload telemetry and behavioral analysis</p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono font-bold flex items-center gap-1">
          <Sparkles size={12} /> STATISTICAL ENGINE
        </span>
      </div>

      {!hasEnoughData ? (
        <div className="p-6 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
          <BrainCircuit size={32} className="text-slate-600 mx-auto animate-pulse" />
          <h4 className="text-xs font-bold text-slate-300">Complete more tasks to unlock personalized task intelligence.</h4>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            LifeOS continuously computes estimation accuracy, completion rates, and delay risks as you complete tasks.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Completion Rate</span>
              <p className="text-lg font-bold text-emerald-400">{stats?.completionRate}%</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Estimation Error</span>
              <p className={`text-lg font-bold ${stats?.estimationErrorPercentage && stats.estimationErrorPercentage > 0 ? 'text-amber-400' : 'text-indigo-400'}`}>
                {stats?.estimationErrorPercentage && stats.estimationErrorPercentage > 0 ? `+${stats.estimationErrorPercentage}%` : `${stats?.estimationErrorPercentage}%`}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Avg Delay</span>
              <p className="text-lg font-bold text-rose-400">{stats?.averageDelayMinutes}m</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Postponed Tasks</span>
              <p className="text-lg font-bold text-amber-300">{stats?.postponedTasks}</p>
            </div>
          </div>

          {/* Statistical Callouts */}
          <div className="space-y-2 text-xs">
            {stats?.estimationErrorPercentage !== 0 && (
              <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex items-center gap-3 text-slate-300">
                <TrendingUp size={16} className="text-indigo-400 shrink-0" />
                <span>
                  Your tasks take on average <strong className="text-indigo-300">{Math.abs(stats?.estimationErrorPercentage || 0)}% {stats?.estimationErrorPercentage && stats.estimationErrorPercentage > 0 ? 'longer' : 'faster'}</strong> than initially estimated.
                </span>
              </div>
            )}

            {stats?.mostPostponedCategory && (
              <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/20 flex items-center gap-3 text-slate-300">
                <AlertCircle size={16} className="text-amber-400 shrink-0" />
                <span>
                  <strong className="text-amber-300">{stats.mostPostponedCategory}</strong> tasks are postponed most frequently across your workflow history.
                </span>
              </div>
            )}

            {stats?.overdueTasks && stats.overdueTasks > 0 ? (
              <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/20 flex items-center gap-3 text-slate-300">
                <Clock size={16} className="text-rose-400 shrink-0" />
                <span>
                  You currently have <strong className="text-rose-300">{stats.overdueTasks} overdue tasks</strong> requiring immediate priority attention.
                </span>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

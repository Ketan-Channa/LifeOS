import React from 'react';
import { CheckCircle2, Circle, Clock, Flame, Tag } from 'lucide-react';
import { TaskItem, ScheduleEventItem } from '../../../../shared/types/lifeos.types';

interface TodaysPlanProps {
  tasks: TaskItem[];
  scheduleEvents: ScheduleEventItem[];
  onToggleTask: (id: string) => void;
}

export const TodaysPlan: React.FC<TodaysPlanProps> = ({
  tasks,
  scheduleEvents,
  onToggleTask
}) => {
  const priorityBadge = (priority: string) => {
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

  const hasItems = tasks.length > 0 || scheduleEvents.length > 0;

  return (
    <div className="glass-card p-6 rounded-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="text-amber-400" size={20} /> TODAY'S PLAN
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Scheduled events and priority task flow</p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400 font-bold">
          {tasks.length + scheduleEvents.length} Items
        </span>
      </div>

      {!hasItems ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
          <p className="text-sm font-semibold text-slate-400">No tasks or events scheduled for today</p>
          <p className="text-xs text-slate-500">Use Quick Actions to add your first daily task.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Schedule Events */}
          {scheduleEvents.map((event) => (
            <div
              key={event.id}
              className="p-3.5 rounded-2xl bg-slate-900/80 border border-purple-500/20 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{event.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">{event.location || event.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-purple-300 font-mono">
                <Clock size={14} />
                <span>
                  {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {/* Tasks */}
          {tasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs ${
                  isCompleted
                    ? 'bg-slate-950/40 border-slate-800 opacity-60'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={20} className="text-emerald-400" />
                    ) : (
                      <Circle size={20} className="text-slate-500" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <h4 className={`font-semibold text-slate-900 dark:text-slate-100 truncate ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                      <span className="font-mono">{task.category}</span>
                      <span>•</span>
                      <span>Est. {task.estimatedMinutes}m</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold ${priorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

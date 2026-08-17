import React from 'react';
import { AlertTriangle, Calendar } from 'lucide-react';
import { TaskItem } from '../../../../shared/types/lifeos.types';

interface DeadlinesWidgetProps {
  deadlines: TaskItem[];
}

export const DeadlinesWidget: React.FC<DeadlinesWidgetProps> = ({ deadlines }) => {
  const getDaysLeft = (dueDateStr?: string | Date | null) => {
    if (!dueDateStr) return 'No due date';
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due Today';
    if (diffDays === 1) return 'Due Tomorrow';
    return `Due in ${diffDays} days`;
  };

  return (
    <div className="glass-card p-6 rounded-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="text-amber-400" size={18} /> UPCOMING DEADLINES
        </h3>
        <span className="text-[11px] font-mono text-slate-400">Sorted by Proximity</span>
      </div>

      {deadlines.length === 0 ? (
        <div className="p-6 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400">
          No upcoming deadline risks detected.
        </div>
      ) : (
        <div className="space-y-2.5">
          {deadlines.map((item) => {
            const dueLabel = getDaysLeft(item.dueDate);
            const isUrgent = item.priority === 'URGENT' || item.priority === 'HIGH' || dueLabel === 'Overdue' || dueLabel === 'Due Today';

            return (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate">{item.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="font-mono">{item.category}</span>
                    <span>•</span>
                    <span className="font-bold text-amber-400">{item.priority}</span>
                  </div>
                </div>

                <div className={`px-2.5 py-1 rounded-xl font-mono text-[11px] font-semibold shrink-0 border ${
                  isUrgent
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                }`}>
                  {dueLabel}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

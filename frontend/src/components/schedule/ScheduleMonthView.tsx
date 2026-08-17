import React from 'react';
import { Calendar, Target, CheckSquare, Clock } from 'lucide-react';
import { ScheduleEventItem, TaskItem, MilestoneItem } from '../../../../shared/types/lifeos.types';

interface ScheduleMonthViewProps {
  year: number;
  month: number; // 1-12
  events: ScheduleEventItem[];
  deadlines: TaskItem[];
  milestones: MilestoneItem[];
  onSelectDate?: (dateStr: string) => void;
}

export const ScheduleMonthView: React.FC<ScheduleMonthViewProps> = ({
  year,
  month,
  events,
  deadlines,
  milestones,
  onSelectDate
}) => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = lastDay.getDate();

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const nowStr = new Date().toISOString().split('T')[0];

  const daysGrid = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysGrid.push(d);
  }

  return (
    <div className="glass-card rounded-3xl border border-slate-800 p-4 space-y-3 font-mono text-xs">
      
      {/* Month Days Header */}
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-500 pb-2 border-b border-slate-800">
        {dayNames.map((name, i) => (
          <span key={i}>{name}</span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 min-h-[420px]">
        {daysGrid.map((dayNum, i) => {
          if (!dayNum) {
            return <div key={i} className="p-2 rounded-2xl bg-slate-950/20 border border-transparent" />;
          }

          const monthStr = String(month).padStart(2, '0');
          const dayStr = String(dayNum).padStart(2, '0');
          const dateStr = `${year}-${monthStr}-${dayStr}`;
          const isToday = dateStr === nowStr;

          const dayEvents = events.filter(e => new Date(e.startTime).toISOString().split('T')[0] === dateStr);
          const dayDeadlines = deadlines.filter(t => t.dueDate && new Date(t.dueDate).toISOString().split('T')[0] === dateStr);
          const dayMilestones = milestones.filter(m => m.completedAt && new Date(m.completedAt).toISOString().split('T')[0] === dateStr);

          return (
            <div
              key={i}
              onClick={() => onSelectDate && onSelectDate(dateStr)}
              className={`p-2 rounded-2xl border transition-all cursor-pointer min-h-[85px] flex flex-col justify-between ${
                isToday
                  ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`font-extrabold text-xs ${isToday ? 'text-indigo-400' : 'text-slate-300'}`}>
                  {dayNum}
                </span>
                {dayDeadlines.length > 0 && <span className="text-rose-400 text-[10px]" title="Deadlines">◆</span>}
              </div>

              {/* Badges / Icons Indicator */}
              <div className="space-y-1 mt-1 text-[10px]">
                {dayEvents.slice(0, 2).map((e, idx) => (
                  <div key={idx} className="truncate px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-sans">
                    ● {e.title}
                  </div>
                ))}
                {dayMilestones.slice(0, 1).map((m, idx) => (
                  <div key={idx} className="truncate px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-sans">
                    🎯 {m.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

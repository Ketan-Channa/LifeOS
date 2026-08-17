import React from 'react';
import { Calendar, Clock, CheckSquare } from 'lucide-react';
import { ScheduleEventItem, TaskItem } from '../../../../shared/types/lifeos.types';

interface ScheduleWeekViewProps {
  startDate: string;
  events: ScheduleEventItem[];
  scheduledTasks: TaskItem[];
  deadlines: TaskItem[];
  onSelectEvent?: (event: ScheduleEventItem) => void;
}

export const ScheduleWeekView: React.FC<ScheduleWeekViewProps> = ({
  startDate,
  events,
  scheduledTasks,
  deadlines,
  onSelectEvent
}) => {
  const start = new Date(startDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });

  const nowStr = new Date().toISOString().split('T')[0];

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'WORK':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'CLASS':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'PROJECT':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'MEETING':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="glass-card rounded-3xl border border-slate-800 p-4 space-y-4 font-mono text-xs overflow-x-auto">
      
      {/* 7-Day Columns Header */}
      <div className="grid grid-cols-7 gap-2 min-w-[700px]">
        {weekDays.map((d, idx) => {
          const dStr = d.toISOString().split('T')[0];
          const isToday = dStr === nowStr;
          const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = d.getDate();

          return (
            <div
              key={idx}
              className={`p-3 rounded-2xl border text-center space-y-1 transition-all ${
                isToday ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300' : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              <span className="block text-[10px] uppercase font-bold">{dayName}</span>
              <span className={`text-base font-extrabold font-sans block ${isToday ? 'text-indigo-400' : 'text-slate-200'}`}>
                {dayNum}
              </span>
            </div>
          );
        })}
      </div>

      {/* Events & Activities Columns */}
      <div className="grid grid-cols-7 gap-2 min-w-[700px] min-h-[450px]">
        {weekDays.map((d, idx) => {
          const dStr = d.toISOString().split('T')[0];
          const dayEvents = events.filter(e => new Date(e.startTime).toISOString().split('T')[0] === dStr);
          const dayTasks = scheduledTasks.filter(t => t.scheduledStart && new Date(t.scheduledStart).toISOString().split('T')[0] === dStr);
          const dayDeadlines = deadlines.filter(t => t.dueDate && new Date(t.dueDate).toISOString().split('T')[0] === dStr);

          return (
            <div key={idx} className="p-2 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-2 min-h-[350px]">
              
              {/* Events List */}
              {dayEvents.map(e => (
                <div
                  key={e.id}
                  onClick={() => onSelectEvent && onSelectEvent(e)}
                  className={`p-2 rounded-xl border cursor-pointer hover:opacity-90 transition-all font-sans text-xs space-y-1 ${getTypeBadge(e.type)}`}
                >
                  <span className="font-bold block truncate">{e.title}</span>
                  <span className="text-[9px] font-mono opacity-80 block">
                    {new Date(e.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {/* Scheduled Tasks */}
              {dayTasks.map(t => (
                <div key={t.id} className="p-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-sans text-xs space-y-0.5">
                  <span className="font-bold flex items-center gap-1">
                    <CheckSquare size={11} /> {t.title}
                  </span>
                </div>
              ))}

              {/* Deadlines */}
              {dayDeadlines.map(t => (
                <div key={t.id} className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] font-mono flex items-center gap-1">
                  <span>◆ Deadline</span>
                </div>
              ))}

            </div>
          );
        })}
      </div>

    </div>
  );
};

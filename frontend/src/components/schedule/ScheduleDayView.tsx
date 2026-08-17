import React, { useEffect, useState } from 'react';
import { Clock, MapPin, CheckCircle2, AlertTriangle, CheckSquare, Target } from 'lucide-react';
import { ScheduleEventItem, TaskItem } from '../../../../shared/types/lifeos.types';

interface ScheduleDayViewProps {
  date: string;
  events: ScheduleEventItem[];
  scheduledTasks: TaskItem[];
  deadlines: TaskItem[];
  onSelectEvent?: (event: ScheduleEventItem) => void;
}

export const ScheduleDayView: React.FC<ScheduleDayViewProps> = ({
  date,
  events,
  scheduledTasks,
  deadlines,
  onSelectEvent
}) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const isToday = date === now.toISOString().split('T')[0];

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentTopPixels = (currentMinutes / 60) * 64; // 64px per hour block

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'WORK':
        return 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300';
      case 'CLASS':
        return 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300';
      case 'PROJECT':
        return 'bg-purple-500/20 border-purple-500/40 text-purple-300';
      case 'MEETING':
        return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';
      case 'HEALTH':
      case 'EXERCISE':
        return 'bg-amber-500/20 border-amber-500/40 text-amber-300';
      default:
        return 'bg-slate-800/80 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="relative glass-card rounded-3xl border border-slate-800 p-4 font-mono text-xs overflow-hidden">
      
      {/* 24-Hour Timeline Grid */}
      <div className="relative h-[1536px] overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Red Current Time Line Indicator */}
        {isToday && (
          <div
            className="absolute left-12 right-0 border-t-2 border-rose-500 z-30 flex items-center gap-1"
            style={{ top: `${currentTopPixels}px` }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 -ml-1 animate-pulse" />
            <span className="bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded text-[9px]">
              NOW {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}

        {/* Hourly Rows */}
        {hours.map((h) => {
          const ampm = h >= 12 ? 'PM' : 'AM';
          const hour12 = h % 12 || 12;
          const timeLabel = `${hour12}:00 ${ampm}`;

          return (
            <div key={h} className="h-16 border-b border-slate-800/60 flex items-start">
              <span className="w-14 text-[10px] text-slate-500 pt-1 border-r border-slate-800/60 pr-2 text-right">
                {timeLabel}
              </span>
              <div className="flex-1 h-full relative" />
            </div>
          );
        })}

        {/* Positioned Events */}
        {events.map((e) => {
          const start = new Date(e.startTime);
          const end = new Date(e.endTime);
          const startMins = start.getHours() * 60 + start.getMinutes();
          const durationMins = Math.max(30, (end.getTime() - start.getTime()) / (1000 * 60));

          const topPx = (startMins / 60) * 64;
          const heightPx = (durationMins / 60) * 64;

          return (
            <div
              key={e.id}
              onClick={() => onSelectEvent && onSelectEvent(e)}
              style={{ top: `${topPx}px`, height: `${heightPx}px` }}
              className={`absolute left-16 right-4 rounded-2xl border p-2.5 z-20 cursor-pointer shadow-md transition-all hover:scale-[1.01] ${getTypeStyle(e.type)}`}
            >
              <div className="flex items-center justify-between font-sans">
                <span className="font-bold text-xs truncate">{e.title}</span>
                <span className="text-[10px] font-mono opacity-80">
                  {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {e.location && (
                <div className="text-[10px] opacity-75 flex items-center gap-1 mt-0.5">
                  <MapPin size={10} /> {e.location}
                </div>
              )}
            </div>
          );
        })}

        {/* Positioned Scheduled Tasks */}
        {scheduledTasks.map((t) => {
          if (!t.scheduledStart || !t.scheduledEnd) return null;
          const start = new Date(t.scheduledStart);
          const end = new Date(t.scheduledEnd);
          const startMins = start.getHours() * 60 + start.getMinutes();
          const durationMins = Math.max(30, (end.getTime() - start.getTime()) / (1000 * 60));

          const topPx = (startMins / 60) * 64;
          const heightPx = (durationMins / 60) * 64;

          return (
            <div
              key={t.id}
              style={{ top: `${topPx}px`, height: `${heightPx}px` }}
              className="absolute left-16 right-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/15 p-2.5 z-20 shadow-md text-emerald-300 font-sans"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs flex items-center gap-1.5">
                  <CheckSquare size={13} className="text-emerald-400" /> {t.title}
                </span>
                <span className="text-[10px] font-mono">
                  {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
};

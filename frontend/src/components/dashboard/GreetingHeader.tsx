import React from 'react';
import { Sparkles, Calendar as CalendarIcon } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const GreetingHeader: React.FC = () => {
  const { user } = useAuthStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-indigo-50 via-slate-100 to-purple-50 dark:from-indigo-950/60 dark:via-slate-900 dark:to-purple-950/40 border border-indigo-200 dark:border-indigo-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors duration-200">
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-mono font-semibold">
          <Sparkles size={13} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
          <span>LifeOS Intelligence Telemetry</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {getGreeting()}, <span className="text-gradient">{user?.name || 'User'}</span> 👋
        </h2>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 font-sans">
          Here's your LifeOS kernel overview for today.
        </p>
      </div>

      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 shadow-sm">
        <CalendarIcon size={16} className="text-indigo-600 dark:text-indigo-400" />
        <span>{formattedDate}</span>
      </div>
    </div>
  );
};

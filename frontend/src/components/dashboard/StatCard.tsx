import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  color: 'indigo' | 'purple' | 'cyan' | 'emerald' | 'amber' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color
}) => {
  const colorStyles = {
    indigo: 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30',
    purple: 'bg-purple-600/20 text-purple-400 border-purple-500/30',
    cyan: 'bg-cyan-600/20 text-cyan-400 border-cyan-500/30',
    emerald: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-600/20 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-600/20 text-rose-400 border-rose-500/30'
  };

  return (
    <div className="glass-card p-5 rounded-2xl border border-white/5 hover:border-slate-700 transition-all duration-300 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colorStyles[color]}`}>
          {icon}
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
          {value}
        </h3>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {trend && (
        <div className="pt-2 border-t border-slate-800/60 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};

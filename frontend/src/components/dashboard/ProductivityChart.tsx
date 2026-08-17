import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

interface ProductivityChartProps {
  data: {
    day: string;
    completedTasks: number;
    focusHours: number;
  }[];
}

export const ProductivityChart: React.FC<ProductivityChartProps> = ({ data }) => {
  const hasActivity = data && data.some((d) => d.completedTasks > 0 || d.focusHours > 0);

  return (
    <div className="glass-card p-6 rounded-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="text-indigo-400" size={18} /> WEEKLY PRODUCTIVITY VELOCITY
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Focus time and daily task completion telemetry</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-indigo-400 font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
          <TrendingUp size={14} /> 7-Day Velocity
        </div>
      </div>

      {!hasActivity ? (
        <div className="h-56 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
          <BarChart3 size={32} className="text-slate-600 animate-pulse" />
          <h4 className="text-xs font-bold text-slate-300">Complete more activities to unlock productivity trends.</h4>
          <p className="text-[11px] text-slate-500 max-w-sm">
            LifeOS kernel automatically builds focus metrics as you mark tasks completed and log habits.
          </p>
        </div>
      ) : (
        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#F8FAFC',
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }}
              />
              <Bar dataKey="focusHours" name="Focus Hours" fill="#6366F1" radius={[6, 6, 0, 0]} />
              <Bar dataKey="completedTasks" name="Completed Tasks" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

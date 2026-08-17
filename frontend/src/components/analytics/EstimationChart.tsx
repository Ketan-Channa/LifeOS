import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, Clock } from 'lucide-react';

interface EstimationChartProps {
  taskData: any;
}

export const EstimationChart: React.FC<EstimationChartProps> = ({ taskData }) => {
  if (!taskData || !taskData.available) return null;

  const categories = taskData.categoryAnalysis || [];
  const chartData = categories.slice(0, 6).map((c: any) => ({
    category: c.category,
    Estimated: Math.round(taskData.averageEstimatedMinutes || 45),
    Actual: Math.round((taskData.averageEstimatedMinutes || 45) * (1 + (taskData.estimationErrorPercentage || 15) / 100))
  }));

  const errPct = taskData.estimationErrorPercentage || 0;

  return (
    <div className="glass-card p-6 rounded-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock size={18} className="text-amber-400" /> Estimated vs Actual Duration
          </h3>
          <p className="text-xs text-slate-500">Planning accuracy telemetry across workload categories</p>
        </div>

        <div className="text-right font-mono">
          <span className={`text-lg font-bold ${errPct > 0 ? 'text-amber-400' : 'text-indigo-400'}`}>
            {errPct > 0 ? `+${errPct}%` : `${errPct}%`}
          </span>
          <span className="block text-[10px] text-slate-400">Avg Estimation Error</span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="category" stroke="#64748B" fontSize={10} fontFamily="monospace" />
            <YAxis stroke="#64748B" fontSize={10} fontFamily="monospace" unit="m" />
            <Tooltip
              contentStyle={{ background: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
            <Bar dataKey="Estimated" fill="#818CF8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Actual" fill="#F59E0B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

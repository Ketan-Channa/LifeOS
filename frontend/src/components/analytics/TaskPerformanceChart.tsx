import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Clock, Calendar } from 'lucide-react';

interface TaskPerformanceChartProps {
  taskData: any;
}

export const TaskPerformanceChart: React.FC<TaskPerformanceChartProps> = ({ taskData }) => {
  const [activeTab, setActiveTab] = useState<'hour' | 'weekday'>('hour');

  if (!taskData || !taskData.available) return null;

  const hourlyData = (taskData.productivityByHour || []).map((item: any) => ({
    label: `${item.hour % 12 || 12}${item.hour >= 12 ? 'pm' : 'am'}`,
    completed: item.completedTasks
  }));

  const weekdayData = taskData.productivityByWeekday || [];

  return (
    <div className="glass-card p-6 rounded-3xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock size={18} className="text-cyan-400" /> Completion Distribution
          </h3>
          <p className="text-xs text-slate-500">Recorded task completion activity grouped by hour and day of week</p>
        </div>

        <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono">
          <button
            onClick={() => setActiveTab('hour')}
            className={`px-3 py-1 rounded-xl transition-all ${
              activeTab === 'hour' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            By Hour (24h)
          </button>
          <button
            onClick={() => setActiveTab('weekday')}
            className={`px-3 py-1 rounded-xl transition-all ${
              activeTab === 'weekday' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            By Weekday
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={activeTab === 'hour' ? hourlyData : weekdayData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey={activeTab === 'hour' ? 'label' : 'weekday'} stroke="#64748B" fontSize={10} fontFamily="monospace" />
            <YAxis stroke="#64748B" fontSize={10} fontFamily="monospace" />
            <Tooltip
              contentStyle={{ background: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              itemStyle={{ color: '#22D3EE' }}
            />
            <Bar dataKey="completedTasks" fill="#22D3EE" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Target, Flag } from 'lucide-react';

interface GoalProgressChartProps {
  goalData: any;
}

export const GoalProgressChart: React.FC<GoalProgressChartProps> = ({ goalData }) => {
  if (!goalData || !goalData.available) return null;

  const goals = goalData.goals || [];
  const chartData = goals.map((g: any) => ({
    title: g.title.length > 15 ? `${g.title.substring(0, 15)}...` : g.title,
    progress: g.progress,
    milestones: g.completedMilestones
  }));

  return (
    <div className="glass-card p-6 rounded-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target size={18} className="text-cyan-400" /> Goal Velocity & Milestone Telemetry
          </h3>
          <p className="text-xs text-slate-500">Milestone completion ratios and active goal velocity (+{goalData.goalVelocity || 0}% / day)</p>
        </div>

        <div className="text-right font-mono">
          <span className="text-lg font-bold text-cyan-400">{goalData.averageProgress}%</span>
          <span className="block text-[10px] text-slate-400">Avg Progress</span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} stroke="#64748B" fontSize={10} fontFamily="monospace" unit="%" />
            <YAxis dataKey="title" type="category" stroke="#64748B" fontSize={10} fontFamily="monospace" width={100} />
            <Tooltip
              contentStyle={{ background: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              itemStyle={{ color: '#22D3EE' }}
            />
            <Bar dataKey="progress" fill="#22D3EE" radius={[0, 6, 6, 0]} name="Progress %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

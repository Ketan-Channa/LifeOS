import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { Layers, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface WorkloadChartProps {
  workloadData: any;
}

export const WorkloadChart: React.FC<WorkloadChartProps> = ({ workloadData }) => {
  if (!workloadData || !workloadData.available) return null;

  const data = workloadData.dailyWorkloadTrend || [];
  const capacity = workloadData.historicalCapacityHours || 6.5;
  const pressure = workloadData.workloadPressure || 'LOW';

  const getPressureBadge = (p: string) => {
    switch (p) {
      case 'HIGH':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="glass-card p-6 rounded-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers size={18} className="text-indigo-400" /> Daily Workload & Capacity
          </h3>
          <p className="text-xs text-slate-500">Planned hours vs historical daily completion capacity ({capacity} hrs/day)</p>
        </div>

        <div className="text-right font-mono">
          <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getPressureBadge(pressure)}`}>
            {pressure} PRESSURE
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="day" stroke="#64748B" fontSize={11} fontFamily="monospace" />
            <YAxis stroke="#64748B" fontSize={11} fontFamily="monospace" unit="h" />
            <Tooltip
              contentStyle={{ background: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
            />
            <ReferenceLine y={capacity} stroke="#F43F5E" strokeDasharray="4 4" label={{ value: `Capacity (${capacity}h)`, fill: '#F43F5E', fontSize: 10, position: 'top' }} />
            <Bar dataKey="completedHours" fill="#6366F1" radius={[6, 6, 0, 0]} name="Completed Hours" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

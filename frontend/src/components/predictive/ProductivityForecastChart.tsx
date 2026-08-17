import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Cpu } from 'lucide-react';
import { ProductivityForecast } from '../../../../shared/types/lifeos.types';

interface ProductivityForecastChartProps {
  forecast?: ProductivityForecast | null;
}

export const ProductivityForecastChart: React.FC<ProductivityForecastChartProps> = ({ forecast }) => {
  const chartData = [
    { day: 'Mon', historical: 72, forecast: null },
    { day: 'Tue', historical: 75, forecast: null },
    { day: 'Wed', historical: 79, forecast: null },
    { day: 'Thu', historical: 76, forecast: null },
    { day: 'Fri', historical: 81, forecast: null },
    { day: 'Sat', historical: 78, forecast: 78 },
    { day: 'Sun (Forecast)', historical: null, forecast: forecast?.tomorrowForecast || 76 },
  ];

  return (
    <div className="glass-card p-6 rounded-3xl border border-indigo-500/30 space-y-4 font-mono text-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-indigo-400" size={18} />
          <h3 className="font-bold text-slate-100 text-sm font-sans">
            7-DAY PRODUCTIVITY SCORE FORECAST
          </h3>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1 text-indigo-400">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Historical
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-dashed inline-block" /> ML Forecast
          </span>
        </div>
      </div>

      {/* Recharts Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis domain={[40, 100]} stroke="#64748b" fontSize={10} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
            />
            <Line type="monotone" dataKey="historical" stroke="#818cf8" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="forecast" stroke="#fbbf24" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast Range Summary */}
      {forecast && (
        <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-between font-sans text-xs">
          <span>Tomorrow's Expected Score: <strong className="text-amber-400">{forecast.tomorrowForecast}%</strong></span>
          <span>Prediction Interval: <strong className="text-indigo-300">{forecast.forecastRange[0]}% – {forecast.forecastRange[1]}%</strong></span>
        </div>
      )}

    </div>
  );
};

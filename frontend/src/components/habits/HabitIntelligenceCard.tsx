import React from 'react';
import { Sparkles, TrendingUp, Calendar, Clock, BarChart2, AlertCircle } from 'lucide-react';
import { RoutineAnalyticsData } from '../../../../shared/types/lifeos.types';

interface HabitIntelligenceCardProps {
  analytics: RoutineAnalyticsData | null;
}

export const HabitIntelligenceCard: React.FC<HabitIntelligenceCardProps> = ({ analytics }) => {
  if (!analytics || !analytics.available) {
    return (
      <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-3 font-mono text-xs">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <Sparkles size={16} /> Routine Intelligence Telemetry
        </div>
        <p className="text-slate-400 leading-relaxed font-sans">
          {analytics?.reason || 'Continue tracking your habits to unlock routine intelligence and productivity correlations.'}
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-3xl border border-purple-500/30 space-y-5 font-mono text-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          <h3 className="font-bold text-slate-100 text-sm">ROUTINE INTELLIGENCE</h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">ROUTINE SCORE:</span>
          <span className="text-lg font-extrabold text-purple-300 font-sans">{analytics.routineScore}%</span>
        </div>
      </div>

      {/* Routine Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* Best Day */}
        <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-1">
          <div className="text-[10px] text-purple-300 font-bold flex items-center gap-1">
            <Calendar size={12} /> BEST HABIT DAY
          </div>
          <p className="text-sm font-bold text-slate-100 font-sans">{analytics.bestHabitDay || 'Thursday'}</p>
          <p className="text-[11px] text-slate-400 font-sans">Highest recorded completion rate</p>
        </div>

        {/* Best Hour */}
        <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-1">
          <div className="text-[10px] text-purple-300 font-bold flex items-center gap-1">
            <Clock size={12} /> PEAK HABIT HOUR
          </div>
          <p className="text-sm font-bold text-slate-100 font-sans">
            {analytics.bestHabitHour ? `${analytics.bestHabitHour % 12 || 12}:00 ${analytics.bestHabitHour >= 12 ? 'PM' : 'AM'}` : '8:00 PM'}
          </p>
          <p className="text-[11px] text-slate-400 font-sans">Peak recorded activity window</p>
        </div>

        {/* Category Performance */}
        <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-1">
          <div className="text-[10px] text-purple-300 font-bold flex items-center gap-1">
            <TrendingUp size={12} /> CONSISTENCY TREND
          </div>
          <p className="text-sm font-bold text-emerald-400 font-sans">{analytics.routineScoreTrend}</p>
          <p className="text-[11px] text-slate-400 font-sans">{analytics.averageConsistencyPercentage}% average consistency</p>
        </div>

      </div>

      {/* Pearson Correlation Insights */}
      {analytics.correlations && analytics.correlations.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <span className="text-[10px] text-cyan-400 font-bold uppercase block flex items-center gap-1">
            <BarChart2 size={13} /> STATISTICAL PRODUCTIVITY CORRELATION (PEARSON r)
          </span>
          {analytics.correlations.map((corr, idx) => (
            <p key={idx} className="text-slate-300 font-sans text-xs leading-relaxed">
              {corr.description}
            </p>
          ))}
        </div>
      )}

    </div>
  );
};

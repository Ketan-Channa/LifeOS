import React from 'react';
import { Cpu, AlertTriangle, Target, Clock, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { PredictionsOverview } from '../../../../shared/types/lifeos.types';

interface PredictiveIntelligenceCardProps {
  overview: PredictionsOverview | null;
}

export const PredictiveIntelligenceCard: React.FC<PredictiveIntelligenceCardProps> = ({ overview }) => {
  if (!overview || !overview.available) {
    return (
      <div className="glass-card p-5 rounded-3xl border border-slate-800 font-mono text-xs space-y-2">
        <div className="flex items-center gap-2 text-indigo-400 font-bold">
          <Cpu size={16} /> Predictive Intelligence Engine
        </div>
        <p className="text-slate-400 font-sans text-xs">
          {overview?.reason || 'Keep using LifeOS to build enough history for predictive machine learning models.'}
        </p>
      </div>
    );
  }

  const isWorkloadHigh = overview.tomorrowWorkloadRisk === 'HIGH';

  return (
    <div className="glass-card p-6 rounded-3xl border border-indigo-500/30 space-y-4 font-mono text-xs shadow-xl bg-slate-950/80">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Cpu size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm font-sans flex items-center gap-2">
              LIFEOS PREDICTIVE INTELLIGENCE
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Scikit-Learn Machine Learning Models & Risk Forecasting
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold flex items-center gap-1">
          <Sparkles size={12} /> ML ENGINE OPERATIONAL
        </span>
      </div>

      {/* 4-Card Prediction Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        
        {/* Task Risk */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold block flex items-center gap-1">
            <AlertTriangle size={12} className="text-rose-400" /> TASK DEADLINE RISK
          </span>
          <p className="text-lg font-bold text-rose-400 font-sans">
            {overview.highRiskTasksCount} High Risk
          </p>
          <p className="text-[10px] text-slate-400 font-sans">
            {overview.mediumRiskTasksCount} Medium Risk Tasks
          </p>
        </div>

        {/* Goal Risk */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold block flex items-center gap-1">
            <Target size={12} className="text-cyan-400" /> GOAL DEADLINE RISK
          </span>
          <p className="text-lg font-bold text-cyan-300 font-sans">
            {overview.highRiskGoalsCount} Goals At Risk
          </p>
          <p className="text-[10px] text-slate-400 font-sans">
            Milestone progress evaluation
          </p>
        </div>

        {/* Tomorrow Workload */}
        <div className={`p-3.5 rounded-2xl border space-y-1 ${
          isWorkloadHigh ? 'bg-amber-950/20 border-amber-500/30' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <span className="text-[10px] text-amber-400 font-bold block flex items-center gap-1">
            <Clock size={12} /> TOMORROW WORKLOAD
          </span>
          <p className={`text-lg font-bold font-sans ${isWorkloadHigh ? 'text-amber-400' : 'text-slate-200'}`}>
            {overview.tomorrowWorkloadRisk}
          </p>
          <p className="text-[10px] text-slate-400 font-sans">Capacity threshold analysis</p>
        </div>

        {/* Tomorrow Productivity Forecast */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[10px] text-indigo-400 font-bold block flex items-center gap-1">
            <TrendingUp size={12} /> PRODUCTIVITY FORECAST
          </span>
          <p className="text-lg font-bold text-indigo-300 font-sans">
            {overview.tomorrowProductivityForecast}%
          </p>
          <p className="text-[10px] text-slate-400 font-sans">Scikit-Learn Random Forest</p>
        </div>

      </div>

    </div>
  );
};

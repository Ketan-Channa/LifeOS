import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Layers, 
  Target, 
  BrainCircuit, 
  Info,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Cpu
} from 'lucide-react';
import { DateRangeSelector } from '../components/analytics/DateRangeSelector';
import { AnalyticsEmptyState } from '../components/analytics/AnalyticsEmptyState';
import { ProductivityTrendChart } from '../components/analytics/ProductivityTrendChart';
import { TaskPerformanceChart } from '../components/analytics/TaskPerformanceChart';
import { EstimationChart } from '../components/analytics/EstimationChart';
import { WorkloadChart } from '../components/analytics/WorkloadChart';
import { GoalProgressChart } from '../components/analytics/GoalProgressChart';
import { BehavioralPatternCard } from '../components/analytics/BehavioralPatternCard';
import { HabitIntelligenceCard } from '../components/habits/HabitIntelligenceCard';
import { ProductivityForecastChart } from '../components/predictive/ProductivityForecastChart';
import { 
  getAnalyticsOverview, 
  getTaskAnalytics, 
  getWorkloadAnalytics, 
  getGoalAnalytics 
} from '../services/analytics.api';
import { getRoutineAnalytics } from '../services/habits.api';
import { getProductivityForecast } from '../services/predictions.api';
import { AnalyticsOverviewData, RoutineAnalyticsData, ProductivityForecast } from '../../../shared/types/lifeos.types';

export const AnalyticsView: React.FC = () => {
  const [dateRange, setDateRange] = useState('last_30_days');
  const [overview, setOverview] = useState<AnalyticsOverviewData | null>(null);
  const [taskData, setTaskData] = useState<any>(null);
  const [workloadData, setWorkloadData] = useState<any>(null);
  const [goalData, setGoalData] = useState<any>(null);
  const [routineAnalytics, setRoutineAnalytics] = useState<RoutineAnalyticsData | null>(null);
  const [forecast, setForecast] = useState<ProductivityForecast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'productivity' | 'tasks' | 'workload' | 'goals' | 'routines' | 'insights'>('overview');

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const [ovData, tData, wData, gData, rData, fCast] = await Promise.all([
        getAnalyticsOverview(dateRange),
        getTaskAnalytics(dateRange),
        getWorkloadAnalytics(dateRange),
        getGoalAnalytics(dateRange),
        getRoutineAnalytics().catch(() => null),
        getProductivityForecast().catch(() => null)
      ]);
      setOverview(ovData);
      setTaskData(tData);
      setWorkloadData(wData);
      setGoalData(gData);
      setRoutineAnalytics(rData);
      setForecast(fCast);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Date Range Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="text-indigo-400" /> Productivity & Routine Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Understand how you work, where your time goes, and how your habits correlate with overall productivity.
          </p>
        </div>

        <DateRangeSelector selectedRange={dateRange} onChange={setDateRange} />
      </div>

      {/* Loading Indicator */}
      {isLoading ? (
        <div className="h-96 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-400">Running Python Data Telemetry Analytics...</p>
        </div>
      ) : !overview || !overview.available ? (
        <AnalyticsEmptyState
          title="Not enough historical data yet."
          message={overview?.reason || "Continue using LifeOS to unlock data-driven behavioral intelligence."}
          minRequirement="Complete at least 5 tasks to unlock your analytics dashboard."
        />
      ) : (
        <div className="space-y-6">
          
          {/* 2. Analytics Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-2xl glass-card border border-indigo-500/30 space-y-1">
              <div className="flex justify-between items-center text-[10px] font-mono text-indigo-400 uppercase font-semibold">
                <span>PRODUCTIVITY</span>
                <span title="Weighted composite score of completion, on-time rate, estimation accuracy, and goal progress">
                  <Info size={12} />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-white font-mono">{overview.productivityScore?.score}%</p>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-emerald-500/20 space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">COMPLETION RATE</span>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono">{overview.taskCompletionRate}%</p>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-amber-500/20 space-y-1">
              <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">ESTIMATION ERROR</span>
              <p className="text-2xl font-extrabold text-amber-400 font-mono">
                {overview.averageEstimationErrorPercentage > 0 ? `+${overview.averageEstimationErrorPercentage}%` : `${overview.averageEstimationErrorPercentage}%`}
              </p>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-rose-500/20 space-y-1">
              <span className="text-[10px] font-mono text-rose-400 uppercase font-semibold">POSTPONEMENT RATE</span>
              <p className="text-2xl font-extrabold text-rose-400 font-mono">{overview.postponementRatePercentage}%</p>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-cyan-500/20 space-y-1">
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">ROUTINE SCORE</span>
              <p className="text-2xl font-extrabold text-cyan-400 font-mono">{routineAnalytics?.routineScore || 0}%</p>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-purple-500/20 space-y-1">
              <span className="text-[10px] font-mono text-purple-400 uppercase font-semibold">WORKLOAD PRESSURE</span>
              <p className="text-xl font-extrabold text-purple-300 font-mono mt-1">{overview.workloadPressure}</p>
            </div>
          </div>

          {/* 3. Section Navigation Tabs */}
          <div className="flex border-b border-slate-800/80 text-xs font-mono overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2.5 px-4 border-b-2 font-bold transition-colors whitespace-nowrap ${
                activeTab === 'overview' ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Overview & Score
            </button>
            <button
              onClick={() => setActiveTab('routines')}
              className={`py-2.5 px-4 border-b-2 font-bold transition-colors whitespace-nowrap ${
                activeTab === 'routines' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Routine & Habits Analytics
            </button>
            <button
              onClick={() => setActiveTab('productivity')}
              className={`py-2.5 px-4 border-b-2 font-bold transition-colors whitespace-nowrap ${
                activeTab === 'productivity' ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Productivity Trends
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-2.5 px-4 border-b-2 font-bold transition-colors whitespace-nowrap ${
                activeTab === 'tasks' ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Task Performance
            </button>
            <button
              onClick={() => setActiveTab('workload')}
              className={`py-2.5 px-4 border-b-2 font-bold transition-colors whitespace-nowrap ${
                activeTab === 'workload' ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Workload & Capacity
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`py-2.5 px-4 border-b-2 font-bold transition-colors whitespace-nowrap ${
                activeTab === 'goals' ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Goal Analytics
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`py-2.5 px-4 border-b-2 font-bold transition-colors whitespace-nowrap ${
                activeTab === 'insights' ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Behavioral Insights ({overview.topPatterns ? overview.topPatterns.length : 0})
            </button>
          </div>

          {/* 4. Tab Content Views */}

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <ProductivityForecastChart forecast={forecast} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProductivityTrendChart scoreData={overview.productivityScore} />
                <WorkloadChart workloadData={workloadData} />
              </div>

              {/* Routine Intelligence Section */}
              <HabitIntelligenceCard analytics={routineAnalytics} />

              {/* Top Patterns Section */}
              {overview.topPatterns && overview.topPatterns.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <BrainCircuit className="text-cyan-400" size={20} /> DETECTED BEHAVIORAL PATTERNS
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {overview.topPatterns.map((pattern, idx) => (
                      <BehavioralPatternCard key={idx} pattern={pattern} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ROUTINES TAB */}
          {activeTab === 'routines' && (
            <div className="space-y-6">
              <HabitIntelligenceCard analytics={routineAnalytics} />
            </div>
          )}

          {/* PRODUCTIVITY TAB */}
          {activeTab === 'productivity' && (
            <div className="space-y-6">
              <ProductivityForecastChart forecast={forecast} />
              <ProductivityTrendChart scoreData={overview.productivityScore} />
              <TaskPerformanceChart taskData={taskData} />
            </div>
          )}

          {/* TASKS TAB */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <EstimationChart taskData={taskData} />
              <TaskPerformanceChart taskData={taskData} />
            </div>
          )}

          {/* WORKLOAD TAB */}
          {activeTab === 'workload' && (
            <div className="space-y-6">
              <WorkloadChart workloadData={workloadData} />
            </div>
          )}

          {/* GOALS TAB */}
          {activeTab === 'goals' && (
            <div className="space-y-6">
              <GoalProgressChart goalData={goalData} />
            </div>
          )}

          {/* BEHAVIORAL INSIGHTS TAB */}
          {activeTab === 'insights' && (
            <div className="space-y-4">
              {!overview.topPatterns || overview.topPatterns.length === 0 ? (
                <AnalyticsEmptyState
                  title="No behavioral patterns detected yet."
                  message="Continue logging task timers, completions, and milestone progress to generate behavioral pattern insights."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {overview.topPatterns.map((pattern, idx) => (
                    <BehavioralPatternCard key={idx} pattern={pattern} />
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
};

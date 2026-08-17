import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckSquare, 
  Clock, 
  Target, 
  Flame, 
  AlertTriangle, 
  BarChart3,
  Sparkles
} from 'lucide-react';
import { GreetingHeader } from '../components/dashboard/GreetingHeader';
import { StatCard } from '../components/dashboard/StatCard';
import { TodaysPlan } from '../components/dashboard/TodaysPlan';
import { DeadlinesWidget } from '../components/dashboard/DeadlinesWidget';
import { GoalProgress } from '../components/dashboard/GoalProgress';
import { HabitOverview } from '../components/dashboard/HabitOverview';
import { ProductivityChart } from '../components/dashboard/ProductivityChart';
import { IntelligencePanel } from '../components/dashboard/IntelligencePanel';
import { QuickActionsBar } from '../components/dashboard/QuickActionsBar';
import { PredictiveIntelligenceCard } from '../components/predictive/PredictiveIntelligenceCard';
import { AddTaskModal } from '../components/modals/AddTaskModal';
import { AddGoalModal } from '../components/modals/AddGoalModal';
import { AddHabitModal } from '../components/modals/AddHabitModal';
import { getDashboardOverview } from '../services/dashboard.api';
import { getAnalyticsOverview } from '../services/analytics.api';
import { getAIRecommendations } from '../services/ai.api';
import { getPredictionsOverview } from '../services/predictions.api';
import { toggleCompleteTask } from '../services/tasks.api';
import { logHabit } from '../services/habits.api';
import { DashboardOverview, AnalyticsOverviewData, AIRecommendationItem, PredictionsOverview } from '../../../shared/types/lifeos.types';

export const DashboardView: React.FC = () => {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsOverviewData | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendationItem[]>([]);
  const [predictionsOverview, setPredictionsOverview] = useState<PredictionsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);

  const fetchOverview = async () => {
    try {
      setIsLoading(true);
      const [overview, analytics, recs, predOverview] = await Promise.all([
        getDashboardOverview(),
        getAnalyticsOverview('last_30_days').catch(() => null),
        getAIRecommendations().catch(() => []),
        getPredictionsOverview().catch(() => null)
      ]);
      setData(overview);
      setAnalyticsData(analytics);
      setRecommendations(recs);
      setPredictionsOverview(predOverview);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard overview');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleToggleTask = async (taskId: string) => {
    try {
      await toggleCompleteTask(taskId);
      fetchOverview();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogHabit = async (habitId: string) => {
    try {
      await logHabit(habitId, { date: new Date().toISOString().split('T')[0], status: 'COMPLETED' });
      fetchOverview();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-xs font-mono text-slate-400">Loading LifeOS Kernel Data Telemetry...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
        {error || 'Failed to initialize LifeOS dashboard overview.'}
      </div>
    );
  }

  const focusHours = Math.floor(data.stats.focusTimeMinutes / 60);
  const focusMins = data.stats.focusTimeMinutes % 60;
  const focusTimeStr = focusHours > 0 ? `${focusHours}h ${focusMins}m` : `${focusMins}m`;

  const prodScoreVal = analyticsData?.productivityScore?.score || data.stats.productivityScore;

  return (
    <div className="space-y-6">
      
      {/* 1. Personalized Greeting Banner */}
      <GreetingHeader />

      {/* 2. Quick Actions Bar */}
      <QuickActionsBar
        onOpenTaskModal={() => setIsTaskModalOpen(true)}
        onOpenGoalModal={() => setIsGoalModalOpen(true)}
        onOpenScheduleModal={() => setIsTaskModalOpen(true)}
        onOpenHabitModal={() => setIsHabitModalOpen(true)}
        onOpenNoteModal={() => setIsTaskModalOpen(true)}
        onOpenScout={() => {
          const trigger = document.querySelector('button[title="SCOUT AI Assistant"]') as HTMLButtonElement;
          trigger?.click();
        }}
      />

      {/* 3. LIFEOS PREDICTIVE INTELLIGENCE CARD */}
      <PredictiveIntelligenceCard overview={predictionsOverview} />

      {/* 4. Daily Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Link to="/analytics" className="block hover:opacity-90 transition-opacity">
          <StatCard
            title="Productivity Score"
            value={prodScoreVal > 0 ? `${prodScoreVal}%` : 'No data yet'}
            subtitle="Kernel Efficiency"
            icon={<BarChart3 size={20} />}
            color="indigo"
            trend={analyticsData?.productivityScore?.trend === 'IMPROVING' ? '+3.2% this week' : 'Stable'}
          />
        </Link>

        <Link to="/tasks" className="block hover:opacity-90 transition-opacity">
          <StatCard
            title="Tasks Today"
            value={data.stats.tasksTodayCount > 0 ? data.stats.tasksTodayCount : 'No data yet'}
            subtitle={`${data.tasks.completedTodayCount} Completed`}
            icon={<CheckSquare size={20} />}
            color="emerald"
          />
        </Link>

        <StatCard
          title="Focus Time"
          value={data.stats.focusTimeMinutes > 0 ? focusTimeStr : 'No data yet'}
          subtitle="Deep Work Telemetry"
          icon={<Clock size={20} />}
          color="purple"
        />

        <Link to="/goals" className="block hover:opacity-90 transition-opacity">
          <StatCard
            title="Active Goals"
            value={data.stats.activeGoalsCount > 0 ? data.stats.activeGoalsCount : 'No data yet'}
            subtitle="Milestones Tracking"
            icon={<Target size={20} />}
            color="cyan"
          />
        </Link>

        <StatCard
          title="Habit Streak"
          value={data.stats.habitStreakDays > 0 ? `${data.stats.habitStreakDays} Days` : 'No data yet'}
          subtitle="Consistency Score"
          icon={<Flame size={20} />}
          color="amber"
        />

        <StatCard
          title="Deadlines Risk"
          value={data.stats.upcomingDeadlinesCount > 0 ? `${data.stats.upcomingDeadlinesCount} Tasks` : 'No data yet'}
          subtitle="Sorted Proximity"
          icon={<AlertTriangle size={20} />}
          color="rose"
        />
      </div>

      {/* 5. LIFEOS DAILY INTELLIGENCE SECTION */}
      {recommendations.length > 0 && (
        <div className="glass-card p-5 rounded-3xl border border-purple-500/30 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-purple-300 flex items-center gap-2 text-sm">
              <Sparkles size={16} className="text-purple-400" /> LIFEOS DAILY INTELLIGENCE
            </h3>
            <span className="text-[10px] text-purple-400/80 uppercase font-bold">REAL METRICS TELEMETRY</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans">
            {recommendations.slice(0, 3).map((rec, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-1">
                <span className="font-bold text-xs text-purple-200 block">{rec.title}</span>
                <p className="text-xs text-slate-300">{rec.reason}</p>
                {rec.suggestedAction && (
                  <span className="text-[11px] text-purple-400 font-mono block pt-1 font-bold">
                    ➜ {rec.suggestedAction}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Plan */}
          <TodaysPlan
            tasks={data.tasks.today}
            scheduleEvents={data.scheduleEventsToday}
            onToggleTask={handleToggleTask}
          />

          {/* Recharts Productivity Velocity */}
          <ProductivityChart data={data.productivityData} />

          {/* LifeOS Intelligence Panel */}
          <IntelligencePanel patterns={analyticsData?.topPatterns || []} />
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <DeadlinesWidget deadlines={data.deadlines} />

          {/* Active Goals */}
          <GoalProgress goals={data.goals} />

          {/* Today's Habits */}
          <HabitOverview habits={data.habits} onLogHabit={handleLogHabit} />
        </div>

      </div>

      {/* Interactive Creation Modals */}
      <AddTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSuccess={fetchOverview}
      />

      <AddGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSuccess={fetchOverview}
      />

      <AddHabitModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        onSuccess={fetchOverview}
      />

    </div>
  );
};

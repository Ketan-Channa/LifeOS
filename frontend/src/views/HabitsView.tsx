import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  Sparkles,
  Award
} from 'lucide-react';
import { HabitCard } from '../components/habits/HabitCard';
import { HabitIntelligenceCard } from '../components/habits/HabitIntelligenceCard';
import { AddHabitModal } from '../components/modals/AddHabitModal';
import { 
  getHabits, 
  getHabitStats, 
  logHabit, 
  pauseHabit, 
  resumeHabit, 
  getWeeklyHabits, 
  getMonthlyHeatmap, 
  getRoutineAnalytics 
} from '../services/habits.api';
import { 
  HabitItem, 
  HabitSummaryStats, 
  RoutineAnalyticsData 
} from '../../../shared/types/lifeos.types';

export const HabitsView: React.FC = () => {
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [stats, setStats] = useState<HabitSummaryStats | null>(null);
  const [analytics, setAnalytics] = useState<RoutineAnalyticsData | null>(null);
  const [weeklyData, setWeeklyData] = useState<{ weekDates: string[]; habits: HabitItem[] }>({ weekDates: [], habits: [] });
  const [heatmap, setHeatmap] = useState<Record<string, number>>({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHabitsData = async () => {
    try {
      setIsLoading(true);
      const [hList, stData, wData, hmData, routineData] = await Promise.all([
        getHabits({ category: selectedCategory, status: selectedStatus, search: searchQuery }),
        getHabitStats().catch(() => null),
        getWeeklyHabits().catch(() => ({ weekDates: [], habits: [] })),
        getMonthlyHeatmap().catch(() => ({})),
        getRoutineAnalytics().catch(() => null)
      ]);

      setHabits(hList);
      setStats(stData);
      setWeeklyData(wData);
      setHeatmap(hmData);
      setAnalytics(routineData);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHabitsData();
  }, [selectedCategory, selectedStatus, searchQuery]);

  const handleLogHabit = async (habitId: string, status: string) => {
    try {
      await logHabit(habitId, { status });
      fetchHabitsData();
    } catch (err) {
      console.error(err);
    }
  };

  const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Create Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="text-amber-500" /> Habits & Routine Intelligence
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Build consistent routines and understand how your daily habits shape your productivity.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-xs text-white flex items-center gap-1.5 transition-all shadow-lg shadow-amber-600/20"
        >
          <Plus size={16} /> Create Habit
        </button>
      </div>

      {/* 2. Habit Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 font-mono text-xs">
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold block uppercase">TOTAL HABITS</span>
          <span className="text-xl font-extrabold text-slate-100 font-sans">{stats?.totalHabits || 0}</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold block uppercase">ACTIVE</span>
          <span className="text-xl font-extrabold text-amber-400 font-sans">{stats?.activeHabits || 0}</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold block uppercase">COMPLETED TODAY</span>
          <span className="text-xl font-extrabold text-emerald-400 font-sans">{stats?.completedToday || 0}</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold block uppercase">BEST STREAK</span>
          <span className="text-xl font-extrabold text-cyan-400 font-sans">{stats?.bestCurrentStreak || 0} days</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 font-bold block uppercase">CONSISTENCY</span>
          <span className="text-xl font-extrabold text-indigo-400 font-sans">{stats?.averageConsistency || 0}%</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-purple-500/30 bg-purple-950/20 space-y-1">
          <span className="text-[10px] text-purple-300 font-bold block uppercase">ROUTINE SCORE</span>
          <span className="text-xl font-extrabold text-purple-300 font-sans">{stats?.routineScore || 0}%</span>
        </div>
      </div>

      {/* 3. Routine Intelligence Engine Card */}
      <HabitIntelligenceCard analytics={analytics} />

      {/* 4. Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl glass-card border border-slate-800 font-mono text-xs">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search habits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
          >
            <option value="ALL">All Categories</option>
            <option value="Health">Health</option>
            <option value="Fitness">Fitness</option>
            <option value="Learning">Learning</option>
            <option value="Career">Career</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
          </select>
        </div>

        <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl">
          <button
            onClick={() => setSelectedStatus('ACTIVE')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              selectedStatus === 'ACTIVE' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setSelectedStatus('PAUSED')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              selectedStatus === 'PAUSED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Paused
          </button>
        </div>
      </div>

      {/* 5. Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns — Habits Grid */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3 glass-card rounded-3xl border border-slate-800">
              <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
              <p className="text-xs font-mono text-slate-400">Loading Habit Telemetry...</p>
            </div>
          ) : habits.length === 0 ? (
            <div className="p-8 text-center glass-card rounded-3xl border border-slate-800 space-y-3 font-mono text-xs text-slate-400">
              <p>No active habits matching filters.</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold"
              >
                + Create Your First Habit
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onLog={handleLogHabit}
                  onPause={pauseHabit}
                  onResume={resumeHabit}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column — Weekly Matrix & Monthly Heatmap Sidebar */}
        <div className="space-y-6">
          
          {/* Weekly Habit Tracker Matrix */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-3 font-mono text-xs">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <Calendar size={16} className="text-amber-400" /> Weekly Habit Tracker
            </h3>

            {/* Matrix Days Header */}
            <div className="grid grid-cols-8 gap-1 text-center font-bold text-slate-500 border-b border-slate-800 pb-2">
              <span className="col-span-3 text-left">Habit</span>
              {dayLetters.map((l, idx) => (
                <span key={idx}>{l}</span>
              ))}
            </div>

            {/* Matrix Rows */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {weeklyData.habits.slice(0, 5).map((h) => (
                <div key={h.id} className="grid grid-cols-8 gap-1 items-center font-sans text-xs">
                  <span className="col-span-3 font-bold text-slate-200 truncate">{h.name}</span>
                  {weeklyData.weekDates.map((dateStr, idx) => {
                    const hasCompleted = h.habitLogs?.some(l => l.date === dateStr && l.status === 'COMPLETED');
                    return (
                      <span key={idx} className="text-center font-mono font-bold text-xs">
                        {hasCompleted ? <strong className="text-emerald-400">✓</strong> : <span className="text-slate-600">·</span>}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* GitHub-style Monthly Heatmap */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-3 font-mono text-xs">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <Award size={16} className="text-emerald-400" /> Monthly Habit Activity Heatmap
            </h3>

            <div className="grid grid-cols-7 gap-1.5 pt-1">
              {Array.from({ length: 30 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (29 - i));
                const dStr = d.toISOString().split('T')[0];
                const count = heatmap[dStr] || 0;

                const colorClass = 
                  count >= 4 ? 'bg-emerald-400 text-slate-950 font-bold' :
                  count >= 2 ? 'bg-emerald-600/80 text-white' :
                  count === 1 ? 'bg-emerald-900/60 text-emerald-300' :
                  'bg-slate-900 border border-slate-800 text-slate-600';

                return (
                  <div
                    key={i}
                    title={`${dStr}: ${count} habit(s) completed`}
                    className={`h-7 rounded-lg flex items-center justify-center font-bold text-[10px] transition-all cursor-pointer ${colorClass}`}
                  >
                    {d.getDate()}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Creation Modal */}
      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchHabitsData}
      />

    </div>
  );
};

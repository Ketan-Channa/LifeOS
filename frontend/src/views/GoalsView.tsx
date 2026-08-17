import React, { useState, useEffect } from 'react';
import { Target, Plus, Search, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalIntelligenceCard } from '../components/goals/GoalIntelligenceCard';
import { GoalDetailDrawer } from '../components/goals/GoalDetailDrawer';
import { AddGoalModal } from '../components/modals/AddGoalModal';
import { getGoals, getGoalStats } from '../services/goals.api';
import { GoalItem, GoalStats, GoalFilterParams } from '../../../shared/types/lifeos.types';

export const GoalsView: React.FC = () => {
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [stats, setStats] = useState<GoalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal & Drawer State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<GoalFilterParams>({
    status: 'ALL',
    priority: 'ALL',
    category: 'ALL',
    search: '',
    sortBy: 'targetDate',
    sortOrder: 'asc'
  });

  const fetchGoalsAndStats = async () => {
    try {
      setIsLoading(true);
      const [goalsData, statsData] = await Promise.all([
        getGoals(filters),
        getGoalStats()
      ]);
      setGoals(goalsData);
      setStats(statsData);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalsAndStats();
  }, [filters]);

  const handleOpenDrawer = (goal: GoalItem) => {
    setSelectedGoal(goal);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="text-cyan-400" /> Goals
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Turn long-term ambitions into measurable progress.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus size={16} />}
          className="text-xs"
        >
          Create Goal
        </Button>
      </div>

      {/* 2. Goal Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">TOTAL GOALS</span>
          <p className="text-2xl font-extrabold text-white font-mono">{stats?.totalGoals || 0}</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-cyan-500/20 space-y-1">
          <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">ACTIVE</span>
          <p className="text-2xl font-extrabold text-cyan-400 font-mono">{stats?.activeGoals || 0}</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-emerald-500/20 space-y-1">
          <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">COMPLETED</span>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono">{stats?.completedGoals || 0}</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-rose-500/20 space-y-1">
          <span className="text-[10px] font-mono text-rose-400 uppercase font-semibold">OVERDUE</span>
          <p className="text-2xl font-extrabold text-rose-400 font-mono">{stats?.overdueGoals || 0}</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-indigo-500/20 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono text-indigo-400 uppercase font-semibold">AVG PROGRESS</span>
          <p className="text-2xl font-extrabold text-indigo-400 font-mono">{stats?.averageGoalProgress || 0}%</p>
        </div>
      </div>

      {/* 3. Goal Intelligence Section */}
      <GoalIntelligenceCard stats={stats} />

      {/* 4. Filter, Search & Sort Toolbar */}
      <div className="glass-card p-4 rounded-3xl space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search goals by title, description, category..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl pl-9 pr-3 py-2 border border-slate-800 focus:border-cyan-500 outline-none"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <ArrowUpDown size={14} className="text-slate-400" />
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              className="bg-slate-950 text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-800 outline-none font-mono"
            >
              <option value="targetDate">Sort by Target Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="progress">Sort by Progress</option>
              <option value="createdAt">Sort by Created Date</option>
            </select>
          </div>

        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-800/60">
          <div>
            <label className="block text-[10px] text-slate-400 font-mono mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl p-2 border border-slate-800 outline-none font-mono"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="PAUSED">Paused</option>
              <option value="ARCHIVED">Archived</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-mono mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl p-2 border border-slate-800 outline-none font-mono"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] text-slate-400 font-mono mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl p-2 border border-slate-800 outline-none font-mono"
            >
              <option value="ALL">All Categories</option>
              <option value="Career">Career</option>
              <option value="Academic">Academic</option>
              <option value="Learning">Learning</option>
              <option value="Health">Health</option>
              <option value="Finance">Finance</option>
              <option value="Personal">Personal</option>
              <option value="Project">Project</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Main Goal Grid */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-xs font-mono text-slate-400">
          Loading goal telemetry and milestone metrics...
        </div>
      ) : goals.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-card border border-slate-800 space-y-3">
          <Target size={36} className="text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No goals found.</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Start turning your ambitions into reality by creating your first goal.
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
            + Create Your First Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onClick={handleOpenDrawer} />
          ))}
        </div>
      )}

      {/* Interactive Modals & Slide-over Drawers */}
      <AddGoalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchGoalsAndStats}
      />

      <GoalDetailDrawer
        goal={selectedGoal}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdate={fetchGoalsAndStats}
      />

    </div>
  );
};

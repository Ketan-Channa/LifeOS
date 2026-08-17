import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Circle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  ArrowUpDown, 
  AlertTriangle, 
  Sparkles, 
  Zap, 
  Trash2,
  Calendar
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AddTaskModal } from '../components/modals/AddTaskModal';
import { TaskDetailDrawer } from '../components/tasks/TaskDetailDrawer';
import { TaskPostponeModal } from '../components/modals/TaskPostponeModal';
import { TaskIntelligenceCard } from '../components/tasks/TaskIntelligenceCard';
import { TaskRiskBadge } from '../components/predictive/TaskRiskBadge';
import { getTasks, getTaskStats, toggleCompleteTask } from '../services/tasks.api';
import { TaskItem, TaskStats, TaskFilterParams } from '../../../shared/types/lifeos.types';

export const TasksView: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Drawers State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTaskForDrawer, setSelectedTaskForDrawer] = useState<TaskItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTaskForPostpone, setSelectedTaskForPostpone] = useState<TaskItem | null>(null);
  const [isPostponeModalOpen, setIsPostponeModalOpen] = useState(false);

  // Filters, Search & Sort State
  const [filters, setFilters] = useState<TaskFilterParams>({
    status: 'ALL',
    priority: 'ALL',
    category: 'ALL',
    deadline: 'ALL',
    energy: 'ALL',
    search: '',
    sortBy: 'dueDate',
    sortOrder: 'asc'
  });

  const fetchTasksAndStats = async () => {
    try {
      setIsLoading(true);
      const [tasksData, statsData] = await Promise.all([
        getTasks(filters),
        getTaskStats()
      ]);
      setTasks(tasksData);
      setStats(statsData);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndStats();
  }, [filters]);

  const handleToggle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleCompleteTask(id);
    fetchTasksAndStats();
  };

  const handleOpenDrawer = (task: TaskItem) => {
    setSelectedTaskForDrawer(task);
    setIsDrawerOpen(true);
  };

  const handleOpenPostpone = (task: TaskItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedTaskForPostpone(task);
    setIsPostponeModalOpen(true);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="text-indigo-400" /> Tasks
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Organize your work, understand your workload, and stay ahead of deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled
            leftIcon={<Sparkles size={14} className="text-purple-400" />}
            className="text-xs opacity-60 cursor-not-allowed hidden sm:inline-flex"
            title="AI Prioritization unlocks in Phase 4"
          >
            AI Prioritize
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus size={16} />}
            className="text-xs"
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* 2. Task Dashboard Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">TOTAL</span>
          <p className="text-2xl font-extrabold text-white font-mono">{stats?.totalTasks || 0}</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-emerald-500/20 space-y-1">
          <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">COMPLETED</span>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono">{stats?.completedTasks || 0}</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-indigo-500/20 space-y-1">
          <span className="text-[10px] font-mono text-indigo-400 uppercase font-semibold">PENDING</span>
          <p className="text-2xl font-extrabold text-indigo-400 font-mono">{stats?.pendingTasks || 0}</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-rose-500/20 space-y-1">
          <span className="text-[10px] font-mono text-rose-400 uppercase font-semibold">OVERDUE</span>
          <p className="text-2xl font-extrabold text-rose-400 font-mono">{stats?.overdueTasks || 0}</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-amber-500/20 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">DUE TODAY</span>
          <p className="text-2xl font-extrabold text-amber-400 font-mono">{stats?.dueToday || 0}</p>
        </div>
      </div>

      {/* 3. Task Intelligence Section */}
      <TaskIntelligenceCard stats={stats} />

      {/* 4. Filter, Search & Sort Toolbar */}
      <div className="glass-card p-4 rounded-3xl space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search tasks by title, description, category..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl pl-9 pr-3 py-2 border border-slate-800 focus:border-indigo-500 outline-none"
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
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="createdAt">Sort by Created Date</option>
              <option value="estimatedMinutes">Sort by Duration</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>

        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs pt-1 border-t border-slate-800/60">
          <div>
            <label className="block text-[10px] text-slate-400 font-mono mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl p-2 border border-slate-800 outline-none font-mono"
            >
              <option value="ALL">All Statuses</option>
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
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

          <div>
            <label className="block text-[10px] text-slate-400 font-mono mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl p-2 border border-slate-800 outline-none font-mono"
            >
              <option value="ALL">All Categories</option>
              <option value="Academic">Academic</option>
              <option value="Work">Work</option>
              <option value="Project">Project</option>
              <option value="Personal">Personal</option>
              <option value="Health">Health</option>
              <option value="Finance">Finance</option>
              <option value="Learning">Learning</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-mono mb-1">Deadline</label>
            <select
              value={filters.deadline}
              onChange={(e) => setFilters({ ...filters, deadline: e.target.value as any })}
              className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl p-2 border border-slate-800 outline-none font-mono"
            >
              <option value="ALL">All Deadlines</option>
              <option value="TODAY">Today</option>
              <option value="TOMORROW">Tomorrow</option>
              <option value="THIS_WEEK">This Week</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] text-slate-400 font-mono mb-1">Energy Level</label>
            <select
              value={filters.energy}
              onChange={(e) => setFilters({ ...filters, energy: e.target.value })}
              className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl p-2 border border-slate-800 outline-none font-mono"
            >
              <option value="ALL">All Energy Levels</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Main Task List */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-xs font-mono text-slate-400">
          Loading task telemetry...
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-card border border-slate-800 space-y-3">
          <CheckSquare size={36} className="text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">
            {filters.deadline === 'OVERDUE' ? "You're all caught up!" : 'No tasks found.'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {filters.deadline === 'OVERDUE'
              ? 'No overdue deadline risks detected in your workspace.'
              : 'Start organizing your day by creating your first task.'}
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
            + Create Your First Task
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            return (
              <div
                key={task.id}
                onClick={() => handleOpenDrawer(task)}
                className={`p-4 rounded-2xl glass-card border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  isCompleted
                    ? 'bg-slate-950/40 border-slate-800 opacity-60'
                    : 'border-slate-800 hover:border-indigo-500/40'
                }`}
              >
                {/* Left Task Content */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={(e) => handleToggle(task.id, e)}
                    title={isCompleted ? 'Mark as Todo' : 'Mark as Completed'}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors pt-0.5 shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={22} className="text-emerald-400" />
                    ) : (
                      <Circle size={22} className="text-slate-500" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`font-bold text-slate-900 dark:text-slate-100 text-sm ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                        {task.title}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {task.category}
                      </span>
                      {/* Predictive Task Risk Badge */}
                      {!isCompleted && <TaskRiskBadge prediction={task.riskPrediction} />}
                    </div>

                    {task.description && (
                      <p className="text-slate-400 text-xs line-clamp-1">{task.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-indigo-400" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'No Due Date'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" />
                        Est. {task.estimatedMinutes}m {task.actualMinutes > 0 && `(Act. ${task.actualMinutes}m)`}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <Zap size={12} /> {task.energyLevel} Energy
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Badges & Postpone Trigger */}
                <div className="flex items-center gap-2 justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                  <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold ${getPriorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>

                  <button
                    onClick={(e) => handleOpenPostpone(task, e)}
                    title="Postpone Task"
                    className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/30 text-slate-400 hover:text-amber-300 text-[11px] font-mono transition-colors flex items-center gap-1"
                  >
                    <Clock size={12} /> Postpone
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Modals & Slide-over Drawers */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchTasksAndStats}
      />

      <TaskDetailDrawer
        task={selectedTaskForDrawer}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdate={fetchTasksAndStats}
        onOpenPostpone={(t) => {
          setIsDrawerOpen(false);
          handleOpenPostpone(t);
        }}
      />

      <TaskPostponeModal
        task={selectedTaskForPostpone}
        isOpen={isPostponeModalOpen}
        onClose={() => setIsPostponeModalOpen(false)}
        onSuccess={fetchTasksAndStats}
      />

    </div>
  );
};

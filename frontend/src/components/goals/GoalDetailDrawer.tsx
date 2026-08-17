import React, { useState, useEffect } from 'react';
import { 
  X, 
  Target, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  ListTodo, 
  History, 
  Plus, 
  Pause, 
  Check, 
  Archive, 
  Trash2, 
  Clock, 
  TrendingUp, 
  AlertTriangle 
} from 'lucide-react';
import { Button } from '../ui/Button';
import { AddMilestoneModal } from '../modals/AddMilestoneModal';
import { GoalRiskCard } from '../predictive/GoalRiskCard';
import { 
  getGoalById, 
  updateGoalProgress, 
  completeGoal, 
  pauseGoal, 
  archiveGoal, 
  deleteGoal 
} from '../../services/goals.api';
import { getGoalRisk } from '../../services/predictions.api';
import { 
  completeMilestone, 
  reopenMilestone, 
  deleteMilestone 
} from '../../services/milestones.api';
import { GoalItem, GoalRiskPrediction } from '../../../../shared/types/lifeos.types';

interface GoalDetailDrawerProps {
  goal: GoalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const GoalDetailDrawer: React.FC<GoalDetailDrawerProps> = ({
  goal: initialGoal,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [goal, setGoal] = useState<GoalItem | null>(initialGoal);
  const [prediction, setPrediction] = useState<GoalRiskPrediction | null>(null);
  const [activeTab, setActiveTab] = useState<'milestones' | 'tasks' | 'history'>('milestones');
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [progressVal, setProgressVal] = useState(0);

  const fetchLatestGoal = async () => {
    if (!initialGoal) return;
    try {
      const [refreshed, riskData] = await Promise.all([
        getGoalById(initialGoal.id),
        getGoalRisk(initialGoal.id).catch(() => null)
      ]);
      setGoal(refreshed);
      setPrediction(riskData);
      setProgressVal(refreshed.progress);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setGoal(initialGoal);
    if (initialGoal) {
      setProgressVal(initialGoal.progress);
      fetchLatestGoal();
    }
  }, [initialGoal]);

  if (!isOpen || !goal) return null;

  const handleToggleMilestone = async (mId: string, isCompleted: boolean) => {
    if (isCompleted) {
      await reopenMilestone(mId);
    } else {
      await completeMilestone(mId);
    }
    await fetchLatestGoal();
    onUpdate();
  };

  const handleDeleteMilestone = async (mId: string) => {
    await deleteMilestone(mId);
    await fetchLatestGoal();
    onUpdate();
  };

  const handleSaveProgress = async () => {
    await updateGoalProgress(goal.id, progressVal);
    setIsEditingProgress(false);
    await fetchLatestGoal();
    onUpdate();
  };

  const handleCompleteGoal = async () => {
    await completeGoal(goal.id);
    await fetchLatestGoal();
    onUpdate();
  };

  const handlePauseGoal = async () => {
    await pauseGoal(goal.id);
    await fetchLatestGoal();
    onUpdate();
  };

  const handleArchiveGoal = async () => {
    await archiveGoal(goal.id);
    await fetchLatestGoal();
    onUpdate();
  };

  const handleDeleteGoal = async () => {
    if (window.confirm('Are you sure you want to delete this goal and all associated milestones?')) {
      await deleteGoal(goal.id);
      onUpdate();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl glass-card bg-slate-950/90 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                  {goal.category}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                  {goal.priority}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                  {goal.status}
                </span>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Target size={22} className="text-cyan-400" /> {goal.title}
              </h2>
              {goal.description && (
                <p className="text-xs text-slate-400">{goal.description}</p>
              )}
            </div>

            {/* Goal ML Risk Prediction Card */}
            <GoalRiskCard prediction={prediction} />

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 text-xs font-mono p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Target Countdown</span>
                <p className={`font-bold ${goal.isOverdue ? 'text-rose-400' : 'text-slate-200'}`}>
                  {goal.targetDate ? (goal.isOverdue ? `${Math.abs(goal.daysRemaining || 0)}d overdue` : `${goal.daysRemaining} days left`) : 'No target'}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase">Goal Velocity</span>
                <p className="font-bold text-cyan-400">+{goal.velocity || 0}% / day</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase">Risk Assessment</span>
                <p className={`font-bold ${goal.riskEstimate === 'HIGH' ? 'text-rose-400' : goal.riskEstimate === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {goal.riskEstimate || 'LOW'} RISK
                </p>
              </div>
            </div>

            {/* Progress Slider Bar */}
            <div className="space-y-2 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Milestone Goal Progress</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{goal.progress}%</span>
                  <button
                    onClick={() => setIsEditingProgress(!isEditingProgress)}
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    {isEditingProgress ? 'Cancel' : 'Edit'}
                  </button>
                </div>
              </div>

              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, goal.progress))}%` }}
                />
              </div>

              {isEditingProgress && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressVal}
                    onChange={(e) => setProgressVal(Number(e.target.value))}
                    className="flex-1 accent-cyan-500"
                  />
                  <Button variant="primary" size="sm" onClick={handleSaveProgress} className="text-xs py-1">
                    Save {progressVal}%
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
              {goal.status !== 'COMPLETED' && (
                <Button variant="outline" size="sm" onClick={handleCompleteGoal} leftIcon={<Check size={14} className="text-emerald-400" />}>
                  Complete
                </Button>
              )}
              {goal.status === 'ACTIVE' ? (
                <Button variant="outline" size="sm" onClick={handlePauseGoal} leftIcon={<Pause size={14} className="text-amber-400" />}>
                  Pause
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handlePauseGoal} leftIcon={<Check size={14} className="text-cyan-400" />}>
                  Resume
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleArchiveGoal} leftIcon={<Archive size={14} className="text-slate-400" />}>
                Archive
              </Button>
              <Button variant="danger" size="sm" onClick={handleDeleteGoal} leftIcon={<Trash2 size={14} />}>
                Delete
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800 text-xs font-mono pt-2">
              <button
                onClick={() => setActiveTab('milestones')}
                className={`py-2 px-4 border-b-2 font-bold transition-colors ${
                  activeTab === 'milestones'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Milestones ({goal.milestones ? goal.milestones.length : 0})
              </button>

              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-2 px-4 border-b-2 font-bold transition-colors ${
                  activeTab === 'tasks'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Linked Tasks ({goal.tasks ? goal.tasks.length : 0})
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 px-4 border-b-2 font-bold transition-colors ${
                  activeTab === 'history'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Goal History ({goal.goalHistories ? goal.goalHistories.length : 0})
              </button>
            </div>
          </div>

          {/* Tab Content Area */}
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            
            {/* 1. MILESTONES TAB */}
            {activeTab === 'milestones' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Goal Target Milestones</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddMilestoneOpen(true)}
                    leftIcon={<Plus size={14} />}
                    className="text-xs py-1"
                  >
                    Add Milestone
                  </Button>
                </div>

                {!goal.milestones || goal.milestones.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 space-y-2">
                    <CheckCircle2 size={28} className="text-slate-600 mx-auto" />
                    <p>No milestones created yet. Add target steps to automatically drive goal progress.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {goal.milestones.map((m, idx) => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-2xl glass-card border flex items-center justify-between gap-3 text-xs ${
                          m.completed ? 'bg-slate-950/40 border-slate-800/80 opacity-70' : 'border-slate-800'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <button
                            onClick={() => handleToggleMilestone(m.id, m.completed)}
                            className="pt-0.5 text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            {m.completed ? (
                              <CheckCircle2 size={20} className="text-emerald-400" />
                            ) : (
                              <Circle size={20} className="text-slate-500" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-slate-500">#{idx + 1}</span>
                              <h4 className={`font-bold text-slate-100 ${m.completed ? 'line-through text-slate-500' : ''}`}>
                                {m.title}
                              </h4>
                            </div>
                            {m.description && (
                              <p className="text-[11px] text-slate-400 line-clamp-1">{m.description}</p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteMilestone(m.id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. LINKED TASKS TAB */}
            {activeTab === 'tasks' && (
              <div className="space-y-3">
                <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Associated Tasks</span>

                {!goal.tasks || goal.tasks.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 space-y-2">
                    <ListTodo size={28} className="text-slate-600 mx-auto" />
                    <p>No tasks associated with this goal yet. Select this goal when creating tasks in your workspace.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {goal.tasks.map((t) => (
                      <div key={t.id} className="p-3 rounded-2xl glass-card border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-200">{t.title}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                            {t.status}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-400">
                          Category: {t.category} • Priority: {t.priority} • Est: {t.estimatedMinutes}m
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. GOAL HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="space-y-3">
                <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Goal History Audit Trail</span>

                {!goal.goalHistories || goal.goalHistories.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 space-y-2">
                    <History size={28} className="text-slate-600 mx-auto" />
                    <p>No audit events recorded for this goal yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3 relative pl-4 border-l border-slate-800">
                    {goal.goalHistories.map((h) => (
                      <div key={h.id} className="relative text-xs space-y-0.5">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-500 border border-slate-900" />
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-bold text-cyan-400">{h.action}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(h.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {h.previousProgress !== null && h.newProgress !== null && (
                          <p className="text-slate-400 font-mono text-[11px]">
                            Progress: {h.previousProgress}% → <strong className="text-white">{h.newProgress}%</strong>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 text-center text-[11px] font-mono text-slate-500">
            LifeOS Goal Telemetry Kernel • Updated {new Date(goal.updatedAt).toLocaleDateString()}
          </div>

        </div>
      </div>

      <AddMilestoneModal
        goalId={goal.id}
        isOpen={isAddMilestoneOpen}
        onClose={() => setIsAddMilestoneOpen(false)}
        onSuccess={async () => {
          await fetchLatestGoal();
          onUpdate();
        }}
      />
    </div>
  );
};

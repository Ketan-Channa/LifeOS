import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, Tag, AlertTriangle, History, Trash2, Edit3, CheckCircle2, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { TaskTimer } from './TaskTimer';
import { TaskRiskPanel } from '../predictive/TaskRiskPanel';
import { deleteTask, getTaskHistory } from '../../services/tasks.api';
import { getTaskRisk } from '../../services/predictions.api';
import { TaskItem, TaskHistoryItem, TaskRiskPrediction } from '../../../../shared/types/lifeos.types';

interface TaskDetailDrawerProps {
  task: TaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onOpenPostpone: (task: TaskItem) => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  onOpenPostpone
}) => {
  const [history, setHistory] = useState<TaskHistoryItem[]>([]);
  const [prediction, setPrediction] = useState<TaskRiskPrediction | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (task && isOpen) {
      setIsLoadingHistory(true);
      Promise.all([
        getTaskHistory(task.id).catch(() => []),
        getTaskRisk(task.id).catch(() => null)
      ]).then(([histData, riskData]) => {
        setHistory(histData);
        setPrediction(riskData);
        setIsLoadingHistory(false);
      });
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task and its history?')) {
      await deleteTask(task.id);
      onUpdate();
      onClose();
    }
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm select-none">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-950 border-l border-slate-800 p-6 flex flex-col justify-between overflow-y-auto space-y-6 shadow-2xl">
          
          {/* Top Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold ${getPriorityBadge(task.priority)}`}>
                  {task.priority}
                </span>
                <span className="text-xs font-mono text-slate-400">{task.category}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenPostpone(task)}
                  title="Postpone Task"
                  className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-bold flex items-center gap-1 hover:bg-amber-500/20"
                >
                  <Clock size={13} /> Postpone
                </button>

                <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200 rounded-lg">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Task Title & Description */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{task.title}</h2>
              {task.description && (
                <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
                  {task.description}
                </p>
              )}
            </div>

            {/* Live Execution Timer Widget */}
            <TaskTimer task={task} onUpdate={onUpdate} />

            {/* Predictive ML Panel */}
            <TaskRiskPanel prediction={prediction} />

            {/* Attributes Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Estimated vs Actual</span>
                <p className="font-mono text-indigo-400 font-bold">
                  {task.estimatedMinutes}m est / <span className="text-emerald-400">{task.actualMinutes}m act</span>
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Energy Level</span>
                <p className="font-mono text-amber-400 font-bold flex items-center gap-1">
                  <Zap size={13} /> {task.energyLevel}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Due Date</span>
                <p className="font-mono text-slate-200">
                  {task.dueDate ? new Date(task.dueDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No due date'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Status</span>
                <p className="font-mono text-cyan-400 font-bold">{task.status}</p>
              </div>
            </div>

            {/* Task History Audit Trail Timeline */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <History size={16} className="text-indigo-400" /> TASK HISTORY AUDIT TRAIL
              </h3>

              {isLoadingHistory ? (
                <p className="text-xs font-mono text-slate-500">Loading audit trail...</p>
              ) : history.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No history records found.</p>
              ) : (
                <div className="space-y-2 border-l-2 border-slate-800 pl-3">
                  {history.map((item) => (
                    <div key={item.id} className="text-[11px] space-y-0.5">
                      <div className="flex items-center justify-between text-slate-300 font-mono">
                        <span className="font-bold text-indigo-400">{item.action}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(item.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {item.previousDueDate && item.newDueDate && (
                        <p className="text-slate-500 text-[10px]">
                          Due: {new Date(item.previousDueDate).toLocaleDateString()} → {new Date(item.newDueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handleDelete}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1.5"
            >
              <Trash2 size={16} /> Delete Task
            </button>

            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};

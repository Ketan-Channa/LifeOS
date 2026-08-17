import React, { useState, useEffect } from 'react';
import { X, Plus, CheckSquare } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { createTask } from '../../services/tasks.api';
import { getGoals } from '../../services/goals.api';
import { Priority, GoalItem } from '../../../../shared/types/lifeos.types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Development',
    priority: 'MEDIUM' as Priority,
    dueDate: '',
    estimatedMinutes: 30,
    goalId: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      getGoals({ status: 'ACTIVE' })
        .then(data => setGoals(data))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      await createTask({
        ...formData,
        goalId: formData.goalId || undefined
      });
      setIsLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Failed to create task');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-indigo-400">
            <CheckSquare size={20} />
            <h3 className="text-base font-bold text-white">Add New Task</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {error && <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <Input
            label="Task Title"
            placeholder="e.g. Complete System Design Document"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-slate-300 font-medium mb-1">Description (Optional)</label>
            <textarea
              placeholder="Task context, requirements, links..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl p-3 border border-slate-800 focus:border-indigo-500 outline-none h-20 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Link to Goal (Optional)</label>
            <select
              value={formData.goalId}
              onChange={(e) => setFormData({ ...formData, goalId: e.target.value })}
              className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl p-2.5 border border-slate-800 focus:border-indigo-500 outline-none font-mono"
            >
              <option value="">No Linked Goal (Standalone Task)</option>
              {goals.map(g => (
                <option key={g.id} value={g.id}>
                  🎯 {g.title} ({g.progress}%)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl p-2.5 border border-slate-800 focus:border-indigo-500 outline-none"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Est. Duration (Mins)</label>
              <input
                type="number"
                value={formData.estimatedMinutes}
                onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) || 30 })}
                className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl p-2.5 border border-slate-800 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <Input
            label="Due Date & Time"
            type="datetime-local"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading} leftIcon={<Plus size={16} />}>
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

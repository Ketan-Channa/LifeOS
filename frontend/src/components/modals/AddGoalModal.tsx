import React, { useState } from 'react';
import { Target, X, Calendar, Flag, AlertCircle, Layers } from 'lucide-react';
import { Button } from '../ui/Button';
import { createGoal } from '../../services/goals.api';
import { Priority } from '../../../../shared/types/lifeos.types';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultTargetStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Career');
  const [priority, setPriority] = useState<Priority>('HIGH');
  const [startDate, setStartDate] = useState(todayStr);
  const [targetDate, setTargetDate] = useState(defaultTargetStr);
  const [progress, setProgress] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Goal title is required');
      return;
    }

    if (!targetDate) {
      setError('Target date is required');
      return;
    }

    if (new Date(targetDate) < new Date(startDate)) {
      setError('Target date cannot be earlier than start date');
      return;
    }

    try {
      setIsSubmitting(true);
      await createGoal({
        title: title.trim(),
        description: description.trim() || null,
        category,
        priority,
        startDate: new Date(startDate).toISOString(),
        targetDate: new Date(targetDate).toISOString(),
        progress: Number(progress) || 0,
        status: progress >= 100 ? 'COMPLETED' : 'ACTIVE'
      });
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.response?.data?.message || err.message || 'Failed to create goal');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-lg rounded-3xl p-6 border border-slate-800 space-y-5 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Target size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Goal</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Turn long-term ambitions into measurable progress</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block font-mono text-slate-400 mb-1">Goal Title *</label>
            <input
              type="text"
              placeholder="e.g. Become Job Ready"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-800 focus:border-cyan-500 outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-mono text-slate-400 mb-1">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Describe your roadmap and objectives..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 rounded-xl px-3.5 py-2 border border-slate-800 focus:border-cyan-500 outline-none resize-none"
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 rounded-xl p-2.5 border border-slate-800 outline-none font-mono"
              >
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

            <div>
              <label className="block font-mono text-slate-400 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-slate-950 text-slate-200 rounded-xl p-2.5 border border-slate-800 outline-none font-mono"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {/* Start Date & Target Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-slate-400 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 rounded-xl p-2.5 border border-slate-800 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-mono text-slate-400 mb-1">Target Date *</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 rounded-xl p-2.5 border border-slate-800 outline-none font-mono"
                required
              />
            </div>
          </div>

          {/* Initial Progress Slider */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center font-mono">
              <label className="text-slate-400">Initial Progress</label>
              <span className="font-bold text-cyan-400">{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500 border border-slate-800"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Create Goal
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};
